import BD from '../src/db/BD.js';

// notificaciones tenia el mismo problema de columnas `timestamp` sin
// timezone, pero con una particularidad: cada columna se escribia de una
// forma distinta, asi que cada una necesita una conversion distinta al
// migrar a timestamptz:
//  - fecha_creacion se asigna en JS con `new Date()` (objeto, no string).
//    node-postgres serializa ese objeto usando los getters LOCALES del
//    proceso Node (America/Argentina/Buenos_Aires), asi que los digitos ya
//    guardados representan hora LOCAL, no UTC.
//  - fecha_lectura se asigna con `NOW()` de Postgres (con la sesion en UTC),
//    asi que esos digitos ya guardados representan hora UTC.
(async () => {
  try {
    await BD.execute(`
      ALTER TABLE notificaciones
      ALTER COLUMN fecha_creacion TYPE timestamptz
        USING fecha_creacion AT TIME ZONE 'America/Argentina/Buenos_Aires',
      ALTER COLUMN fecha_lectura TYPE timestamptz
        USING fecha_lectura AT TIME ZONE 'UTC'
    `);
    console.log('notificaciones: fecha_creacion/fecha_lectura migradas a timestamptz.');
    process.exit(0);
  } catch (error) {
    console.error('No se pudo migrar las fechas de notificaciones:', error.message);
    process.exit(1);
  }
})();
