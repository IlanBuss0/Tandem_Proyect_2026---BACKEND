import BD from '../src/db/BD.js';

// Indices para las lecturas que dispara el Inicio del tutor, Chats y
// Pictogramas IA. Son columnas de busqueda (FK) que no tenian indice; hoy las
// tablas son chicas, pero cada consulta hace seq scan y crecen con el uso.
// CONCURRENTLY: no bloquea escrituras mientras se crea. IF NOT EXISTS: se
// puede correr las veces que haga falta.
const INDEXES = [
  ['idx_notificaciones_destino_id', 'notificaciones (id_usuario_destino, id DESC)'],
  ['idx_vinculos_tutor_pert_tutor', 'vinculos_tutor_pertenecientes (id_tutor) WHERE fecha_fin IS NULL'],
  ['idx_vinculos_tutor_pert_perteneciente', 'vinculos_tutor_pertenecientes (id_perteneciente) WHERE fecha_fin IS NULL'],
  ['idx_vinculos_prof_pert_perteneciente', 'vinculos_profesional_pertenecientes (id_perteneciente)'],
  ['idx_sesiones_profesionales_profesional', 'sesiones_profesionales (id_profesional, fecha_sesion DESC)'],
  ['idx_sesiones_profesionales_perteneciente', 'sesiones_profesionales (id_perteneciente, fecha_sesion DESC)'],
  ['idx_participantes_chats_usuario', 'participantes_chats (id_usuario) WHERE fecha_salida IS NULL'],
  ['idx_pictogramas_ia_creador', "pictogramas (id_usuario_creador, fecha_creacion DESC) WHERE origen = 'TANDEM_AI'"],
  ['idx_pictogramas_ia_destino', "pictogramas (id_perteneciente_destino, fecha_creacion DESC) WHERE origen = 'TANDEM_AI'"],
];

(async () => {
  try {
    for (const [name, definition] of INDEXES) {
      await BD.execute(`CREATE INDEX CONCURRENTLY IF NOT EXISTS ${name} ON ${definition}`);
      console.log(`Indice ${name} OK`);
    }
    console.log('Indices de performance creados correctamente.');
    process.exit(0);
  } catch (error) {
    console.error('No se pudieron crear los indices de performance:', error.message);
    process.exit(1);
  }
})();
