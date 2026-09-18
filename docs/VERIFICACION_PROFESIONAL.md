# Verificación profesional

El registro profesional consulta por matrícula el Buscador Nacional de Profesionales de la Salud de Argentina.gob.ar. La respuesta pública carga datos estructurados en `Drupal.settings.refepsProfesionales.allItems`; no existe un endpoint JSON público separado.

Flujo: `matrícula -> resultados -> ficha oficial -> preview -> DNI/PDF417/OCR -> comparación -> cuenta`.

El backend hace un GET para obtener la sesión y el `form_build_id`, seguido de un POST del formulario público con `searchBy=matricula`. Extrae el JSON estructurado del script y normaliza nombre, apellido, DNI, CUIL, código, profesión, especialidad, matrícula, provincia, emisor, estado, activo y sanciones. La ficha seleccionada se vuelve a consultar mediante `POST /api/refeps/details` para evitar depender de datos del cliente.

Solo una matrícula con situación exacta `Habilitado` puede continuar. No se generan constancias, no se descargan PDFs y no se procesa información de constancias.

La validación posterior de DNI permanece sin cambios funcionales y vuelve a consultar la misma ficha seleccionada para comparar identidad y matrícula.
