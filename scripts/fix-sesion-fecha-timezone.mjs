import BD from '../src/db/BD.js';

// Bug: fecha_sesion era `timestamp` (sin timezone). Postgres guardaba los
// digitos literales del ISO string que manda el frontend (ignorando el 'Z'),
// y al leerlos, node-postgres los reinterpretaba como hora local del proceso
// Node (America/Argentina/Buenos_Aires, UTC-3), sumando 3 horas de mas en
// cada sesion nueva. La conversion AT TIME ZONE 'UTC' toma esos mismos
// digitos literales tal cual estan (que ya representan la hora UTC que el
// frontend quiso guardar) y los vuelve timestamptz sin correrlos.
(async () => {
  try {
    await BD.execute(`
      ALTER TABLE sesiones_profesionales
      ALTER COLUMN fecha_sesion TYPE timestamptz
      USING fecha_sesion AT TIME ZONE 'UTC'
    `);
    console.log('fecha_sesion migrada a timestamptz. Las sesiones nuevas ya no se corren 3 horas.');
    process.exit(0);
  } catch (error) {
    console.error('No se pudo migrar fecha_sesion a timestamptz:', error.message);
    process.exit(1);
  }
})();
