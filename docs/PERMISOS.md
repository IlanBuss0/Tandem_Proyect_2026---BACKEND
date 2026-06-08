# Modelo de permisos

Este documento define la primera version funcional del modelo de permisos de Tandem.
La idea es usar la base existente y evitar una capa de permisos demasiado pesada para la navegacion.

## Principios

- El backend decide permisos. El frontend solo refleja estados para ocultar, mostrar o deshabilitar acciones.
- Los tutores son la autoridad funcional sobre un perteneciente tutelado.
- Los profesionales no autorizan permisos del perteneciente.
- El administrador queda fuera del flujo familiar/profesional por ahora.
- Un perteneciente autogestionado puede operar sin tutor para acciones normales.
- Los cambios sensibles de permisos deben dejar historial para auditoria.
- `pertenecientes.puede_autogestionarse` es la fuente final de verdad para decidir si un perteneciente opera solo o requiere tutor.
- Si no existe una fila de permiso otorgado, se usa el default definido por el sistema para ese permiso.

## Modos del perteneciente

### Autogestionado

Un perteneciente se considera autogestionado cuando:

- `pertenecientes.puede_autogestionarse = true`

La edad y la autonomia ayudan a decidir ese valor, pero no se evaluan como reglas paralelas en cada endpoint. En caso de contradiccion, el backend debe respetar `puede_autogestionarse`.

En este modo, el perteneciente puede usar la app sin aprobacion de tutor para acciones normales, salvo restricciones especificas como bloqueos, reglas de chat, pagos o seguridad.

### Tutelado

Un perteneciente se considera tutelado cuando:

- `pertenecientes.puede_autogestionarse = false`

En este modo, uno o mas tutores activos pueden autorizar permisos. Debe existir un tutor principal, pero no es el unico que puede aprobar permisos.

## Definiciones tecnicas

### Vinculo tutor activo

Un tutor puede actuar sobre un perteneciente cuando existe un registro en `vinculos_tutor_pertenecientes` que cumpla:

- `id_estado_vinculo` corresponde a `Activo`;
- `fecha_fin IS NULL`;
- el usuario tutor esta activo;
- el usuario perteneciente esta activo.

### Vinculo profesional aprobado

Un profesional puede operar sobre un perteneciente cuando existe un registro en `vinculos_profesional_pertenecientes` que cumpla:

- `id_estado_vinculo` corresponde a `Activo`;
- el profesional esta validado;
- el usuario profesional esta activo;
- el usuario perteneciente esta activo;
- si `requiere_aprobacion_tutor = true`, entonces `fue_aprobado_por_tutor = true` e `id_tutor_aprobador IS NOT NULL`.

### Conflictos entre tutores

Si mas de un tutor activo modifica un permiso, gana el ultimo cambio valido.
Todos los cambios sensibles deben quedar auditados para saber quien modifico que, cuando y con que valor anterior.

## Roles funcionales

| Rol | Responsabilidad |
| --- | --- |
| Perteneciente | Usa la app, realiza actividades, chatea, configura parte de su experiencia segun autonomia y permisos. |
| Tutor | Autoriza permisos de un perteneciente tutelado y gestiona vinculos sensibles. |
| Profesional | Trabaja con pertenecientes vinculados y aprobados. No concede permisos familiares. |
| Administrador | Herramientas internas, validaciones y soporte. No participa en autorizaciones familiares por ahora. |

## Base existente a reutilizar

| Tabla | Uso |
| --- | --- |
| `pertenecientes` | Define autonomia operativa y `puede_autogestionarse`. |
| `vinculos_tutor_pertenecientes` | Define que tutores pueden autorizar sobre un perteneciente. |
| `vinculos_profesional_pertenecientes` | Define que profesionales pueden operar sobre un perteneciente. |
| `catalogo_permisos_pertenecientes` | Catalogo de acciones habilitables para pertenecientes. |
| `catalogo_permisos_profesionales` | Catalogo de acciones habilitables para profesionales por vinculo. |
| `permisos_otorgados_pertenecientes` | Estado actual de permisos del perteneciente. |
| `permisos_otorgados_profesionales` | Estado actual de permisos del profesional sobre un vinculo. |
| `historial_permisos_otorgados_pertenecientes` | Auditoria de cambios de permisos del perteneciente. |
| `historial_permisos_otorgados_profesionales` | Auditoria de cambios de permisos del profesional. |

## Catalogo inicial recomendado

### Permisos del perteneciente

| Permiso | Descripcion |
| --- | --- |
| `EditarPerfil` | Puede editar datos propios no criticos. |
| `EditarPerfilSensible` | Puede editar datos sensibles como nombre legal, correo, telefono, fecha de nacimiento o datos de autonomia. |
| `CompletarActividades` | Puede ejecutar actividades asignadas o disponibles. |
| `EnviarMensajes` | Puede usar chats permitidos. |
| `ChatearConProfesional` | Puede hablar por chat con profesionales vinculados. |
| `CrearActividadesPropias` | Puede crear actividades personales. |
| `CompartirUbicacion` | Puede compartir ubicacion con tutores o profesionales autorizados. |
| `GastarPuntos` | Puede gastar puntos en tienda/avatar. |

### Permisos del profesional

| Permiso | Descripcion |
| --- | --- |
| `AsignarActividades` | Puede asignar actividades al perteneciente vinculado. |
| `CrearActividadesPersonalizadas` | Puede crear actividades personalizadas para el perteneciente vinculado. |
| `VerHistorial` | Puede ver historial de actividades o seguimiento del perteneciente vinculado. |
| `VerUbicacion` | Puede ver ubicacion del perteneciente vinculado si el tutor lo autoriza. |
| `AgendarSesiones` | Puede crear o administrar sesiones con el perteneciente vinculado. |
| `EnviarMensajes` | Puede chatear con el perteneciente si el chat fue autorizado. |
| `EditarPerfilProfesional` | Puede editar su propio perfil profesional. No depende del vinculo. |

## Defaults de permisos

### Perteneciente autogestionado

| Permiso | Default |
| --- | --- |
| `EditarPerfil` | `true` |
| `EditarPerfilSensible` | `true` |
| `CompletarActividades` | `true` |
| `EnviarMensajes` | `true` |
| `ChatearConProfesional` | `true`, si existe vinculo profesional aprobado |
| `CrearActividadesPropias` | `true` |
| `CompartirUbicacion` | `false` |
| `GastarPuntos` | `true` |

### Perteneciente tutelado

| Permiso | Default |
| --- | --- |
| `EditarPerfil` | `true` |
| `EditarPerfilSensible` | `false` |
| `CompletarActividades` | `true` |
| `EnviarMensajes` | `false` |
| `ChatearConProfesional` | `false` |
| `CrearActividadesPropias` | `false` |
| `CompartirUbicacion` | `false` |
| `GastarPuntos` | `false` |

### Profesional al aprobar vinculo

Para evitar una navegacion pesada, al aprobar un vinculo profesional-perteneciente se habilitan por defecto los permisos profesionales basicos:

| Permiso | Default |
| --- | --- |
| `AsignarActividades` | `true` |
| `CrearActividadesPersonalizadas` | `true` |
| `VerHistorial` | `true` |
| `AgendarSesiones` | `true` |
| `EnviarMensajes` | `true` si el perteneciente es autogestionado; `false` si es tutelado |
| `VerUbicacion` | `false` |

`VerUbicacion` queda deshabilitado por defecto porque es una accion sensible.
`EnviarMensajes` queda deshabilitado por defecto para pertenecientes tutelados porque conviene que el tutor lo autorice de forma explicita.

## Matriz inicial de permisos

| Actor | Accion | Recurso | Condicion | Permiso requerido | Autoriza |
| --- | --- | --- | --- | --- | --- |
| Perteneciente | Completar actividad | Actividad propia/asignada | Si es autogestionado, puede. Si es tutelado, permiso habilitado. | `CompletarActividades` | Tutor o autonomia |
| Perteneciente | Enviar mensaje general | Chat | Debe ser participante activo y no estar bloqueado. Si es tutelado, permiso habilitado. | `EnviarMensajes` | Tutor o autonomia |
| Perteneciente | Chatear con profesional | Chat profesional-perteneciente | Debe existir vinculo profesional aprobado y chat autorizado. | `ChatearConProfesional` | Tutor |
| Perteneciente | Compartir ubicacion | Ubicacion/dispositivo | Si es tutelado, permiso habilitado. | `CompartirUbicacion` | Tutor o autonomia |
| Perteneciente | Gastar puntos | Tienda/avatar | Si es tutelado, permiso habilitado. | `GastarPuntos` | Tutor o autonomia |
| Perteneciente | Crear actividad propia | Actividad personalizada | Si es tutelado, permiso habilitado. | `CrearActividadesPropias` | Tutor o autonomia |
| Perteneciente | Editar perfil basico | Perfil propio | Permitido si el usuario esta activo. | `EditarPerfil` | Tutor o autonomia |
| Perteneciente | Editar perfil sensible | Perfil propio | Si es autogestionado, puede. Si es tutelado, permiso habilitado. | `EditarPerfilSensible` | Tutor o autonomia |
| Tutor | Ver datos del perteneciente | Perfil/actividad/ubicacion | Debe tener vinculo tutor-perteneciente activo. | No aplica inicialmente | Vinculo activo |
| Tutor | Modificar permisos | Permisos del perteneciente | Debe tener vinculo activo con el perteneciente. | No aplica inicialmente | Vinculo activo |
| Tutor | Aprobar vinculo profesional | Vinculo profesional-perteneciente | Debe tener vinculo activo con el perteneciente. | No aplica inicialmente | Vinculo activo |
| Tutor | Autorizar chat con profesional | Chat profesional-perteneciente | Debe tener vinculo activo con el perteneciente y profesional aprobado. | No aplica inicialmente | Vinculo activo |
| Profesional | Ver historial | Perteneciente vinculado | Profesional validado, vinculo aprobado, permiso habilitado. | `VerHistorial` | Tutor al aprobar/configurar |
| Profesional | Ver ubicacion | Perteneciente vinculado | Profesional validado, vinculo aprobado, permiso habilitado. | `VerUbicacion` | Tutor |
| Profesional | Asignar actividad | Perteneciente vinculado | Profesional validado, vinculo aprobado, permiso habilitado. | `AsignarActividades` | Tutor al aprobar/configurar |
| Profesional | Crear actividad personalizada | Perteneciente vinculado | Profesional validado, vinculo aprobado, permiso habilitado. | `CrearActividadesPersonalizadas` | Tutor al aprobar/configurar |
| Profesional | Agendar sesion | Perteneciente vinculado | Profesional validado, vinculo aprobado, permiso habilitado. | `AgendarSesiones` | Tutor al aprobar/configurar |
| Profesional | Enviar mensaje | Chat profesional-perteneciente | Vinculo aprobado, chat autorizado y ambos como participantes activos. | `EnviarMensajes` | Tutor |

## Reglas especificas

### Tutores

- Debe existir al menos un tutor principal para pertenecientes tutelados.
- Puede haber mas de un tutor activo.
- Cualquier tutor activo puede modificar permisos y aprobar vinculos.
- El tutor principal sirve como referencia familiar principal, no como unico autorizador.
- Si dos tutores cambian el mismo permiso, el ultimo cambio valido define el estado actual.

### Profesionales

- El profesional debe estar validado antes de operar con pertenecientes.
- Cada relacion profesional-perteneciente requiere un vinculo aprobado.
- Si el vinculo indica que requiere aprobacion de tutor, debe tener `fue_aprobado_por_tutor = true` e `id_tutor_aprobador`.
- Una vez aprobado el vinculo, el profesional puede operar segun los permisos profesionales otorgados para ese vinculo.
- El chat profesional-perteneciente requiere autorizacion explicita del tutor cuando el perteneciente es tutelado.
- Para reducir friccion, los permisos profesionales basicos pueden crearse habilitados automaticamente al aprobar el vinculo.

### Chats

- Para enviar mensajes, el usuario debe ser participante activo del chat.
- Para chat entre perteneciente tutelado y profesional, debe existir:
  - vinculo profesional-perteneciente aprobado;
  - permiso `ChatearConProfesional` del perteneciente;
  - permiso `EnviarMensajes` del profesional sobre ese vinculo;
  - participantes activos en el chat.
- Un perteneciente autogestionado puede chatear sin autorizacion de tutor, siempre que el vinculo profesional este aprobado cuando corresponda.

## Perfil y datos sensibles

Editar perfil debe separarse en dos niveles:

- Perfil basico: avatar, preferencias, accesibilidad, informacion visible no legal.
- Perfil sensible: nombre legal, correo, telefono, fecha de nacimiento, nivel de apoyo, autonomia operativa y `puede_autogestionarse`.

Los datos sensibles de un perteneciente tutelado no deben cambiarse sin tutor activo o regla administrativa futura.

## Administracion

El administrador no participa en el flujo familiar/profesional de permisos.
En una fase separada se deben proteger endpoints administrativos como:

- catalogos;
- validaciones profesionales;
- reportes;
- usuarios;
- auditorias;
- herramientas internas.

## Auditoria

Los cambios de permisos deben registrar:

- entidad afectada;
- permiso modificado;
- valor anterior;
- valor nuevo;
- usuario modificador;
- fecha;
- motivo opcional.

La auditoria no tiene que ser visible en la navegacion diaria, pero debe existir para trazabilidad legal y soporte.

## Implementacion propuesta

### Fase 1: catalogos y reglas

- Confirmar nombres finales de permisos.
- Asegurar que existan los registros de catalogo.
- Confirmar defaults para pertenecientes autogestionados, tutelados y profesionales vinculados.

Script disponible para sembrar catalogos de forma idempotente:

```bash
npm run seed:permissions
```

### Fase 2: autorizacion backend

Crear un servicio central, por ejemplo:

```js
AuthorizationService.can(user, action, context)
```

Acciones sugeridas:

```txt
perteneciente.actividad.completar
perteneciente.chat.enviar
perteneciente.chat_profesional.enviar
perteneciente.ubicacion.compartir
perteneciente.puntos.gastar
perteneciente.actividad.crear_propia
perteneciente.perfil.editar
perteneciente.perfil_sensible.editar
tutor.permisos.modificar
tutor.vinculo_profesional.aprobar
profesional.historial.ver
profesional.ubicacion.ver
profesional.actividad.asignar
profesional.actividad_personalizada.crear
profesional.sesion.agendar
profesional.chat.enviar
```

### Fase 3: endpoints sensibles

Proteger primero:

- chats y mensajes;
- ubicacion;
- actividades asignadas y personalizadas;
- permisos otorgados;
- vinculos profesional-perteneciente;
- perfil del perteneciente.
- endpoints administrativos, en una fase separada.

### Fase 4: frontend

El frontend debe consultar permisos efectivos y adaptar la UI:

- ocultar acciones imposibles;
- mostrar estados de pendiente/aprobado;
- evitar flujos bloqueados;
- mantener el backend como fuente de verdad.

## Preguntas pendientes

- Si todos los tutores activos pueden modificar todos los permisos o si en el futuro habra niveles de tutor.
- Si `puede_autogestionarse` se define manualmente por tutor/profesional/admin o se calcula desde edad y autonomia.
- Si el chat profesional se autoriza siempre con permiso separado o si algun tipo de profesional puede traerlo habilitado por default.
