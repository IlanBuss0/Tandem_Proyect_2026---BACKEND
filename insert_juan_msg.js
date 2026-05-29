import BD from './src/db/BD.js';
(async () => {
    try {
        const sql = "INSERT INTO mensajes (id_chat, id_usuario_emisor, id_tipo_mensaje, contenido, fecha_envio, eliminado) VALUES (3, 17, 1, 'Hola, soy Juan (Perteneciente)', NOW(), false)";
        await BD.execute(sql);
        console.log('Mensaje de prueba de Juan insertado correctamente');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
