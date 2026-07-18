import BD from '../src/db/BD.js';

// Mismo bug que fecha_sesion (ver fix-sesion-fecha-timezone.mjs): fecha_envio,
// fecha_edicion y fecha_eliminacion eran `timestamp` sin timezone. Node
// mandaba un Date/ISO en UTC, Postgres guardaba los digitos literales
// ignorando el 'Z', y al leerlos node-postgres los reinterpretaba como hora
// local del proceso (America/Argentina/Buenos_Aires, UTC-3), sumando 3 horas
// de mas en cada mensaje. AT TIME ZONE 'UTC' toma esos mismos digitos (que ya
// representan la hora UTC real de envio) y los vuelve timestamptz sin correrlos.
(async () => {
  try {
    await BD.execute(`
      ALTER TABLE mensajes
      ALTER COLUMN fecha_envio TYPE timestamptz USING fecha_envio AT TIME ZONE 'UTC',
      ALTER COLUMN fecha_edicion TYPE timestamptz USING fecha_edicion AT TIME ZONE 'UTC',
      ALTER COLUMN fecha_eliminacion TYPE timestamptz USING fecha_eliminacion AT TIME ZONE 'UTC'
    `);
    console.log('mensajes: fecha_envio/fecha_edicion/fecha_eliminacion migradas a timestamptz.');
    process.exit(0);
  } catch (error) {
    console.error('No se pudo migrar las fechas de mensajes:', error.message);
    process.exit(1);
  }
})();
