import BD from './src/db/BD.js';
(async () => {
    try {
        const r = await BD.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'usuarios'");
        console.log(JSON.stringify(r));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
