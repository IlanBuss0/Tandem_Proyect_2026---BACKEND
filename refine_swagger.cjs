const fs = require('fs');
const yaml = require('yamljs');

const inputPath = 'C:\\Users\\Usuario\\Tandem_Proyect_2026---BACKEND\\src\\configs\\swagger.yaml';
const outputPath = 'C:\\Users\\Usuario\\Tandem_Proyect_2026---BACKEND\\src\\configs\\swagger.yaml';

function fixEncoding(str) {
    if (typeof str !== 'string') return str;
    return str
        .replace(/Ã³/g, 'ó')
        .replace(/Ã­/g, 'í')
        .replace(/Ã±/g, 'ñ')
        .replace(/Ã¡/g, 'á')
        .replace(/Ã©/g, 'é')
        .replace(/Ãº/g, 'ú')
        .replace(/Ã“/g, 'Ó')
        .replace(/Ãš/g, 'Ú')
        .replace(/Ã‰/g, 'É')
        .replace(/Ã‘/g, 'Ñ')
        .replace(/Ã/g, 'í'); // Fallback for single Ã often being í in some contexts
}

const tagOrder = [
    'Autenticación',
    'Gestión de Usuarios',
    'Módulo Perteneciente',
    'Módulo Tutor',
    'Módulo Profesional',
    'Actividades y Seguimiento',
    'Comunicación y Social',
    'Archivos y Multimedia',
    'Finanzas y Suscripciones',
    'Sistema y Auditoría'
];

const pathTagMapping = {
    '/auth/login': 'Autenticación',
    '/auth/register': 'Autenticación',
    '/auth/me': 'Autenticación',
    '/usuarios': 'Gestión de Usuarios',
    '/tipos-usuarios': 'Gestión de Usuarios',
    '/roles-administradores': 'Gestión de Usuarios',
    '/pertenecientes': 'Módulo Perteneciente',
    '/avatares': 'Módulo Perteneciente',
    '/inventarios-avatares': 'Módulo Perteneciente',
    '/items-avatares': 'Módulo Perteneciente',
    '/saldos-puntos': 'Módulo Perteneciente',
    '/movimientos-puntos': 'Módulo Perteneciente',
    '/autonomias-operativas': 'Módulo Perteneciente',
    '/zonas-seguras': 'Módulo Perteneciente',
    '/ubicaciones-actuales': 'Módulo Perteneciente',
    '/ubicaciones-historiales': 'Módulo Perteneciente',
    '/tipos-items-avatares': 'Módulo Perteneciente',
    '/tipos-movimientos-puntos': 'Módulo Perteneciente',
    '/niveles-apoyos': 'Módulo Perteneciente',
    '/evaluaciones-autonomias': 'Módulo Perteneciente',
    '/catalogos-permisos-pertenecientes': 'Módulo Perteneciente',
    '/historiales-permisos-otorgados-pertenecientes': 'Módulo Perteneciente',
    '/permisos-otorgados-pertenecientes': 'Módulo Perteneciente',
    '/tutores': 'Módulo Tutor',
    '/vinculos-tutor-pertenecientes': 'Módulo Tutor',
    '/profesionales': 'Módulo Profesional',
    '/sesiones-profesionales': 'Módulo Profesional',
    '/resenas-profesionales': 'Módulo Profesional',
    '/validaciones-profesionales': 'Módulo Profesional',
    '/vinculos-profesionales-pertenecientes': 'Módulo Profesional',
    '/estados-validaciones-profesionales': 'Módulo Profesional',
    '/perfiles-profesionales': 'Módulo Profesional',
    '/catalogos-permisos-profesionales': 'Módulo Profesional',
    '/historiales-permisos-otorgados-profesionales': 'Módulo Profesional',
    '/permisos-otorgados-profesionales': 'Módulo Profesional',
    '/actividades': 'Actividades y Seguimiento',
    '/actividades-personalizadas': 'Actividades y Seguimiento',
    '/actividades-asignadas': 'Actividades y Seguimiento',
    '/favoritos-actividades': 'Actividades y Seguimiento',
    '/calificaciones-actividades': 'Actividades y Seguimiento',
    '/estados-actividades': 'Actividades y Seguimiento',
    '/dificultades-actividades': 'Actividades y Seguimiento',
    '/tipos-actividades': 'Actividades y Seguimiento',
    '/puntos-otorgados': 'Actividades y Seguimiento',
    '/eventos-zonas-seguras': 'Actividades y Seguimiento',
    '/tipos-eventos-zonas-seguras': 'Actividades y Seguimiento',
    '/chats': 'Comunicación y Social',
    '/mensajes': 'Comunicación y Social',
    '/participantes-chats': 'Comunicación y Social',
    '/contactos': 'Comunicación y Social',
    '/notificaciones': 'Comunicación y Social',
    '/bloqueos-usuarios': 'Comunicación y Social',
    '/tipos-chats': 'Comunicación y Social',
    '/tipos-mensajes': 'Comunicación y Social',
    '/tipos-notificaciones': 'Comunicación y Social',
    '/estados-contactos': 'Comunicación y Social',
    '/estados-vinculos': 'Comunicación y Social',
    '/archivos': 'Archivos y Multimedia',
    '/tipos-archivos': 'Archivos y Multimedia',
    '/permisos-archivos': 'Archivos y Multimedia',
    '/tipos-permisos-archivos': 'Archivos y Multimedia',
    '/alcances-archivos': 'Archivos y Multimedia',
    '/mensajes-archivos': 'Archivos y Multimedia',
    '/suscripciones': 'Finanzas y Suscripciones',
    '/beneficiarios-suscripciones': 'Finanzas y Suscripciones',
    '/pagos-suscripciones': 'Finanzas y Suscripciones',
    '/planes-suscripciones': 'Finanzas y Suscripciones',
    '/paquetes-puntos': 'Finanzas y Suscripciones',
    '/compras-puntos': 'Finanzas y Suscripciones',
    '/estados-pagos': 'Finanzas y Suscripciones',
    '/estados-suscripciones': 'Finanzas y Suscripciones',
    '/auditorias-eventos': 'Sistema y Auditoría',
    '/tipos-eventos-auditorias': 'Sistema y Auditoría',
    '/entidades-afectadas-auditorias': 'Sistema y Auditoría',
    '/configuraciones-usuarios': 'Sistema y Auditoría',
    '/configuraciones-accesibilidad': 'Sistema y Auditoría',
    '/reportes-usuarios': 'Sistema y Auditoría',
    '/estados-reportes': 'Sistema y Auditoría',
    '/health': 'Sistema y Auditoría',
    '/dispositivos': 'Sistema y Auditoría'
};

try {
    const rawContent = fs.readFileSync(inputPath, 'utf8');
    const fixedContent = fixEncoding(rawContent);
    const data = yaml.parse(fixedContent);

    data.tags = tagOrder.map(name => ({ name }));

    const newPaths = {};
    // Reorder paths alphabetically for better organization
    const pathKeys = Object.keys(data.paths).sort();

    pathKeys.forEach(path => {
        const methods = data.paths[path];
        const baseResourcePath = path.split('/{')[0];
        const targetTag = pathTagMapping[baseResourcePath] || 'Sistema y Auditoría';

        Object.keys(methods).forEach(method => {
            methods[method].tags = [targetTag];
            if (methods[method].summary) methods[method].summary = fixEncoding(methods[method].summary);
            if (methods[method].description) methods[method].description = fixEncoding(methods[method].description);
            if (methods[method].responses) {
                Object.keys(methods[method].responses).forEach(code => {
                    if (methods[method].responses[code].description) {
                        methods[method].responses[code].description = fixEncoding(methods[method].responses[code].description);
                    }
                });
            }
        });
        newPaths[path] = methods;
    });

    data.paths = newPaths;

    if (data.components && data.components.schemas) {
        Object.keys(data.components.schemas).forEach(schemaName => {
            const schema = data.components.schemas[schemaName];
            if (schema.description) schema.description = fixEncoding(schema.description);
            if (schema.properties) {
                Object.keys(schema.properties).forEach(propName => {
                    if (schema.properties[propName].description) {
                        schema.properties[propName].description = fixEncoding(schema.properties[propName].description);
                    }
                    if (schema.properties[propName].example && typeof schema.properties[propName].example === 'string') {
                        schema.properties[propName].example = fixEncoding(schema.properties[propName].example);
                    }
                });
            }
        });
    }

    const outputYaml = yaml.stringify(data, 20, 2);
    fs.writeFileSync(outputPath, outputYaml, 'utf8');
    console.log('Refinement complete.');
} catch (e) {
    console.error(e);
    process.exit(1);
}
