import PictogramaRepository from '../src/repositories/PictogramaRepository.js';

const repository = new PictogramaRepository();

try {
  await repository.ensureSchemaAsync();
  console.log('Tabla pictogramas lista.');
  process.exit(0);
} catch (error) {
  console.error('No se pudo preparar la tabla pictogramas:', error.message);
  process.exit(1);
}
