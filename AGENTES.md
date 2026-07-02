# AGENTS.md — TÁNDEM 2026 Backend

Este archivo define cómo debe trabajar cualquier agente de IA sobre el backend de TÁNDEM.

Repositorio backend:

```txt
IlanBuss0/Tandem_Proyect_2026---BACKEND
```

Repositorio frontend relacionado:

```txt
IlanBuss0/tandem-connections_2026
```

TÁNDEM es una plataforma orientada a promover la autonomía cotidiana de personas con TEA mediante rutinas guiadas, actividades, pictogramas, accesibilidad, gamificación, chat, seguimiento familiar, acompañamiento profesional, notificaciones y geolocalización.

La persona con TEA, también llamada perteneciente dentro del sistema, debe ser siempre el centro de la experiencia. Tutores, familiares y profesionales acompañan, monitorean y ayudan, pero no reemplazan la autonomía del usuario principal.

---

## 1. Stack del backend

El backend usa:

* Node.js con ES Modules.
* Express.
* PostgreSQL con `pg`.
* JWT.
* Cookies HTTP.
* CSRF.
* CORS.
* Helmet.
* Redis.
* BullMQ.
* Socket.IO.
* Swagger.
* Multer.
* Sharp.
* ARASAAC API.
* DiceBear.
* Workers y jobs.

Comandos principales:

```bash
npm install
npm run server
```

Scripts útiles:

```bash
npm run worker:notifications
npm run seed:permissions
npm run sync:pictograms
npm run db:chat-schema
npm run db:pictograms
npm run db:routine-reminders
npm run test:chat-flow
npm run test:chat-sync-flow
npm run test:permission-context-flow
npm run test:resource-authorization-flow
npm run test:chat-permission-enforcement
npm run test:pictogram-search
```

---

## 2. Arquitectura obligatoria

El backend debe respetar esta separación:

```txt
Controller → Service → Repository → DB
```

### Controller

El controller debe:

* Definir rutas Express.
* Leer `req.params`, `req.query` y `req.body`.
* Obtener el usuario autenticado desde `req.user.id`.
* Validar parámetros básicos.
* Llamar al service correspondiente.
* Devolver status HTTP correcto.
* Pasar errores a `next(error)` cuando sea posible.

El controller no debe:

* Tener SQL.
* Tener lógica de negocio pesada.
* Resolver permisos complejos directamente.
* Emitir lógica realtime compleja si eso corresponde al service.

Ejemplo correcto:

```js
router.post('', async (req, res, next) => {
  try {
    const idUsuario = req.user.id;
    const result = await currentService.createForUserAsync(idUsuario, req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});
```

### Service

El service debe:

* Contener la lógica de negocio.
* Validar reglas funcionales.
* Validar permisos con `AuthorizationService`.
* Coordinar repositories.
* Crear notificaciones si corresponde.
* Emitir eventos realtime si corresponde.
* Invalidar cache si corresponde.
* Manejar workers o queues cuando corresponda.

### Repository

El repository debe:

* Ser la única capa con SQL directo.
* Usar queries parametrizadas.
* Usar `BD.query`, `BD.queryOne` o `BD.execute`.
* No conocer Express.
* No recibir `req`.
* No validar permisos.
* No emitir sockets.

Ejemplo correcto:

```js
const sql = `
  SELECT *
  FROM actividades
  WHERE id = $1
`;

return await BD.queryOne(sql, [id]);
```

Ejemplo prohibido:

```js
const sql = `SELECT * FROM actividades WHERE id = ${id}`;
```

---

## 3. Regla central de autenticación

Cuando el backend necesite saber quién es el usuario actual, siempre debe usar el JWT.

En endpoints HTTP:

```js
const idUsuario = req.user.id;
```

El `authMiddleware` valida el token desde la cookie y deja el usuario en:

```js
req.user
```

Por lo tanto:

* No confiar en `id_usuario` enviado desde el frontend.
* No usar `req.body.id_usuario` como fuente de verdad.
* No usar `req.query.id_usuario` como fuente de verdad para datos sensibles.
* Si por compatibilidad llega un `id_usuario`, debe validarse contra `req.user.id` o con `AuthorizationService`.
* Toda acción sensible debe estar asociada al usuario autenticado real.

Ejemplo correcto:

```js
router.get('/mine', async (req, res, next) => {
  try {
    const result = await currentService.getMineAsync(req.user.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});
```

Ejemplo incorrecto:

```js
router.get('/mine', async (req, res) => {
  const result = await currentService.getMineAsync(req.body.id_usuario);
  res.json(result);
});
```

---

## 4. Autorización y permisos

Autenticación responde:

```txt
¿Quién sos?
```

Autorización responde:

```txt
¿Qué podés hacer?
```

No alcanza con que el usuario esté logueado. Para datos sensibles o acciones importantes, siempre validar permisos.

Usar:

```js
AuthorizationService
```

Especialmente para:

* Pertenecientes.
* Tutores.
* Profesionales.
* Chat.
* Mensajes.
* Archivos.
* Ubicación.
* Zonas seguras.
* Actividades asignadas.
* Emociones.
* Historial.
* Perfil.
* Permisos.
* Vínculos.
* Notificaciones sensibles.

Ejemplo:

```js
await AuthorizationService.assertCanAccessDispositivoLocation(
  req.user.id,
  idDispositivo,
  'read'
);
```

Ejemplo para escritura:

```js
await AuthorizationService.assertCanAccessDispositivoLocation(
  req.user.id,
  idDispositivo,
  'write'
);
```

La regla general para datos sensibles es:

```txt
JWT → req.user.id → AuthorizationService → Service → Repository
```

No saltar esta cadena.

---

## 5. Datos sensibles

Se consideran datos sensibles:

* Ubicación.
* Emociones.
* Archivos.
* Chat.
* Mensajes.
* Historial.
* Perfil del perteneciente.
* Datos profesionales.
* Permisos.
* Vínculos familiares.
* Vínculos profesionales.
* Configuración de accesibilidad.
* Zonas seguras.

Antes de leer, modificar o exponer estos datos:

1. Validar usuario autenticado.
2. Validar vínculo o permiso.
3. Devolver solo lo necesario.
4. No confiar en IDs enviados desde frontend.
5. No exponer datos de otro usuario sin autorización.

---

## 6. Socket.IO

Usar Socket.IO para funcionalidades en tiempo real.

Actualmente o próximamente, esto incluye:

* Chat.
* Mensajes.
* Escritura en tiempo real.
* Notificaciones.
* Actualización de permisos.
* Ubicación en vivo.
* Alertas de zonas seguras.
* Eventos importantes que otro usuario deba ver sin refrescar.

No usar Socket.IO para todo. Usar HTTP cuando sea una consulta normal o una acción puntual que no necesita realtime.

### Usar HTTP para:

* Cargar datos iniciales.
* Listados.
* Historial.
* Crear, editar o eliminar entidades.
* Sincronización inicial.
* Consultas paginadas.
* Marcar notificaciones como leídas.

### Usar Socket.IO para:

* Recibir nuevos mensajes.
* Avisar que alguien está escribiendo.
* Recibir notificaciones nuevas.
* Avisar cambios de chat.
* Avisar cambios de permisos.
* Recibir ubicación en vivo.
* Avisar entrada o salida de zona segura.

---

## 7. Autenticación en Socket.IO

En Socket.IO tampoco se debe confiar en `id_usuario` enviado desde frontend.

El socket obtiene el JWT desde la cookie, lo valida y guarda el usuario en:

```js
socket.data.user
```

Para obtener el usuario actual:

```js
const idUsuario = socket.data.user.id;
```

Ejemplo correcto:

```js
socket.on('message:send', async (payload, callback) => {
  const idUsuario = socket.data.user.id;

  const message = await mensajeService.createFromUserAsync({
    id_chat: payload.id_chat,
    id_usuario_emisor: idUsuario,
    id_tipo_mensaje: payload.id_tipo_mensaje || 1,
    contenido: payload.contenido,
    fecha_envio: new Date(),
  });

  callback({ ok: true, data: message });
});
```

Ejemplo incorrecto:

```js
socket.on('message:send', async (payload) => {
  const idUsuario = payload.id_usuario_emisor;
});
```

---

## 8. Rooms de Socket.IO

Usar rooms para enviar eventos a usuarios o chats.

Convenciones actuales:

```txt
user:${idUsuario}
chat:${idChat}
```

Usar los helpers existentes:

```js
userRoom(idUsuario)
chatRoom(idChat)
```

Para emitir a un usuario:

```js
emitToUser(idUsuario, 'notification:new', payload);
```

Para emitir a un chat:

```js
emitToChat(idChat, 'message:new', message);
```

No armar nombres de rooms manualmente si ya existe helper.

---

## 9. Eventos de Socket.IO

Eventos cliente → servidor:

```txt
chat:join
chat:leave
message:send
message:typing
```

Eventos servidor → cliente:

```txt
message:new
message:typing
chat:new
chat:updated
message:updated
message:deleted
chat:read
notification:new
permisos:updated
```

Para futuras funcionalidades de ubicación:

Cliente → servidor:

```txt
location:update
location:watch
location:unwatch
```

Servidor → cliente:

```txt
location:updated
location:entered-safe-zone
location:left-safe-zone
location:alert
```

---

## 10. Chat y mensajes

El chat usa:

* HTTP para cargar conversaciones y mensajes previos.
* Socket.IO para eventos realtime.
* Validación de participantes.
* Validación de permisos.
* Notificaciones automáticas.
* Polling de respaldo desde frontend.

Cuando se manda un mensaje:

1. El frontend emite o llama al método existente.
2. El backend obtiene el usuario desde JWT.
3. El backend valida que el usuario participe en el chat.
4. El backend valida permisos.
5. El backend guarda el mensaje.
6. El backend emite `message:new`.
7. El backend genera notificaciones para los demás participantes.
8. El backend emite `notification:new` a los destinatarios.

Validaciones esperadas:

```js
await participanteChatService.ensureActiveParticipantAsync(idChat, idUsuario);
await AuthorizationService.assertCanSendMessageToChat(idUsuario, idChat);
```

Regla obligatoria:

```txt
El usuario emisor no debe recibir notificación de su propio mensaje.
```

---

## 11. Notificaciones

Las notificaciones deben manejarse desde backend.

### Consultar mis notificaciones

Usar:

```txt
GET /api/notificaciones/mine
```

Debe usar:

```js
req.user.id
```

No recibir `id_usuario_destino` desde frontend para consultar mis notificaciones.

### Marcar una notificación como leída

Usar:

```txt
PATCH /api/notificaciones/:id/read
```

El backend debe validar que la notificación pertenezca al usuario autenticado.

### Marcar todas como leídas

Usar:

```txt
PATCH /api/notificaciones/read-all
```

Debe usar `req.user.id`.

### Crear notificaciones

Las notificaciones deben crearse como consecuencia de una acción real del sistema.

Ejemplos:

* Nuevo mensaje.
* Nueva actividad asignada.
* Cambio de permisos.
* Invitación de vínculo.
* Recordatorio de rutina.
* Alerta de zona segura.
* Validación profesional.
* Sesión profesional.

No crear notificaciones directamente desde frontend.

### Notificaciones realtime

Después de guardar la notificación en base, emitir:

```js
emitToUser(idUsuarioDestino, 'notification:new', payload);
```

Socket.IO es solo el canal realtime. La notificación debe quedar persistida en PostgreSQL aunque el usuario esté desconectado.

---

## 12. Notificaciones de chat

Para mensajes de chat:

1. Guardar el mensaje.
2. Buscar participantes activos del chat.
3. Excluir al emisor.
4. Crear notificación para cada destinatario.
5. Emitir `notification:new` a cada destinatario.
6. Usar BullMQ/Redis si está disponible.
7. Usar fallback si Redis no está activo.

Payload recomendado:

```js
{
  type: 'chat_message',
  id_chat: message.id_chat,
  id_mensaje: message.id,
  contenido: message.contenido,
  id_usuario_emisor: message.id_usuario_emisor,
  reference_type: 'chat',
  reference_id: message.id_chat
}
```

---

## 13. Ubicación

La ubicación es altamente sensible.

Reglas:

* No leer ubicación sin autorización.
* No modificar ubicación sin autorización.
* No exponer ubicación a usuarios no vinculados.
* No permitir que cualquier usuario actualice ubicación de cualquier dispositivo.
* No confiar en IDs enviados desde frontend.
* No usar rooms públicas.
* No guardar más información de la necesaria.
* Un tutor puede ver ubicación solo si tiene permiso o vínculo válido.
* Un profesional puede ver ubicación solo si tiene permiso profesional.
* El perteneciente comparte ubicación solo si tiene permiso para hacerlo.

Para ubicación actual:

```txt
/api/ubicaciones-actuales
```

Lectura:

```js
await AuthorizationService.assertCanAccessDispositivoLocation(
  req.user.id,
  idDispositivo,
  'read'
);
```

Escritura:

```js
await AuthorizationService.assertCanAccessDispositivoLocation(
  req.user.id,
  Number(entity.id_dispositivo),
  'write'
);
```

---

## 14. Ubicación en vivo

Cuando se implemente ubicación en vivo, usar Socket.IO.

Flujo recomendado:

1. El socket obtiene usuario desde `socket.data.user.id`.
2. El backend valida que el usuario pueda compartir ubicación.
3. El backend guarda ubicación actual.
4. El backend guarda historial si corresponde.
5. El backend calcula zonas seguras si corresponde.
6. El backend emite ubicación solo a usuarios autorizados.
7. Si hay entrada o salida de zona segura, crea evento.
8. Si corresponde, crea notificación.
9. Después de crear notificación, emite `notification:new`.

Evento cliente → servidor:

```txt
location:update
```

Payload sugerido:

```js
{
  id_dispositivo,
  latitud,
  longitud,
  precision,
  velocidad,
  bateria,
  fecha_registro
}
```

Evento servidor → cliente:

```txt
location:updated
```

Payload sugerido:

```js
{
  id_perteneciente,
  id_dispositivo,
  latitud,
  longitud,
  precision,
  fecha_registro
}
```

No emitir ubicación a todos los usuarios.

Usar:

```js
emitToUser(idTutor, 'location:updated', payload);
```

o una convención de room específica si se crea formalmente.

---

## 15. Zonas seguras

Las zonas seguras son sensibles y pueden formar parte de funcionalidades premium.

Reglas:

* Validar acceso antes de leer.
* Validar acceso antes de crear, editar o eliminar.
* Validar vínculo con el perteneciente.
* Validar permisos del tutor o profesional.
* Si hay límite por plan premium, validarlo antes de crear nuevas zonas.
* Si se detecta entrada o salida de una zona, crear evento.
* Si corresponde, crear notificación.
* Si corresponde, emitir realtime.

Eventos sugeridos:

```txt
location:entered-safe-zone
location:left-safe-zone
location:alert
```

---

## 16. Permisos en tiempo real

Cuando se modifiquen permisos:

1. Guardar cambios en base.
2. Invalidar cache de permisos.
3. Emitir evento al usuario afectado.
4. Emitir evento a usuarios relacionados si corresponde.

Evento:

```txt
permisos:updated
```

Uso recomendado:

```js
emitToUser(idUsuarioAfectado, 'permisos:updated', {
  id_perteneciente,
  permisos
});
```

No depender de que el usuario refresque la pantalla para ver cambios de permisos.

---

## 17. Actividades

Para actividades, actividades personalizadas y actividades asignadas:

* Usar HTTP.
* Validar permisos según rol.
* El perteneciente puede completar actividades si tiene permiso.
* El tutor puede asignar o configurar actividades según vínculo.
* El profesional puede asignar actividades si tiene permiso profesional.
* Al completar actividad, evaluar puntos, experiencia, estado y fecha de completado.
* Si la acción afecta a otro usuario, crear notificación.
* Si la acción debe verse en tiempo real, emitir Socket.IO.

Al completar una actividad, considerar:

* `id_estado_actividad`.
* `fecha_completada`.
* Puntos.
* Experiencia del avatar.
* Dashboard.
* Notificación a tutor/profesional.

---

## 18. Rutinas y calendario

Rutinas, calendario y actividades deben estar conectados.

Reglas:

* No duplicar lógica entre “Día”, “Calendario” y “Rutinas”.
* Si una rutina tiene recordatorio, debe reflejarse en calendario o vista diaria.
* Si una actividad está asignada para una fecha, debe aparecer en calendario o “Mi semana”.
* Si se agrega recordatorio, evaluar notificación.
* Si el recordatorio es diferido, usar worker o queue cuando corresponda.
* No usar Socket.IO si solo es una consulta histórica.

---

## 19. Emociones

Las emociones son parte del seguimiento del perteneciente.

Reglas:

* El perteneciente debe poder registrar emociones de forma simple.
* Tutor o profesional solo debe ver emociones si tiene permiso.
* Las emociones deben asociarse a fecha.
* Si están relacionadas con una actividad, guardar relación.
* No usar textos que juzguen la emoción.
* No mostrar emociones sensibles a usuarios no autorizados.

---

## 20. Pictogramas

Los pictogramas son apoyo de accesibilidad.

Reglas:

* Usar ARASAAC como fuente principal.
* No guardar imágenes innecesariamente si puede usarse URL/cache.
* No usar pictogramas como decoración.
* Usarlos para mejorar comprensión.
* Evitar sobrecargar pantallas.
* Mantener búsqueda simple.

Endpoints públicos de pictogramas pueden ser excepción a auth si ya están definidos como públicos. Cualquier uso asociado a usuario debe respetar permisos.

---

## 21. Archivos

Los archivos son sensibles.

Reglas:

* Validar permisos antes de adjuntar archivos a mensajes.
* Si un archivo pertenece a otro usuario, validar acceso.
* No permitir adjuntar archivos privados sin permiso.
* No exponer URLs privadas sin control.
* Usar permisos de archivo cuando corresponda.
* No saltar `PermisoArchivoRepository` o services relacionados.

---

## 22. Cache

Si un service usa cache, invalidar cache cuando se modifica información.

Ejemplo:

```js
await cacheService.delByPattern('actividad.*');
```

No cachear datos sensibles sin considerar usuario, permisos o vínculo.

No devolver cache de un usuario a otro.

---

## 23. Workers y queues

Usar workers o queues para tareas que no deberían bloquear la request principal.

Ejemplos:

* Notificaciones masivas.
* Recordatorios.
* Sincronización de pictogramas.
* Procesamiento pesado.
* Envío diferido.

Si Redis no está configurado, puede existir fallback, pero no debe romper la funcionalidad principal.

---

## 24. Variables de entorno

No hardcodear secretos.

Usar `.env` o `.env.local`.

Variables relevantes:

```txt
PORT
DATABASE_URL
DATABASE_POOL_MAX
JWT_SECRET
JWT_EXPIRES_IN
REFRESH_TOKEN_EXPIRES_IN
CORS_ORIGINS
REDIS_URL
ARASAAC_API_BASE_URL
ARASAAC_STATIC_URL
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_AVATAR_BUCKET
SUPABASE_FILES_BUCKET
DICEBEAR_AVATAR_PNG_BASE_URL
START_NOTIFICATION_WORKER
```

---

## 25. Errores y status HTTP

Usar códigos correctos:

```txt
200 OK
201 CREATED
400 BAD REQUEST
401 UNAUTHORIZED
403 FORBIDDEN
404 NOT FOUND
500 INTERNAL SERVER ERROR
```

Ejemplos:

* Falta parámetro: `400`.
* No está logueado: `401`.
* Está logueado pero no tiene permiso: `403`.
* No existe el recurso: `404`.
* Error inesperado: `500`.

Cuando sea posible, usar:

```js
next(error);
```

y dejar que el middleware de errores responda.

---

## 26. Checklist antes de implementar

Antes de tocar código, responder:

1. ¿Esto es frontend, backend o ambos?
2. ¿Necesita usuario autenticado?
3. ¿Necesita permisos?
4. ¿Necesita realtime?
5. ¿Necesita notificación?
6. ¿Necesita persistencia?
7. ¿Ya existe un controller/service/repository parecido?
8. ¿Ya existe un evento Socket.IO parecido?
9. ¿Hay que invalidar cache?
10. ¿Hay que agregar script, worker o migración?
11. ¿Qué tests o comandos deberían correrse?

---

## 27. Qué no hacer

No hacer:

* No confiar en `id_usuario` enviado desde frontend.
* No poner SQL en controllers.
* No saltear `AuthorizationService`.
* No exponer datos sensibles sin permiso.
* No crear sockets paralelos innecesarios.
* No usar Socket.IO como única fuente de verdad.
* No guardar ubicación sin autorización.
* No crear notificaciones desde frontend.
* No hardcodear secretos.
* No cambiar arquitectura sin necesidad.
* No reescribir módulos completos por cambios chicos.
* No crear endpoints duplicados si ya existe uno equivalente.
* No romper compatibilidad con frontend.

---

## 28. Regla de oro

La base de datos es la fuente de verdad.

Socket.IO sirve para avisar cambios en tiempo real.

El JWT identifica al usuario.

`AuthorizationService` decide qué puede hacer.

Los repositories acceden a SQL.

Los services contienen negocio.

Los controllers exponen rutas.

No mezclar estas responsabilidades.
