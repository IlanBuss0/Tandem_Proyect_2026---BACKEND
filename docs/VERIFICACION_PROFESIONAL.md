# Verificacion profesional

## Flujo

`matricula -> REFEPS -> constancia -> preview -> PDF417 -> OCR fallback -> vigencia -> matching -> cuenta`

La matricula se valida antes de consultar REFEPS y debe contener solo numeros con al menos cuatro digitos. Una busqueda ambigua se muestra con nombre, apellido, profesion y matricula para que la persona seleccione su registro. La seleccion llama a `POST /api/refeps/constancia`; el backend genera la constancia SISA, descarga el PDF y extrae los datos oficiales. Si la constancia contiene un CUIL valido por formato, el DNI se obtiene de sus ocho digitos centrales y se comprueba contra el documento.

El registro profesional recibe `multipart/form-data`; la imagen debe enviarse en `dni_frente`. La camara intenta leer primero el PDF417 del frente del DNI y envia su texto en `pdf417Raw`. El backend valida el formato posicional, nombre, sexo, DNI y fechas. Para el layout moderno, la fecha de vencimiento se completa con OCR de esa fecha; si PDF417 no se puede decodificar, Tesseract.js procesa el frente completo como fallback. La imagen se procesa unicamente en memoria y no se guarda.

La vigencia se comprueba antes de consultar REFEPS para el matching final. Despues se normalizan tildes, mayusculas, espacios y nombres compuestos, y se comparan nombre, apellido y DNI contra la constancia seleccionada. Solo se asigna `VERIFIED` si existe un unico resultado coincidente y su situacion es `Habilitado`. Un documento ilegible, vencido, ambiguo, una matricula inactiva o datos que no coinciden bloquean la creacion de la cuenta. Un timeout, error HTTP o cambio de estructura queda registrado como `VERIFICATION_ERROR`; no se implementa biometria en este flujo.

## Proveedor REFEPS

`RefepsPublicProvider` hace un GET al buscador para obtener cookie y `form_build_id`, y luego un POST al mismo URL con `searchBy=matricula`, `matricula`, `op=Consultar` y `form_id=argobar_consulta_refeps_profesionales`. El HTML devuelve datos JSON en `Drupal.settings.refepsProfesionales.allItems`.

La estructura real observada es:

- `allItems`: array de profesionales.
- Cada profesional incluye `nombre`, `apellido`, `nroDoc` y `profesiones`.
- Cada profesion incluye `profesionReferencia`, `refepsEspecialidad` y `matriculas`.
- Cada matricula incluye `matricula`, `provinciaMatricula` y `situacionMatricula`.

El proveedor encapsula ese detalle y normaliza nombre, apellido, DNI, profesion, jurisdiccion, matricula y habilitacion.

Si cambia el sitio, actualizar unicamente `RefepsPublicProvider.parseHtml` y sus fixtures. Una respuesta sin la estructura conocida debe producir `STRUCTURE_MISMATCH`, nunca `NOT_FOUND`.

El proveedor implementa `buscarPorMatricula`, `buscarPorDni` y `obtenerConstancia`. Un futuro cliente del WS020 oficial puede reemplazarlo mediante inyeccion en `ValidacionProfesionalService` sin cambiar PDF417, OCR, matching, persistencia ni registro.

## Base de datos y pruebas

Ejecutar `npm run db:professional-verification` para agregar estados y metadatos minimos. Ejecutar `npm run test:professional-verification` para PDF417, OCR fallback, CUIL/DNI, constancia, matching y coordinacion deterministas.

La suite automatica no depende de Internet. Para probar el buscador publico real:

```bash
REFEPS_TEST_MATRICULA=12345 npm run test:refeps-real
```

En Windows, si el entorno local falla con revocacion de certificado antes de llegar al sitio, se puede diagnosticar manualmente con:

```bash
REFEPS_ALLOW_INSECURE_TLS=1 REFEPS_TEST_MATRICULA=12345 npm run test:refeps-real
```

No usar `REFEPS_ALLOW_INSECURE_TLS=1` en produccion.

## Google

`POST /api/auth/google` sigue aceptando JSON para login y para crear cuentas no profesionales. Si se crea una cuenta nueva con rol `profesional`, debe enviarse `multipart/form-data` con `accessToken`, `rol`, `profesion`, `matricula`, `dni_frente`, `pdf417Raw`, `refepsDni` y `jurisdiccion`. El flujo reutiliza la misma verificacion automatica que el registro tradicional.

## Restricciones

Un profesional solo accede a permisos sensibles sobre pertenecientes cuando el vinculo esta activo/aprobado, el tutor aprobo el vinculo si corresponde, ambos usuarios estan activos y el estado profesional es `VERIFIED` (tambien se mantienen alias historicos como `validado`, `aprobado` o `verificado`). `PENDING`, `MANUAL_REVIEW`, `DATA_MISMATCH`, `NOT_FOUND` y `VERIFICATION_ERROR` no habilitan historial, ubicacion, chat profesional, sesiones ni asignaciones.
