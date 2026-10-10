// Variables minimas para que los tests corran con un simple `node --test`, sin
// pasar nada a mano. Tiene que importarse PRIMERO: envConfig lee process.env al
// cargarse, y los imports estaticos se evaluan antes que el cuerpo del test.
// `??=` respeta un JWT_SECRET real si ya viene de .env o del entorno.
process.env.JWT_SECRET ??= 'test-secret';
