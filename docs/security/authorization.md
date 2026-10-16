# Corrección y validación de autorización

Desarrollo en `fix/authorization-boundaries`, derivada de `origin/dev`, en ambos repositorios. La promoción autorizada para esta entrega utiliza `dev` → `test` → `main`, con el mensaje `Mate: implementacion de autorizacion`.

## Controles aplicados

Se reutilizan `AuthorizationService`, las relaciones activas y los permisos efectivos existentes. El middleware de recursos aplica los controles a los CRUD que los omitían; el CRUD genérico deniega recursos privados sin política registrada y escrituras de cuentas comunes.

La [matriz de recursos](authorization-matrix.csv) cubre 31 familias de catálogos y 21 familias privadas con política registrada. Los flujos específicos conservan sus controles y las correcciones siguientes.

| Área | Corrección |
| --- | --- |
| Archivos | Lectura por creador, permiso explícito o participación vigente en mensajes no eliminados y visibles. Modificación y borrado por creador; propietario y URL inmutables. |
| Storage | Descarga por `/api/storage/:bucket/*path`, con sesión y autorización del objeto. Solo pictogramas aprobados tienen lectura anónima. URLs protegidas también dentro del JSON de actividades y eventos realtime. Referencias al proveedor de IA firmadas por 120 segundos. |
| Buckets | El arranque exige buckets existentes y privados. En la comprobación real ya estaban privados; no se alteró configuración remota. |
| Vínculos | Alta genérica tutor–perteneciente bloqueada; uso del flujo de invitaciones. Cambios por tutor principal, participantes y aprobaciones inmutables. Aceptar otro tutor exige permiso sensible cuando existen tutores. Al aceptar una invitación profesional se vuelve a autorizar al tutor emisor. |
| Permisos y adjuntos | Escrituras genéricas de permisos de archivo y asociaciones mensaje–archivo restringidas. El envío normal mantiene su validación. Los permisos por URL se autorizan usando la fila existente y preservan su dueño y vínculo. |
| CRUD privados | Listados e identificadores limitados al dueño o vínculo autorizado. Auditorías y pagos de suscripción administrativos. Búsqueda de tutor por usuario también autorizada. |
| Catálogos | Lectura autenticada; escritura administrativa en 31 familias. |
| Contexto | Decisiones sobre relaciones y permisos actuales. Contexto profesional sin pacientes rechazados ni permisos de historial revocados. |
| Contactos | Solicitante participante, estado inicial pendiente, respuesta del destinatario y participantes inmutables. |
| Actividades | No se permite asignar actividades personalizadas de otro creador. El perteneciente no puede eliminar asignaciones eludiendo permisos. |
| Evaluaciones | Autor tomado de la sesión profesional; modificar y borrar exige autoría y vínculo autorizado. |
| Reportes | Autorización central de historial en generación, programación y PDF; lectura del tutor y envío también autorizados. |
| Sesiones | JWT asociado a familia activa de refresh tokens. Revocación efectiva en HTTP y sockets; cuenta y correo verificados, desconexión al vencer y revalidación periódica y por evento. Logout desconecta sockets. |
| Chats | Crear/ampliar grupos comprueba relaciones; enviar respeta bloqueos y permisos profesional–perteneciente también en grupos. Salir o ser expulsado retira las salas; no se recuperan salas antiguas. Mensajes eliminados no devuelven contenido. |
| Acompañamiento | Escritura separada de lectura; notas ajenas requieren tutor principal y gestión profesional autorizada. |
| Perfil | Actualización propia respeta `EditarPerfil`. |
| Tienda y puntos | Precio y recompensa calculados en servidor; compra transaccional, saldo suficiente, bloqueo del avatar y equipamiento limitado al inventario. Primera finalización acredita una sola vez, sin recompensa por autoasignación. El frontend no crea catálogos ni escribe saldos. |
| Pictogramas | Sincronización administrativa y escrituras con correo verificado. |

## Pruebas reproducibles

- `npm run test:authorization`: pruebas HTTP y sockets con fixtures y acceso a PostgreSQL bloqueado.
- `npm run test:all`: suite completa con `TEST_DATABASE_URL` explícita, solo loopback y nombre terminado en `_test`. Rechaza overrides del `.env` y desactiva credenciales externas de pruebas.
- `npm run test:authorization:postgres`: integración HTTP y transacciones reales; fixtures sintéticos eliminados al terminar.
- Frontend: `npm test`, `npm run lint`, `npx tsc --noEmit -p tsconfig.app.json` y `npm run build`.

La validación utilizó PostgreSQL 16.2 local con la estructura de 113 tablas y sus restricciones, catálogos y 600 pictogramas públicos. No se copiaron usuarios ni datos personales. No se replicaron funciones ni triggers de Supabase: se prueban la autorización y las transacciones de la aplicación.

## Resultados de la entrega

- Backend: 558 pruebas aprobadas, cero fallos y cero omitidas. Incluye las 29 pruebas que antes fallaban por falta de una base de integración.
- Autorización aislada: 96 aprobadas. Integración PostgreSQL: 9 aprobadas, incluidas en las 558 anteriores.
- Concurrencia: diez compras del mismo artículo producen un solo registro y débito; dos compras diferentes no exceden el saldo; diez finalizaciones producen una sola recompensa.
- Revocar vínculos o permisos bloquea la lectura inmediatamente. Las modificaciones y borrados ajenos no alteran las filas.
- Frontend: 573 pruebas en 101 archivos; build y typecheck aprobados. Lint sin errores, con 147 advertencias previas.
- Se corrigieron los 30 diagnósticos previos de TypeScript: contratos de componentes, tipos de datos y SDK del lector. También se corrigieron el mapper de avatares, el campo del perfil de Inicio, las gafas equipadas y la espera del guardado/publicación administrativa. Hay regresiones para mapper, perfil, gafas y cierre de cámara mediante controles y tracks.
- Edge: `juan123`, `pablo` y `lucia` inician sesión y conservan la sesión al recargar. Descargas propias 200, ajenas sin permiso 403, anónimas 401. Una cookie después de logout devuelve 401.
- Renovación en Edge con JWT temporal de 15 segundos: desconexión al vencer, refresh 200 y segunda conexión de socket. Se restauró el vencimiento normal del `.env`.
- Objeto existente en Supabase: URL pública sin credenciales 400; lectura privada del mismo objeto con credencial del backend 200. Ambos buckets privados, RLS habilitado en las tablas inspeccionadas de `public` y `storage`. No se alteraron tablas, roles ni políticas remotas.

## Límites y despliegue

- La conexión PostgreSQL y `service_role` siguen siendo privilegiadas. La autorización se aplica en la aplicación; no se convierten esas credenciales en identidades RLS por usuario.
- No se borraron vínculos ni permisos históricos. Si se sospecha explotación previa, requieren revisión para identificar relaciones fabricadas.
- Artículos con un requisito específico de dificultad quedan bloqueados hasta disponer de una validación confiable en servidor. El resto comprueba precio, saldo y cantidad de actividades.
- Ambos repositorios deben desplegarse coordinadamente. `APP_PUBLIC_URL` debe apuntar al frontend real; las imágenes utilizan su proxy `/api` y la cookie del sitio. Se conservan los proxies de Vite y Vercel.
- La ejecución local usa `START_BACKGROUND_WORKERS=false`, evitando reportes y notificaciones programadas sobre Supabase. Producción conserva el valor predeterminado habilitado.
- Las pruebas negativas y de concurrencia escriben solo en mocks o PostgreSQL local. No se simularon escrituras maliciosas sobre Supabase ni se invocaron servicios pagos de IA.
- No se afirma ausencia absoluta de vulnerabilidades fuera de los escenarios revisados ni se verifica aquí el despliegue remoto posterior al push.

## Archivos modificados

### Tandem_Proyect_2026---BACKEND

- `package.json`
- `src/controllers/ActividadAsignadaController.js`
- `src/controllers/ActividadController.js`
- `src/controllers/EvaluacionAutonomiaController.js`
- `src/controllers/MensajeController.js`
- `src/controllers/PermisoController.js`
- `src/controllers/PictogramaController.js`
- `src/controllers/UsuarioController.js`
- `src/controllers/base/BaseCrudController.js`
- `src/middlewares/auth.middleware.js`
- `src/realtime/realtime.js`
- `src/realtime/socket.js`
- `src/repositories/ActividadAsignadaRepository.js`
- `src/repositories/RefreshTokenRepository.js`
- `src/server.js`
- `src/services/AcompanamientoService.js`
- `src/services/ActividadAsignadaService.js`
- `src/services/AiPictogramService.js`
- `src/services/AuthService.js`
- `src/services/AuthorizationService.js`
- `src/services/AvatarImageStorageService.js`
- `src/services/AvatarService.js`
- `src/services/ChatService.js`
- `src/services/FileStorageService.js`
- `src/services/InventarioAvatarService.js`
- `src/services/InviteVinculoService.js`
- `src/services/MensajeService.js`
- `src/services/ParticipanteChatService.js`
- `src/services/PictogramaService.js`
- `src/services/ProfesionalService.js`
- `src/services/ReporteProfesionalService.js`
- `src/services/VinculoProfesionalPertenecienteService.js`
- `test/account-cache.test.js`
- `test/base-crud.test.js`
- `test/configuraciones-ownership.test.js`
- `test/professional-core.test.js`
- `test/reportes-pdf-opciones.test.js`
- `test/reportes-profesionales.test.js`
- `test/tarjeta-ayuda.test.js`
- `docs/security/authorization-matrix.csv`
- `docs/security/authorization.md`
- `src/controllers/StorageController.js`
- `src/middlewares/resource-authorization.middleware.js`
- `src/services/ProtectedStorageService.js`
- `test/authorization-postgres.test.js`
- `test/authorization-regressions.test.js`
- `test/helpers/isolated-db.js`
- `test/helpers/postgres-env.js`
- `test/http-authorization.test.js`
- `test/realtime-authorization.test.js`
- `test/resource-boundaries.test.js`
- `test/wallet-authorization.test.js`

### tandem-connections_2026

- `src/components/AccessibilityWidget.tsx`
- `src/components/AvatarPreview.tsx`
- `src/components/MiniGame.memory.test.tsx`
- `src/components/ProfessionalPatientOverview.tsx`
- `src/components/ProfessionalProfileSettings.tsx`
- `src/contexts/CalendarContext.tsx`
- `src/contexts/ChatContext.tsx`
- `src/contexts/WalletContext.tsx`
- `src/data/api.ts`
- `src/data/mockData.ts`
- `src/lib/dicebearAvatar.ts`
- `src/pages/Pdf417TestPage.test.tsx`
- `src/pages/Pdf417TestPage.tsx`
- `src/pages/admin/SuperAdminDashboard.tsx`
- `src/pages/user/ActivityExecution.tsx`
- `src/pages/user/UserActivities.tsx`
- `src/pages/user/UserProfileSettings.tsx`
- `src/types/actividad.types.ts`
- `src/types/perfil.types.ts`
- `src/data/api.contracts.test.ts`
- `src/lib/dicebearAvatar.test.ts`
