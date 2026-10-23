import test from 'node:test';
import assert from 'node:assert/strict';
import { assertStudioEquipment, studioCatalog, studioFreeCodes } from '../src/modules/avatar-studio.js';
import ItemAvatarRepository from '../src/repositories/ItemAvatarRepository.js';
import BD from '../src/db/BD.js';
import AvatarService from '../src/services/AvatarService.js';
import { existsSync, readFileSync } from 'node:fs';

const config={skinTone:'warm',hairstyle:'swept',hairColor:'chestnut',eyeColor:'hazel',top:'hoodie',bottom:'jeans',shoes:'white',accessory:'none'};
const payload=(next={})=>{const c={...config,...next};return {version:2,config:c,equipped:Object.fromEntries(['top','bottom','shoes','accessory'].map(key=>[key,`${key}:${c[key]}`]))};};
test('studio permits starters and existing receipts, rejects unowned clothes',()=>{
  assert.doesNotThrow(()=>assertStudioEquipment(payload(),[]));
  assert.throws(()=>assertStudioEquipment(payload({top:'tee-black'}),[]),{statusCode:403});
  assert.doesNotThrow(()=>assertStudioEquipment(payload({top:'tee-black'}),['top:tee-black']));
  assert.doesNotThrow(()=>assertStudioEquipment(payload({top:'tee-green'}),['shirt-green']));
});
test('studio validates both visual configuration and equipment categories',()=>{
  assert.throws(()=>assertStudioEquipment(payload({skinTone:'invalid'}),[]),{statusCode:400});
  assert.throws(()=>assertStudioEquipment(payload({shoes:'missing'}),[]),{statusCode:400});
  const forged=payload();forged.equipped.top='top:tee-black';
  assert.throws(()=>assertStudioEquipment(forged,[]),{statusCode:400});
});
test('hairstyles require ownership and cannot be smuggled through a physical setting',()=>{
  const p=payload({base:'feminine',hairstyle:'bun'});p.equipped.hairstyle='hairstyle:bun';
  assert.throws(()=>assertStudioEquipment(p,[]),{statusCode:403});
  assert.doesNotThrow(()=>assertStudioEquipment(p,['hairstyle:bun']));
  delete p.equipped.hairstyle;assert.throws(()=>assertStudioEquipment(p,['hairstyle:bun']),{statusCode:400});
  assert.doesNotThrow(()=>assertStudioEquipment(payload(),[]),'previous free hairstyles and missing base remain compatible');
  assert.throws(()=>assertStudioEquipment(payload({base:'unknown'}),[]),{statusCode:400});
});
const frontendCatalog=new URL('../../tandem-connections_2026/src/features/avatar/avatarWardrobe.json',import.meta.url);
test('frontend and backend wardrobe contracts match',{skip:!existsSync(frontendCatalog)},()=>{
  assert.deepEqual(studioCatalog,JSON.parse(readFileSync(frontendCatalog,'utf8')));
});
test('saving a studio avatar does not regenerate or overwrite a custom photo',async t=>{
  const service=new AvatarService();let generated=0;
  t.mock.method(service.AvatarImageStorageService,'cacheAvatarImageAsync',async()=>{generated++;});
  await service.cacheAvatarImageBestEffortAsync({avatar_json:JSON.stringify(payload()),avatar_imagen_origen_url:'https://example.test/custom-photo.jpg'});
  assert.equal(generated,0);
});
test('catalog initialization adds missing entries without changing historical prices or receipts',async t=>{
  const queries=[];
  t.mock.method(BD,'transaction',async callback=>callback({query:async(sql,values)=>{
    queries.push({sql,values});return {rows:sql.startsWith('SELECT id, nombre')?[{id:2,nombre:'Ropa'},{id:3,nombre:'Accesorio'},{id:8,nombre:'Peinados'}]:[]};
  }}));
  await new ItemAvatarRepository().ensureStudioCatalogAsync(studioCatalog);
  assert.match(queries[0].sql,/pg_advisory_xact_lock/);
  const inserts=queries.filter(q=>q.sql.includes('INSERT INTO items_avatares'));
  assert.equal(inserts.length,studioCatalog.length);
  assert.ok(inserts.every(q=>q.sql.includes('WHERE NOT EXISTS')));
  assert.ok(inserts.every(q=>q.sql.includes('codigo_item_externo=$5') && q.values.length===5 && q.values[2]===q.values[4]),
    'inserted code and existence lookup use equal values with independent PostgreSQL type inference');
  assert.ok(queries.every(q=>!/^\s*(UPDATE|DELETE|ALTER)/i.test(q.sql)));
  assert.equal(new Set(studioCatalog.map(item=>item.id)).size,studioCatalog.length);
  assert.ok(studioFreeCodes.includes('shoes:white'));
  for(const entry of inserts.filter(q=>q.values[2].startsWith('hairstyle:'))) assert.equal(entry.values[0],8);
});
test('initialization adds the hair category when missing, without changing existing types',async t=>{
  let added=0;
  t.mock.method(BD,'transaction',async callback=>callback({query:async(sql,values)=>{
    if(sql.startsWith('SELECT id, nombre')) return {rows:[{id:2,nombre:'Ropa'}]};
    if(sql.startsWith('INSERT INTO tipos_items_avatares')) {added++;return {rows:[{id:8,nombre:'Peinados'}]};}
    if(sql.includes('INSERT INTO items_avatares')) assert.equal(values[0],8);
    return {rows:[]};
  }}));
  await new ItemAvatarRepository().ensureStudioCatalogAsync(studioCatalog.filter(item=>item.category==='hairstyle'));
  assert.equal(added,1);
});
