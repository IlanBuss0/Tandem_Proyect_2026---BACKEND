
//NO ES NADA IMPORTANTE , SOLO ES ALGO QUE USO GEMEINI PARA HACER LO DE SWAGGER
//NO AFECTA NADA PERO NADA AL CODIGO REAL 












import fs from 'fs';
import YAML from 'yamljs';

const swaggerPath = "C:/Users/Usuario/Tandem_Proyect_2026---BACKEND/src/configs/swagger.yaml";
const swagger = YAML.load(swaggerPath);

const pathsList = [
  "/auth/register",
  "/auth/login",
  "/auth/me",
  "/usuarios",
  "/pertenecientes",
  "/tutores",
  "/profesionales",
  "/actividades",
  "/actividades-personalizadas",
  "/actividades-asignadas",
  "/favoritos-actividades",
  "/calificaciones-actividades",
  "/avatares",
  "/saldos-puntos",
  "/movimientos-puntos",
  "/evaluaciones-autonomias",
  "/zonas-seguras",
  "/inventarios-avatares",
  "/items-avatares",
  "/eventos-zonas-seguras",
  "/compras-puntos",
  "/sesiones-profesionales",
  "/dispositivos",
  "/ubicaciones-actuales",
  "/ubicaciones-historiales",
  "/notificaciones",
  "/contactos",
  "/chats",
  "/participantes-chats",
  "/mensajes",
  "/bloqueos-usuarios",
  "/configuraciones-usuarios",
  "/configuraciones-accesibilidad",
  "/reportes-usuarios",
  "/alcances-archivos",
  "/archivos",
  "/auditorias-eventos",
  "/autonomias-operativas",
  "/beneficiarios-suscripciones",
  "/catalogos-permisos-pertenecientes",
  "/catalogos-permisos-profesionales",
  "/dificultades-actividades",
  "/entidades-afectadas-auditorias",
  "/estados-actividades",
  "/estados-contactos",
  "/estados-pagos",
  "/estados-reportes",
  "/estados-suscripciones",
  "/estados-validaciones-profesionales",
  "/estados-vinculos",
  "/historiales-permisos-otorgados-pertenecientes",
  "/historiales-permisos-otorgados-profesionales",
  "/mensajes-archivos",
  "/niveles-apoyos",
  "/pagos-suscripciones",
  "/paquetes-puntos",
  "/perfiles-profesionales",
  "/permisos-archivos",
  "/permisos-otorgados-pertenecientes",
  "/permisos-otorgados-profesionales",
  "/planes-suscripciones",
  "/puntos-otorgados",
  "/resenas-profesionales",
  "/roles-administradores",
  "/tipos-actividades",
  "/tipos-archivos",
  "/tipos-chats",
  "/tipos-eventos-auditorias",
  "/tipos-eventos-zonas-seguras",
  "/tipos-items-avatares",
  "/tipos-mensajes",
  "/tipos-movimientos-puntos",
  "/tipos-notificaciones",
  "/tipos-permisos-archivos",
  "/tipos-usuarios",
  "/validaciones-profesionales",
  "/vinculos-profesionales-pertenecientes",
  "/vinculos-tutor-pertenecientes"
];

const modelMapping = {
  "/usuarios": "Usuario",
  "/pertenecientes": "Perteneciente",
  "/tutores": "Tutor",
  "/profesionales": "Profesional",
  "/actividades": "Actividad",
  "/actividades-personalizadas": "ActividadPersonalizada",
  "/actividades-asignadas": "ActividadAsignada",
  "/favoritos-actividades": "FavoritoActividad",
  "/calificaciones-actividades": "CalificacionActividad",
  "/avatares": "Avatar",
  "/saldos-puntos": "SaldoPunto",
  "/movimientos-puntos": "MovimientoPunto",
  "/evaluaciones-autonomias": "EvaluacionAutonomia",
  "/zonas-seguras": "ZonaSegura",
  "/inventarios-avatares": "InventarioAvatar",
  "/items-avatares": "ItemAvatar",
  "/eventos-zonas-seguras": "EventoZonaSegura",
  "/compras-puntos": "CompraPunto",
  "/sesiones-profesionales": "SesionProfesional",
  "/dispositivos": "Dispositivo",
  "/ubicaciones-actuales": "UbicacionActual",
  "/ubicaciones-historiales": "UbicacionHistorial",
  "/notificaciones": "Notificacion",
  "/contactos": "Contacto",
  "/chats": "Chat",
  "/participantes-chats": "ParticipanteChat",
  "/mensajes": "Mensaje",
  "/bloqueos-usuarios": "BloqueoUsuario",
  "/configuraciones-usuarios": "ConfiguracionUsuario",
  "/configuraciones-accesibilidad": "ConfiguracionAccesibilidad",
  "/reportes-usuarios": "ReporteUsuario",
  "/alcances-archivos": "AlcanceArchivo",
  "/archivos": "Archivo",
  "/auditorias-eventos": "AuditoriaEvento",
  "/autonomias-operativas": "AutonomiaOperativa",
  "/beneficiarios-suscripciones": "BeneficiarioSuscripcion",
  "/catalogos-permisos-pertenecientes": "CatalogoPermisoPerteneciente",
  "/catalogos-permisos-profesionales": "CatalogoPermisoProfesional",
  "/dificultades-actividades": "DificultadActividad",
  "/entidades-afectadas-auditorias": "EntidadAfectadaAuditoria",
  "/estados-actividades": "EstadoActividad",
  "/estados-contactos": "EstadoContacto",
  "/estados-pagos": "EstadoPago",
  "/estados-reportes": "EstadoReporte",
  "/estados-suscripciones": "EstadoSuscripcion",
  "/estados-validaciones-profesionales": "EstadoValidacionProfesional",
  "/estados-vinculos": "EstadoVinculo",
  "/historiales-permisos-otorgados-pertenecientes": "HistorialPermisoOtorgadoPerteneciente",
  "/historiales-permisos-otorgados-profesionales": "HistorialPermisoOtorgadoProfesional",
  "/mensajes-archivos": "MensajeArchivo",
  "/niveles-apoyos": "NivelApoyo",
  "/pagos-suscripciones": "PagoSuscripcion",
  "/paquetes-puntos": "PaquetePunto",
  "/perfiles-profesionales": "PerfilProfesional",
  "/permisos-archivos": "PermisoArchivo",
  "/permisos-otorgados-pertenecientes": "PermisoOtorgadoPerteneciente",
  "/permisos-otorgados-profesionales": "PermisoOtorgadoProfesional",
  "/planes-suscripciones": "PlanSuscripcion",
  "/puntos-otorgados": "PuntoOtorgado",
  "/resenas-profesionales": "ResenaProfesional",
  "/roles-administradores": "RolAdministrador",
  "/tipos-actividades": "TipoActividad",
  "/tipos-archivos": "TipoArchivo",
  "/tipos-chats": "TipoChat",
  "/tipos-eventos-auditorias": "TipoEventoAuditoria",
  "/tipos-eventos-zonas-seguras": "TipoEventoZonaSegura",
  "/tipos-items-avatares": "TipoItemAvatar",
  "/tipos-mensajes": "TipoMensaje",
  "/tipos-movimientos-puntos": "TipoMovimientoPunto",
  "/tipos-notificaciones": "TipoNotificacion",
  "/tipos-permisos-archivos": "TipoPermisoArchivo",
  "/tipos-usuarios": "TipoUsuario",
  "/validaciones-profesionales": "ValidacionProfesional",
  "/vinculos-profesionales-pertenecientes": "VinculoProfesionalPerteneciente",
  "/vinculos-tutor-pertenecientes": "VinculoTutorPerteneciente"
};

function getTag(model) {
  if (["Usuario", "Perteneciente", "Tutor", "Profesional", "RolAdministrador", "TipoUsuario"].includes(model)) return "Usuarios";
  if (model.includes("Actividad")) return "Actividades";
  if (model.includes("Punto") || model.includes("Avatar") || model.includes("Recompensa") || model.includes("Nivel") || model.includes("Inventario") || model.includes("Item")) return "GamificaciÃ³n";
  if (model.includes("Ubicacion") || model.includes("ZonaSegura")) return "Seguimiento";
  if (model.includes("Chat") || model.includes("Mensaje") || model.includes("Notificacion") || model.includes("Contacto") || model.includes("Bloqueo")) return "ComunicaciÃ³n";
  if (model.includes("Archivo")) return "Archivos";
  if (model.includes("Suscripcion") || model.includes("Pago") || model.includes("Compra")) return "Suscripciones";
  if (model.includes("Validacion") || model.includes("Sesion") || model.includes("Resena") || model.includes("Perfil")) return "Profesionales";
  if (model.includes("Vinculo")) return "VÃ­nculos";
  return "Sistema";
}

const newPaths = {};

// Keep existing auth paths
if (swagger.paths["/auth/login"]) newPaths["/auth/login"] = swagger.paths["/auth/login"];
if (swagger.paths["/auth/register"]) newPaths["/auth/register"] = swagger.paths["/auth/register"];

// Add /auth/me if not exists
if (!newPaths["/auth/me"]) {
  newPaths["/auth/me"] = {
    get: {
      summary: "Obtener perfil del usuario autenticado",
      tags: ["AutenticaciÃ³n"],
      responses: {
        "200": {
          description: "Perfil obtenido",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Usuario" }
            }
          }
        },
        "401": { description: "No autorizado" }
      }
    }
  };
}

// Map models to paths
Object.keys(modelMapping).forEach(path => {
  const model = modelMapping[path];
  const tag = getTag(model);
  
  newPaths[path] = {
    get: {
      summary: `Listar ${path.substring(1)}`,
      tags: [tag],
      responses: {
        "200": {
          description: "OperaciÃ³n exitosa",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: { $ref: `#/components/schemas/${model}` }
              }
            }
          }
        }
      }
    },
    post: {
      summary: `Crear ${model}`,
      tags: [tag],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: `#/components/schemas/${model}` }
          }
        }
      },
      responses: {
        "201": {
          description: "Creado",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  id: { type: "integer", example: 1 },
                  message: { type: "string", example: "Creado exitosamente" }
                }
              }
            }
          }
        }
      }
    }
  };
  
  newPaths[`${path}/{id}`] = {
    get: {
      summary: `Obtener ${model} por ID`,
      tags: [tag],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "integer" } }
      ],
      responses: {
        "200": {
          description: "OperaciÃ³n exitosa",
          content: {
            "application/json": {
              schema: { $ref: `#/components/schemas/${model}` }
            }
          }
        },
        "404": { description: "No encontrado" }
      }
    },
    put: {
      summary: `Actualizar ${model} por ID`,
      tags: [tag],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "integer" } }
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: `#/components/schemas/${model}` }
          }
        }
      },
      responses: {
        "200": {
          description: "Actualizado correctamente"
        },
        "404": { description: "No encontrado" }
      }
    },
    delete: {
      summary: `Eliminar ${model} por ID`,
      tags: [tag],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "integer" } }
      ],
      responses: {
        "200": {
          description: "Eliminado correctamente"
        },
        "404": { description: "No encontrado" }
      }
    }
  };
});

// Add health if exists
if (swagger.paths["/health"]) newPaths["/health"] = swagger.paths["/health"];

swagger.paths = newPaths;

// Preserve formatting as much as possible
const output = YAML.stringify(swagger, 20, 2);
fs.writeFileSync(swaggerPath, output, 'utf-8');
console.log("Swagger updated successfully!");
