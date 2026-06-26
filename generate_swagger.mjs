import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import YAML from 'yamljs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ENTITIES_DIR = path.join(__dirname, 'src', 'entities');
const SWAGGER_PATH = path.join(__dirname, 'src', 'configs', 'swagger.yaml');

const TAG_GROUPS = {
  'Autenticacion': [],
  'Gestion de Usuarios': ['Usuario', 'TipoUsuario', 'RolAdministrador'],
  'Modulo Perteneciente': ['Perteneciente', 'NivelApoyo', 'AutonomiaOperativa'],
  'Modulo Tutor': ['Tutor', 'VinculoTutorPerteneciente', 'InviteVinculo'],
  'Modulo Profesional': ['Profesional', 'ValidacionProfesional', 'EstadoValidacionProfesional', 'PerfilProfesional', 'ResenaProfesional', 'SesionProfesional'],
  'Actividades y Seguimiento': ['Actividad', 'ActividadPersonalizada', 'ActividadAsignada', 'FavoritoActividad', 'CalificacionActividad', 'EvaluacionAutonomia', 'PuntoOtorgado', 'DificultadActividad', 'EstadoActividad', 'TipoActividad'],
  'Comunicacion y Social': ['Chat', 'ParticipanteChat', 'Mensaje', 'Notificacion', 'Contacto', 'BloqueoUsuario', 'ReporteUsuario', 'TipoChat', 'TipoMensaje', 'TipoNotificacion', 'EstadoContacto', 'EstadoReporte'],
  'Archivos y Multimedia': ['Archivo', 'AlcanceArchivo', 'PermisoArchivo', 'MensajeArchivo', 'Avatar', 'ItemAvatar', 'InventarioAvatar', 'TipoArchivo', 'TipoItemAvatar', 'TipoPermisoArchivo', 'Pictograma'],
  'Finanzas y Suscripciones': ['SaldoPunto', 'MovimientoPunto', 'CompraPunto', 'PaquetePunto', 'PagoSuscripcion', 'PlanSuscripcion', 'BeneficiarioSuscripcion', 'TipoMovimientoPunto', 'EstadoPago', 'EstadoSuscripcion'],
  'Sistema y Auditoria': [],
};

const EXCLUDED_FROM_AUTH = ['Autenticacion', 'Pictograma'];

function getTag(model) {
  for (const [tag, models] of Object.entries(TAG_GROUPS)) {
    if (models.includes(model)) return tag;
  }

  if (model.includes('Vinculo')) return 'Modulo Tutor';
  if (model.includes('Permiso') || model.includes('Permisos') || model.includes('Catalogo')) return 'Modulo Perteneciente';
  if (model.includes('Ubicacion') || model.includes('Dispositivo') || model.includes('ZonaSegura') || model.includes('Evento')) return 'Modulo Perteneciente';
  if (model.includes('Configuracion') || model.includes('Auditoria') || model.includes('Entidad')) return 'Sistema y Auditoria';

  return 'Sistema y Auditoria';
}

function getPlural(word) {
  if (word.toLowerCase().endsWith('chat')) return word + 's';
  if (word.toLowerCase().endsWith('s')) return word + 'es';
  if (word.match(/[aeiou]$/i)) return word + 's';
  return word + 'es';
}

function getBaseName(word) {
  const lower = word.toLowerCase();
  if (lower === 'usuario') return 'usuarios';
  if (lower === 'chat') return 'chats';
  if (lower.endsWith('chat')) return word.toLowerCase() + 's';
  if (lower.endsWith('s')) return word.toLowerCase() + 'es';
  if (lower.match(/[aeiou]$/)) return word.toLowerCase() + 's';
  return word.toLowerCase() + 'es';
}

function detectNullable(propName, content) {
  if (propName.includes('fecha_') && !['fecha_creacion', 'fecha_envio', 'fecha_asignacion', 'fecha_solicitud', 'fecha_registro', 'fecha_bloqueo', 'fecha_alta', 'fecha_ingreso', 'fecha_modificacion', 'fecha_obtencion', 'fecha_calificacion', 'fecha_evaluacion', 'fecha_creacion', 'fecha_marcado', 'fecha_reporte', 'fecha_sesion', 'fecha_subida'].includes(propName)) {
    return true;
  }
  if (propName === 'descripcion' || propName === 'observacion' || propName === 'detalle' || propName === 'motivo' || propName === 'recomendacion' || propName === 'nota_sesion' || propName === 'comprobante_url' || propName === 'avatar_json') {
    return true;
  }
  return false;
}

function detectRequired(propName) {
  const requiredFields = ['id', 'id_usuario', 'id_perteneciente', 'id_tutor', 'id_profesional', 'id_chat', 'nombre', 'nombre_usuario', 'correo', 'contrasena_hash', 'id_tipo_usuario', 'activo', 'fecha_creacion'];
  return requiredFields.includes(propName);
}

function getPropertySchema(propName) {
  const p = propName.toLowerCase();
  let schema = { type: 'string', example: 'string' };

  if (p === 'id' || p.startsWith('id_')) {
    schema = { type: 'integer', example: 1 };
  } else if (p.includes('correo') || p.includes('email')) {
    schema = { type: 'string', format: 'email', example: 'usuario@example.com' };
  } else if (p.includes('contrasena') || p === 'contrasena') {
    schema = { type: 'string', format: 'password', example: '••••••••' };
  } else if (p.includes('hash') || p === 'token_hash') {
    schema = { type: 'string', example: 'a1b2c3d4e5f6...' };
  } else if (p.includes('fecha') || p.includes('timestamp')) {
    schema = { type: 'string', format: 'date-time', example: '2026-05-26T19:00:00.000Z' };
  } else if (p.includes('telefono')) {
    schema = { type: 'string', example: '+5491123456789' };
  } else if (p.startsWith('es_') || p === 'activo' || p === 'verificado' || p.includes('habilitado') || p === 'leida' || p === 'eliminado' || p === 'pagado' || p === 'puede_autogestionarse' || p === 'equipado' || p === 'notificar_entrada' || p === 'notificar_salida') {
    schema = { type: 'boolean', example: true };
  } else if (p.includes('latitud')) {
    schema = { type: 'number', format: 'float', example: -34.6037 };
  } else if (p.includes('longitud')) {
    schema = { type: 'number', format: 'float', example: -58.3816 };
  } else if (p.includes('monto') || p.includes('precio') || p.includes('saldo')) {
    schema = { type: 'number', format: 'float', example: 150.50 };
  } else if (p.includes('peso') || p.includes('peso_bytes')) {
    schema = { type: 'integer', example: 102400 };
  } else if (p.includes('cantidad') || p.includes('puntos') || p.includes('stock') || p.includes('nivel') || p.includes('experiencia') || p.includes('radio') || p.includes('orden')) {
    schema = { type: 'integer', example: 10 };
  } else if (p.includes('nombre') || p.includes('titulo')) {
    schema = { type: 'string', example: 'Nombre de ejemplo' };
  } else if (p.includes('apellido')) {
    schema = { type: 'string', example: 'García' };
  } else if (p.includes('url') || p.includes('ruta')) {
    schema = { type: 'string', format: 'uri', example: 'https://example.com/recurso.jpg' };
  } else if (p.includes('descripcion') || p.includes('observacion') || p.includes('detalle')) {
    schema = { type: 'string', example: 'Descripción detallada del registro.' };
  } else if (p.includes('json') || p === 'avatar_json') {
    schema = { type: 'object', example: { key: 'value' } };
  } else if (p === 'codigo' || p.includes('token')) {
    schema = { type: 'string', example: 'abc123def456' };
  } else if (p.includes('parentesco') || p.includes('profesion') || p.includes('especialidad') || p.includes('matricula') || p.includes('institucion')) {
    schema = { type: 'string', example: 'Profesional de ejemplo' };
  } else if (p.includes('puntaje')) {
    schema = { type: 'integer', example: 5 };
  }

  return schema;
}

function getModelDescription(model) {
  const descriptions = {
    'Usuario': 'Usuario del sistema. Puede ser perteneciente, tutor, profesional o administrador según id_tipo_usuario.',
    'Perteneciente': 'Persona con TEA vinculada a la plataforma. Puede ser autogestionado o tutelado.',
    'Tutor': 'Tutor responsable de uno o más pertenecientes. Autoriza permisos y gestiona vínculos.',
    'Profesional': 'Profesional validado (terapeuta, docente) que trabaja con pertenecientes vinculados.',
    'Chat': 'Conversación entre dos o más usuarios. Persiste en PostgreSQL y usa Socket.io para tiempo real.',
    'Mensaje': 'Mensaje enviado en un chat. Se emite en tiempo real vía Socket.io al room correspondiente.',
    'ParticipanteChat': 'Relación entre un usuario y un chat. Define membresía y permisos de administración.',
    'Notificacion': 'Notificación push para un usuario. Se crea al recibir mensajes o por eventos del sistema.',
    'Actividad': 'Actividad del catálogo general. Puede ser asignada a pertenecientes.',
    'ActividadAsignada': 'Actividad asignada a un perteneciente específico, con seguimiento de estado.',
  };
  return descriptions[model] || `Entidad que representa ${model} en la base de datos.`;
}

const doc = {
  openapi: '3.0.3',
  info: {
    title: 'Tándem 2026 — API Generada',
    version: '1.0.0',
    description: `# API de Tándem 2026

Documentación generada automáticamente desde las entidades del proyecto.

## Autenticación
Esta API usa **Cookie-based authentication** con JWT custom HMAC-SHA256.
Las cookies se configuran automáticamente al iniciar sesión en \`/api/auth/login\`.

Para probar los endpoints protegidos:
1. Hacé login en \`POST /api/auth/login\`
2. Las cookies se envían automáticamente (el navegador las maneja)

## Documentación de arquitectura
Mirá los diagramas interactivos en [/docs](/docs) para entender la base de datos,
flujo de autenticación, chat realtime, Redis y APIs externas.`,
  },
  servers: [
    { url: 'http://localhost:3000', description: 'Servidor de Desarrollo Local' },
  ],
  externalDocs: {
    url: '/docs',
    description: 'Documentación de arquitectura con diagramas interactivos',
  },
  security: [
    { CookieAuth: [] },
  ],
  components: {
    securitySchemes: {
      CookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'tandem_access_token',
      },
    },
    schemas: {},
  },
  paths: {
    '/api/auth/login': {
      post: {
        summary: 'Iniciar sesión',
        description: 'Autentica al usuario con correo/nombre_usuario y contraseña. Configura cookies HttpOnly para JWT, refresh token y CSRF.',
        tags: ['Autenticación'],
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nombre_usuario', 'contrasena'],
                properties: {
                  nombre_usuario: { type: 'string', example: 'juan123', description: 'Nombre de usuario o correo electrónico' },
                  contrasena: { type: 'string', format: 'password', example: 'miContraseña123' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Login exitoso. Se configuran cookies tandem_access_token, tandem_refresh_token y tandem_csrf_token.' },
          '400': { description: 'Datos inválidos o faltantes' },
          '401': { description: 'Credenciales incorrectas' },
        },
      },
    },
    '/api/auth/register': {
      post: {
        summary: 'Registrar nuevo usuario',
        description: 'Crea un nuevo usuario con contraseña hasheada (Argon2id). Configura cookies de sesión automáticamente.',
        tags: ['Autenticación'],
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nombre_usuario', 'contrasena', 'correo', 'id_tipo_usuario'],
                properties: {
                  nombre_usuario: { type: 'string', example: 'juan123' },
                  contrasena: { type: 'string', format: 'password', example: 'miContraseña123' },
                  correo: { type: 'string', format: 'email', example: 'juan@example.com' },
                  id_tipo_usuario: { type: 'integer', example: 1, description: '1=Perteneciente, 2=Tutor, 3=Profesional, 4=Admin' },
                  nombre: { type: 'string', example: 'Juan' },
                  apellido: { type: 'string', example: 'Pérez' },
                  telefono: { type: 'string', example: '+5491123456789' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Usuario creado exitosamente. Cookies configuradas.' },
          '400': { description: 'Datos inválidos o usuario ya existe' },
        },
      },
    },
    '/api/auth/refresh': {
      post: {
        summary: 'Renovar access token',
        description: 'Usa el refresh token (cookie) para obtener un nuevo JWT. Si el token fue reutilizado (robo), revoca toda la familia.',
        tags: ['Autenticación'],
        security: [],
        responses: {
          '200': { description: 'Token renovado. Nuevas cookies configuradas.' },
          '401': { description: 'Token inválido, expirado o reutilizado' },
        },
      },
    },
    '/api/auth/logout': {
      post: {
        summary: 'Cerrar sesión',
        description: 'Revoca el refresh token en DB y limpia las cookies.',
        tags: ['Autenticación'],
        responses: {
          '200': { description: 'Sesión cerrada. Cookies eliminadas.' },
        },
      },
    },
    '/api/auth/me': {
      get: {
        summary: 'Obtener usuario actual',
        description: 'Devuelve los datos del usuario autenticado según el JWT en cookie.',
        tags: ['Autenticación'],
        responses: {
          '200': { description: 'Datos del usuario autenticado' },
          '401': { description: 'No autenticado' },
        },
      },
    },
  },
};

const models = [
  'Usuario', 'Perteneciente', 'Tutor', 'Profesional', 'Actividad',
  'ActividadPersonalizada', 'ActividadAsignada', 'FavoritoActividad', 'CalificacionActividad',
  'Avatar', 'SaldoPunto', 'MovimientoPunto', 'EvaluacionAutonomia', 'ZonaSegura',
  'InventarioAvatar', 'ItemAvatar', 'EventoZonaSegura', 'CompraPunto', 'SesionProfesional',
  'Dispositivo', 'UbicacionActual', 'UbicacionHistorial', 'Notificacion', 'Contacto',
  'Chat', 'ParticipanteChat', 'Mensaje', 'BloqueoUsuario', 'ConfiguracionUsuario',
  'ConfiguracionAccesibilidad', 'ReporteUsuario', 'AlcanceArchivo', 'Archivo', 'AuditoriaEvento',
  'AutonomiaOperativa', 'BeneficiarioSuscripcion', 'CatalogoPermisoPerteneciente', 'CatalogoPermisoProfesional',
  'DificultadActividad', 'EntidadAfectadaAuditoria', 'EstadoActividad', 'EstadoContacto', 'EstadoPago',
  'EstadoReporte', 'EstadoSuscripcion', 'EstadoValidacionProfesional', 'EstadoVinculo',
  'HistorialPermisoOtorgadoPerteneciente', 'HistorialPermisoOtorgadoProfesional', 'MensajeArchivo', 'NivelApoyo',
  'PagoSuscripcion', 'PaquetePunto', 'PerfilProfesional', 'PermisoArchivo', 'PermisoOtorgadoPerteneciente',
  'PermisoOtorgadoProfesional', 'PlanSuscripcion', 'PuntoOtorgado', 'ResenaProfesional', 'RolAdministrador',
  'TipoActividad', 'TipoArchivo', 'TipoChat', 'TipoEventoAuditoria', 'TipoEventoZonaSegura', 'TipoItemAvatar',
  'TipoMensaje', 'TipoMovimientoPunto', 'TipoNotificacion', 'TipoPermisoArchivo', 'TipoUsuario', 'ValidacionProfesional',
  'VinculoProfesionalPerteneciente', 'VinculoTutorPerteneciente',
];

models.forEach((model) => {
  const entityFile = path.join(ENTITIES_DIR, `${model}.js`);
  let props = [];

  if (fs.existsSync(entityFile)) {
    const content = fs.readFileSync(entityFile, 'utf-8');
    const constructorMatch = content.match(/constructor\s*\(\s*\{([^}]+)\}/);
    if (constructorMatch) {
      props = constructorMatch[1]
        .split(',')
        .map((s) => s.trim().split('=')[0].trim())
        .filter((s) => s);
    }
  }

  if (props.length === 0) {
    props = ['id', 'nombre', 'descripcion', 'activo'];
  }

  const schemaProperties = {};
  const requiredFields = [];

  props.forEach((p) => {
    schemaProperties[p] = getPropertySchema(p);
    if (detectNullable(p, '')) {
      schemaProperties[p].nullable = true;
    }
    if (detectRequired(p)) {
      requiredFields.push(p);
    }
  });

  doc.components.schemas[model] = {
    description: getModelDescription(model),
    type: 'object',
    properties: schemaProperties,
  };

  if (requiredFields.length > 0) {
    doc.components.schemas[model].required = requiredFields;
  }

  const baseName = getBaseName(model);
  const routeBase = `/api/${baseName}`;
  const tag = getTag(model);
  const requiresAuth = !EXCLUDED_FROM_AUTH.some((ex) => tag.includes(ex));
  const isPictogram = model === 'Pictograma' || model.includes('Pictogram');

  const pathSecurity = requiresAuth ? [{ CookieAuth: [] }] : [];

  const pathDescription = getModelDescription(model);
  const listSummary = `Obtener todos los registros de ${model}`;
  const createSummary = `Crear un nuevo registro de ${model}`;
  const getByIdSummary = `Obtener un registro de ${model} por ID`;
  const updateSummary = `Actualizar un registro de ${model} por ID`;
  const deleteSummary = `Eliminar un registro de ${model} por ID`;

  doc.paths[routeBase] = {
    get: {
      summary: listSummary,
      description: `Obtiene el listado completo de ${pathDescription.toLowerCase()}`,
      tags: [tag],
      security: pathSecurity,
      responses: {
        '200': {
          description: 'Lista obtenida con éxito',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: `#/components/schemas/${model}` },
              },
            },
          },
        },
        '401': { description: 'No autenticado' },
        '500': { description: 'Error interno del servidor' },
      },
    },
    post: {
      summary: createSummary,
      description: `Crea un nuevo registro de ${pathDescription.toLowerCase()}`,
      tags: [tag],
      security: pathSecurity,
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: `#/components/schemas/${model}` },
          },
        },
      },
      responses: {
        '201': {
          description: 'Registro creado con éxito',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  ok: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Registro creado exitosamente' },
                  id: { type: 'integer', example: 1 },
                },
              },
            },
          },
        },
        '400': { description: 'Datos inválidos' },
        '401': { description: 'No autenticado' },
        '500': { description: 'Error interno del servidor' },
      },
    },
  };

  doc.paths[`${routeBase}/{id}`] = {
    get: {
      summary: getByIdSummary,
      description: `Obtiene un registro de ${pathDescription.toLowerCase()} por su ID`,
      tags: [tag],
      security: pathSecurity,
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'ID del registro' },
      ],
      responses: {
        '200': {
          description: 'Registro obtenido con éxito',
          content: {
            'application/json': {
              schema: { $ref: `#/components/schemas/${model}` },
            },
          },
        },
        '401': { description: 'No autenticado' },
        '404': { description: 'Registro no encontrado' },
        '500': { description: 'Error interno del servidor' },
      },
    },
    put: {
      summary: updateSummary,
      description: `Actualiza un registro de ${pathDescription.toLowerCase()} por su ID`,
      tags: [tag],
      security: pathSecurity,
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'ID del registro' },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: `#/components/schemas/${model}` },
          },
        },
      },
      responses: {
        '200': {
          description: 'Registro actualizado con éxito',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  ok: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Registro actualizado correctamente' },
                  rowsAffected: { type: 'integer', example: 1 },
                },
              },
            },
          },
        },
        '400': { description: 'Datos inválidos' },
        '401': { description: 'No autenticado' },
        '404': { description: 'Registro no encontrado' },
        '500': { description: 'Error interno del servidor' },
      },
    },
    delete: {
      summary: deleteSummary,
      description: `Elimina un registro de ${pathDescription.toLowerCase()} por su ID`,
      tags: [tag],
      security: pathSecurity,
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'ID del registro' },
      ],
      responses: {
        '200': {
          description: 'Registro eliminado con éxito',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  ok: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Registro eliminado correctamente' },
                  rowsAffected: { type: 'integer', example: 1 },
                },
              },
            },
          },
        },
        '401': { description: 'No autenticado' },
        '404': { description: 'Registro no encontrado' },
        '500': { description: 'Error interno del servidor' },
      },
    },
  };
});

try {
  const yamlString = YAML.stringify(doc, 20, 2);
  fs.writeFileSync(SWAGGER_PATH, yamlString, 'utf-8');
  const tagCount = Object.keys(doc.components.schemas).length;
  const pathCount = Object.keys(doc.paths).length;
  console.log(`✓ Swagger generado: ${pathCount} paths, ${tagCount} schemas, ${Object.keys(TAG_GROUPS).length} tags`);
  console.log(`→ Guardado en: ${SWAGGER_PATH}`);
} catch (e) {
  console.error('Error al generar YAML:', e.message);
}
