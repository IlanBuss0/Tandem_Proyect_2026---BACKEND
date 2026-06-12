import BD from '../src/db/BD.js';
import {
  PERTENECIENTE_PERMISSIONS,
  PROFESIONAL_PERMISSIONS,
} from '../src/modules/security/permissions.constants.js';

const pertenecientePermissions = [
  PERTENECIENTE_PERMISSIONS.EDITAR_PERFIL,
  PERTENECIENTE_PERMISSIONS.EDITAR_PERFIL_SENSIBLE,
  PERTENECIENTE_PERMISSIONS.COMPLETAR_ACTIVIDADES,
  PERTENECIENTE_PERMISSIONS.ENVIAR_MENSAJES,
  PERTENECIENTE_PERMISSIONS.CHATEAR_CON_PROFESIONAL,
  PERTENECIENTE_PERMISSIONS.CREAR_ACTIVIDADES_PROPIAS,
  PERTENECIENTE_PERMISSIONS.COMPARTIR_UBICACION,
  PERTENECIENTE_PERMISSIONS.GASTAR_PUNTOS,
  PERTENECIENTE_PERMISSIONS.USAR_MI_DIA,
  PERTENECIENTE_PERMISSIONS.USAR_CALENDARIO,
  PERTENECIENTE_PERMISSIONS.REGISTRAR_EMOCIONES,
  PERTENECIENTE_PERMISSIONS.USAR_PICTOGRAMAS,
];

const profesionalPermissions = [
  PROFESIONAL_PERMISSIONS.ASIGNAR_ACTIVIDADES,
  PROFESIONAL_PERMISSIONS.CREAR_ACTIVIDADES_PERSONALIZADAS,
  PROFESIONAL_PERMISSIONS.VER_HISTORIAL,
  PROFESIONAL_PERMISSIONS.VER_UBICACION,
  PROFESIONAL_PERMISSIONS.AGENDAR_SESIONES,
  PROFESIONAL_PERMISSIONS.ENVIAR_MENSAJES,
  PROFESIONAL_PERMISSIONS.EDITAR_PERFIL_PROFESIONAL,
];

async function seedCatalog(tableName, permissions) {
  let inserted = 0;

  for (const [index, nombre] of permissions.entries()) {
    const result = await BD.queryOne(
      `
        INSERT INTO ${tableName} (nombre, orden)
        SELECT $1::text, $2::int
        WHERE NOT EXISTS (
          SELECT 1
          FROM ${tableName}
          WHERE LOWER(nombre) = LOWER($1::text)
        )
        RETURNING id
      `,
      [nombre, (index + 1) * 10],
    );

    if (result?.id) inserted += 1;
  }

  return inserted;
}

try {
  const insertedPerteneciente = await seedCatalog('catalogo_permisos_pertenecientes', pertenecientePermissions);
  const insertedProfesional = await seedCatalog('catalogo_permisos_profesionales', profesionalPermissions);

  console.log(JSON.stringify({
    ok: true,
    inserted: {
      catalogo_permisos_pertenecientes: insertedPerteneciente,
      catalogo_permisos_profesionales: insertedProfesional,
    },
  }, null, 2));
} finally {
  await BD.pool.end();
}
