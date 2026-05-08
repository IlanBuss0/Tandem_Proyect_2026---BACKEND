import app from './app.js';
import { envConfig } from './configs/env.config.js';
import BD from './db/BD.js';

async function startServer() {
  try {
    const connection = await BD.testConnection();

    console.log('Conexión exitosa a Supabase/PostgreSQL');
    console.log('Fecha desde la base:', connection.fecha_actual);

    app.listen(envConfig.port, () => {
      console.log(`Servidor escuchando en puerto ${envConfig.port}`);
    });
  } catch (error) {
    console.error('No se pudo iniciar el servidor');
    console.error(error.message);
  }
}

startServer();