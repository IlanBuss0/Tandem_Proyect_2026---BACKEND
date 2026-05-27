
//NO ES NADA IMPORTANTE , SOLO ES ALGO QUE USO GEMEINI PARA HACER LO DE SWAGGER
//NO AFECTA NADA PERO NADA AL CODIGO REAL 



import fs from 'fs';
import path from 'path';
import YAML from 'yamljs';

const ENTITIES_DIR = "C:/Users/Usuario/Tandem_Proyect_2026---BACKEND/src/entities";
const SWAGGER_PATH = "C:/Users/Usuario/Tandem_Proyect_2026---BACKEND/src/configs/swagger.yaml";

const models = [
  "Usuario", "Perteneciente", "Tutor", "Profesional", "Actividad", 
  "ActividadPersonalizada", "ActividadAsignada", "FavoritoActividad", "CalificacionActividad", 
  "Avatar", "SaldoPunto", "MovimientoPunto", "EvaluacionAutonomia", "ZonaSegura", 
  "InventarioAvatar", "ItemAvatar", "EventoZonaSegura", "CompraPunto", "SesionProfesional", 
  "Dispositivo", "UbicacionActual", "UbicacionHistorial", "Notificacion", "Contacto", 
  "Chat", "ParticipanteChat", "Mensaje", "BloqueoUsuario", "ConfiguracionUsuario", 
  "ConfiguracionAccesibilidad", "ReporteUsuario", "AlcanceArchivo", "Archivo", "AuditoriaEvento", 
  "AutonomiaOperativa", "BeneficiarioSuscripcion", "CatalogoPermisoPerteneciente", "CatalogoPermisoProfesional", 
  "DificultadActividad", "EntidadAfectadaAuditoria", "EstadoActividad", "EstadoContacto", "EstadoPago", 
  "EstadoReporte", "EstadoSuscripcion", "EstadoValidacionProfesional", "EstadoVinculo", 
  "HistorialPermisoOtorgadoPerteneciente", "HistorialPermisoOtorgadoProfesional", "MensajeArchivo", "NivelApoyo", 
  "PagoSuscripcion", "PaquetePunto", "PerfilProfesional", "PermisoArchivo", "PermisoOtorgadoPerteneciente", 
  "PermisoOtorgadoProfesional", "PlanSuscripcion", "PuntoOtorgado", "ResenaProfesional", "RolAdministrador", 
  "TipoActividad", "TipoArchivo", "TipoChat", "TipoEventoAuditoria", "TipoEventoZonaSegura", "TipoItemAvatar", 
  "TipoMensaje", "TipoMovimientoPunto", "TipoNotificacion", "TipoPermisoArchivo", "TipoUsuario", "ValidacionProfesional", 
  "VinculoProfesionalPerteneciente", "VinculoTutorPerteneciente"
];

function getPlural(word) {
  if (word.toLowerCase().endsWith("chat")) return word + "s";
  if (word.match(/[aeiou]$/i)) return word + "s";
  return word + "es";
}

function getTag(model) {
  if (["Usuario", "Perteneciente", "Tutor", "Profesional", "RolAdministrador", "TipoUsuario"].includes(model)) return "Usuarios";
  if (model.includes("Actividad")) return "Actividades";
  if (model.includes("Punto") || model.includes("Avatar") || model.includes("Recompensa") || model.includes("Nivel") || model.includes("Inventario") || model.includes("Item")) return "Gamificación";
  if (model.includes("Ubicacion") || model.includes("ZonaSegura")) return "Geolocalización";
  if (model.includes("Chat") || model.includes("Mensaje") || model.includes("Notificacion") || model.includes("Contacto") || model.includes("Bloqueo")) return "Comunicación";
  if (model.includes("Archivo")) return "Archivos";
  if (model.includes("Suscripcion") || model.includes("Pago") || model.includes("Compra")) return "Suscripciones";
  if (model.includes("Validacion") || model.includes("Sesion") || model.includes("Resena") || model.includes("Perfil")) return "Profesionales";
  return "Sistema";
}

function getPropertySchema(propName) {
  const p = propName.toLowerCase();
  let schema = { type: 'string', example: 'string' };

  if (p === 'id' || p.startsWith('id_')) {
    schema = { type: 'integer', example: 1 };
  } else if (p.includes('correo') || p.includes('email')) {
    schema = { type: 'string', format: 'email', example: 'usuario@example.com' };
  } else if (p.includes('contrasena') || p.includes('password') || p.includes('hash')) {
    schema = { type: 'string', format: 'password', example: 'SecureP@ss123' };
  } else if (p.includes('fecha') || p.includes('timestamp')) {
    schema = { type: 'string', format: 'date-time', example: '2026-05-26T12:00:00Z' };
  } else if (p.includes('telefono')) {
    schema = { type: 'string', example: '+5491123456789' };
  } else if (p.startsWith('es_') || p === 'activo' || p === 'verificado' || p.includes('habilitado')) {
    schema = { type: 'boolean', example: true };
  } else if (p.includes('latitud')) {
    schema = { type: 'number', format: 'float', example: -34.6037 };
  } else if (p.includes('longitud')) {
    schema = { type: 'number', format: 'float', example: -58.3816 };
  } else if (p.includes('monto') || p.includes('precio') || p.includes('saldo')) {
    schema = { type: 'number', format: 'float', example: 150.50 };
  } else if (p.includes('cantidad') || p.includes('puntos') || p.includes('stock')) {
    schema = { type: 'integer', example: 10 };
  } else if (p.includes('nombre') || p.includes('titulo')) {
    schema = { type: 'string', example: 'Ejemplo de Nombre' };
  } else if (p.includes('apellido')) {
    schema = { type: 'string', example: 'Pérez' };
  } else if (p.includes('url') || p.includes('ruta')) {
    schema = { type: 'string', format: 'uri', example: 'https://example.com/recurso.jpg' };
  } else if (p.includes('descripcion')) {
    schema = { type: 'string', example: 'Descripción detallada del registro.' };
  }

  return schema;
}

const doc = {
  openapi: "3.0.3",
  info: {
    title: "API Interactiva de Tándem 2026",
    version: "1.0.0",
    description: "Espacio de pruebas interactivo completo para el backend de Tándem. Desarrollado por Matias\n."
  },
  servers: [
    { url: "http://localhost:3000", description: "Servidor de Desarrollo Local" }
  ],
  security: [
    { BearerAuth: [] }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    },
    schemas: {}
  },
  paths: {
    "/api/auth/login": {
      post: {
        summary: "Iniciar sesión de usuario",
        tags: ["Autenticación"],
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["nombre_usuario", "contrasena"],
                properties: {
                  nombre_usuario: { type: "string", example: "juan123" },
                  contrasena: { type: "string", format: "password", example: "123456" }
                }
              }
            }
          }
        },
        responses: {
          "200": { description: "Login exitoso, devuelve el token JWT" },
          "400": { description: "Datos inválidos o faltantes" }
        }
      }
    }
  }
};

models.forEach(model => {
  const entityFile = path.join(ENTITIES_DIR, `${model}.js`);
  let props = [];
  if (fs.existsSync(entityFile)) {
    const content = fs.readFileSync(entityFile, 'utf-8');
    // Extract constructor params
    const constructorMatch = content.match(/constructor\s*\(\s*\{([^}]+)\}/);
    if (constructorMatch) {
      const params = constructorMatch[1].split(',').map(s => s.trim().split('=')[0].trim()).filter(s => s);
      props = params;
    }
  }

  if (props.length === 0) {
    props = ['id', 'nombre', 'descripcion', 'activo'];
  }

  const schemaProperties = {};
  props.forEach(p => {
    schemaProperties[p] = getPropertySchema(p);
  });

  doc.components.schemas[model] = {
    type: "object",
    properties: schemaProperties
  };

  const modelPlural = getPlural(model.toLowerCase());
  const routeBase = `/api/${modelPlural}`;
  const tag = getTag(model);

  doc.paths[routeBase] = {
    get: {
      summary: `Obtener todos los registros de ${model}`,
      tags: [tag],
      responses: {
        "200": {
          description: "Lista obtenida con éxito",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: { $ref: `#/components/schemas/${model}` }
              }
            }
          }
        },
        "500": { description: "Error interno del servidor" }
      }
    },
    post: {
      summary: `Crear un nuevo registro de ${model}`,
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
          description: "Registro creado con éxito",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: { type: "string", example: "Registro creado exitosamente" },
                  id: { type: "integer", example: 1 }
                }
              }
            }
          }
        },
        "400": { description: "Datos inválidos" },
        "500": { description: "Error interno del servidor" }
      }
    }
  };

  doc.paths[`${routeBase}/{id}`] = {
    get: {
      summary: `Obtener un registro de ${model} por ID`,
      tags: [tag],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "integer" } }
      ],
      responses: {
        "200": {
          description: "Registro obtenido con éxito",
          content: {
            "application/json": {
              schema: { $ref: `#/components/schemas/${model}` }
            }
          }
        },
        "404": { description: "Registro no encontrado" },
        "500": { description: "Error interno del servidor" }
      }
    },
    put: {
      summary: `Actualizar un registro de ${model} por ID`,
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
          description: "Registro actualizado con éxito",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: { type: "string", example: "Registro actualizado correctamente" },
                  rowsAffected: { type: "integer", example: 1 }
                }
              }
            }
          }
        },
        "400": { description: "Datos inválidos" },
        "404": { description: "Registro no encontrado" },
        "500": { description: "Error interno del servidor" }
      }
    },
    delete: {
      summary: `Eliminar un registro de ${model} por ID`,
      tags: [tag],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "integer" } }
      ],
      responses: {
        "200": {
          description: "Registro eliminado con éxito",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: { type: "string", example: "Registro eliminado correctamente" },
                  rowsAffected: { type: "integer", example: 1 }
                }
              }
            }
          }
        },
        "404": { description: "Registro no encontrado" },
        "500": { description: "Error interno del servidor" }
      }
    }
  };
});

try {
  // yamljs stringify
  const yamlString = YAML.stringify(doc, 20, 2);
  fs.writeFileSync(SWAGGER_PATH, yamlString, 'utf-8');
  console.log("Swagger generated successfully! " + Object.keys(doc.paths).length + " paths written.");
} catch (e) {
  console.error("Failed to stringify YAML", e);
}
