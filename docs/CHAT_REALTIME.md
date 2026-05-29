# Chat realtime backend

## Autenticacion

Los endpoints nuevos y los sockets usan el mismo JWT que `/api/auth/login`.

REST:

```http
Authorization: Bearer <token>
```

Socket.io:

```js
io(API_URL, {
  auth: { token },
});
```

## Endpoints REST

### Listar mis chats

```http
GET /api/chats/me
```

Devuelve solo chats activos donde el usuario autenticado es participante activo.

### Crear chat profesional-perteneciente

```http
POST /api/chats/profesional-perteneciente
Content-Type: application/json

{
  "id_perteneciente": 1,
  "id_tipo_chat": 2,
  "nombre": "Seguimiento profesional"
}
```

Reglas aplicadas por backend:

- Solo puede llamarlo el profesional autenticado.
- El profesional debe estar validado en `estados_validaciones_profesionales`.
- Debe existir un vinculo profesional-perteneciente activo o aprobado.
- Si el perteneciente es menor de 18 anos, el vinculo debe estar aprobado por un tutor (`fue_aprobado_por_tutor = true` e `id_tutor_aprobador` cargado).
- Si el perteneciente es mayor de 18 anos, no se exige aprobacion del tutor.
- Si ya existe un chat activo entre ambos usuarios con ese tipo de chat, devuelve ese chat y `created: false`.

### Listar mensajes de un chat

```http
GET /api/mensajes/chat/:idChat
```

Valida que el usuario autenticado sea participante activo del chat.

### Enviar mensaje a un chat

```http
POST /api/mensajes/chat/:idChat
Content-Type: application/json

{
  "id_tipo_mensaje": 1,
  "contenido": "Hola"
}
```

El backend toma `id_usuario_emisor` desde el JWT, guarda el mensaje y emite `message:new` al room del chat.

## Eventos Socket.io

### `chat:join`

Une el socket al room del chat si el usuario es participante activo.

```js
socket.emit('chat:join', { id_chat: 1 }, (response) => {});
```

### `chat:leave`

Saca el socket del room del chat.

```js
socket.emit('chat:leave', { id_chat: 1 });
```

### `message:send`

Guarda el mensaje y lo emite a todos los sockets conectados al chat.

```js
socket.emit(
  'message:send',
  {
    id_chat: 1,
    id_tipo_mensaje: 1,
    contenido: 'Hola',
  },
  (response) => {}
);
```

### `message:new`

Evento recibido cuando entra un mensaje nuevo.

```js
socket.on('message:new', (message) => {});
```

### `message:typing`

Emite estado de escritura a los demas sockets del chat.

```js
socket.emit('message:typing', {
  id_chat: 1,
  escribiendo: true,
});
```
