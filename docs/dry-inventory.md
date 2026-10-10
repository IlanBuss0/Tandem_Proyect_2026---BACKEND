# Inventario DRY

Base: origin/dev 044429feddb6b0c58103d0fda4fe41555ee64313. Los grupos se detectaron normalizando nombre del recurso, tabla SQL y logs. Los archivos concretos se conservan.

## Controllers CRUD (32)

AlcanceArchivoController, AuditoriaEventoController, AutonomiaOperativaController, BeneficiarioSuscripcionController, CatalogoPermisoPertenecienteController, CatalogoPermisoProfesionalController, DificultadActividadController, EntidadAfectadaAuditoriaController, EstadoActividadController, EstadoContactoController, EstadoPagoController, EstadoReporteController, EstadoSuscripcionController, EstadoValidacionProfesionalController, EstadoVinculoController, MensajeArchivoController, NivelApoyoController, PagoSuscripcionController, PermisoArchivoController, PlanSuscripcionController, RolAdministradorController, TipoActividadController, TipoArchivoController, TipoChatController, TipoEventoAuditoriaController, TipoEventoZonaSeguraController, TipoItemAvatarController, TipoMensajeController, TipoMovimientoPuntoController, TipoNotificacionController, TipoPermisoArchivoController, TipoUsuarioController.

## Services delegadores (39)

AlcanceArchivoService, ArchivoService, AuditoriaEventoService, AutonomiaOperativaService, BeneficiarioSuscripcionService, CatalogoPermisoPertenecienteService, CatalogoPermisoProfesionalService, DificultadActividadService, EntidadAfectadaAuditoriaService, EstadoActividadService, EstadoContactoService, EstadoPagoService, EstadoReporteService, EstadoSuscripcionService, EstadoValidacionProfesionalService, EstadoVinculoService, HistorialPermisoOtorgadoPertenecienteService, HistorialPermisoOtorgadoProfesionalService, MensajeArchivoService, NivelApoyoService, PagoSuscripcionService, PaquetePuntoService, PermisoArchivoService, PermisoOtorgadoPertenecienteService, PermisoOtorgadoProfesionalService, PlanSuscripcionService, PuntoOtorgadoService, RolAdministradorService, TipoActividadService, TipoArchivoService, TipoChatService, TipoEventoAuditoriaService, TipoEventoZonaSeguraService, TipoItemAvatarService, TipoMensajeService, TipoMovimientoPuntoService, TipoNotificacionService, TipoPermisoArchivoService, TipoUsuarioService.

## Repositories de catalogo (26)

AlcanceArchivoRepository, AutonomiaOperativaRepository, CatalogoPermisoPertenecienteRepository, CatalogoPermisoProfesionalRepository, DificultadActividadRepository, EntidadAfectadaAuditoriaRepository, EstadoActividadRepository, EstadoContactoRepository, EstadoPagoRepository, EstadoReporteRepository, EstadoSuscripcionRepository, EstadoValidacionProfesionalRepository, EstadoVinculoRepository, NivelApoyoRepository, PuntoOtorgadoRepository, RolAdministradorRepository, TipoActividadRepository, TipoArchivoRepository, TipoEventoAuditoriaRepository, TipoEventoZonaSeguraRepository, TipoItemAvatarRepository, TipoMensajeRepository, TipoMovimientoPuntoRepository, TipoNotificacionRepository, TipoPermisoArchivoRepository, TipoUsuarioRepository.

## Entities de catalogo (27)

AlcanceArchivo, AutonomiaOperativa, CatalogoPermisoPerteneciente, CatalogoPermisoProfesional, DificultadActividad, EntidadAfectadaAuditoria, EstadoActividad, EstadoContacto, EstadoPago, EstadoReporte, EstadoSuscripcion, EstadoValidacionProfesional, EstadoVinculo, NivelApoyo, PuntoOtorgado, RolAdministrador, TipoActividad, TipoArchivo, TipoChat, TipoEventoAuditoria, TipoEventoZonaSegura, TipoItemAvatar, TipoMensaje, TipoMovimientoPunto, TipoNotificacion, TipoPermisoArchivo, TipoUsuario.

## Entities de datos (18)

AuditoriaEvento, BeneficiarioSuscripcion, HistorialPermisoOtorgadoPerteneciente, HistorialPermisoOtorgadoProfesional, InviteVinculo, MensajeArchivo, PagoSuscripcion, PaquetePunto, PerfilProfesional, PermisoArchivo, PermisoOtorgadoPerteneciente, PermisoOtorgadoProfesional, PlanSuscripcion, ResenaProfesional, Suscripcion, ValidacionProfesional, VinculoProfesionalPerteneciente, VinculoTutorPerteneciente.

## Casos relacionados

- TipoChatRepository comparte CRUD de catalogo y conserva getByNombreAsync.
- ConfiguracionUsuarioRepository y ConfiguracionAccesibilidadRepository comparten CRUD y consultas por usuario/clave. La insercion conserva valores ausentes como undefined.
- UbicacionActual/UbicacionHistorial y ConfiguracionUsuario/ConfiguracionAccesibilidad en entities conservan sus constructores especificos.
- Controllers con autorizacion, filtros, endpoints adicionales o eventos permanecen especificos.

## Frontend

- InviteLinkHandler y ProfessionalInviteLinkHandler: aceptacion compartida con rol, textos y evento profesional parametrizados.
- EventPictogram y RoutinePictogram: imagen, fallback y reinicio del error compartidos.
- AgreementRow y FeedAgreementItem: mismo dato y accion, con variante visual.
- ObjectiveRow y FeedObjectiveItem: edicion de progreso compartida; presentacion de completado del feed separada.
- ReadReportSheet y ReadOnlyReportSheet: lectura compartida; envio, edicion y descarga en sus contenedores.
- useTutorNavigation y useProfessionalNavigation: historial y scroll compartidos con rutas y claves propias.
- TutorNavigation y ProfessionalNavigation: secciones, botones, acciones rapidas y cierre por Escape compartidos. Los grupos y filtros de permisos siguen en cada rol.
- Calendarios y hooks de resolucion de pictogramas quedan fuera de esta entrega por sus diferencias funcionales. NewReportSheet y EditReportSheet conservan sus operaciones propias.

## Comprobaciones previas

- Frontend: 89 archivos y 527 pruebas pasaron; lint: 0 errores y 147 advertencias; build paso. tsc --noEmit -p tsconfig.app.json fallo con errores de tipos en main. La rama dev tiene el mismo arbol que main.
- Backend: test:auth-register paso (9 pruebas). Las pruebas de autorizacion de configuracion pasaron (4 pruebas).
- No se ejecutaron migraciones de base de datos.

## Estado de verificacion de la rama de trabajo

- Backend: las pruebas de BaseCrudRepository, ConfigurationRepository, TipoChat, services y contrato HTTP pasaron. La suite completa falla en pictogram-filters porque la base contiene 4 pictogramas sin estilo visual; ese test y sus datos no fueron modificados.
- Frontend: 95 archivos y 539 pruebas pasaron tras las extracciones; build paso; lint termino con 0 errores y las mismas 147 advertencias previas. El typecheck mantiene 30 errores ajenos a los archivos modificados.
