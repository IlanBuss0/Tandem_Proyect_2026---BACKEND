import BD from './src/db/BD.js';

(async () => {
    try {
        await BD.execute("INSERT INTO tipos_notificaciones (nombre, orden) SELECT 'Chat', 4 WHERE NOT EXISTS (SELECT 1 FROM tipos_notificaciones WHERE nombre = 'Chat')");
        console.log('Tipo Notificacion Chat OK');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
