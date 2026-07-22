# ESPECIFICACIÓN DE CASOS DE USO CRÍTICOS
---

# UC-OCR-01 — Escanear boleta con reconocimiento óptico

| Campo | Descripción |
|:--|:--|
| **Código** | UC-OCR-01 |
| **Nombre** | Escanear boleta con reconocimiento óptico (OCR) |
| **Actor principal** | Estudiante |
| **Actor(es) secundario(s)** | Google Vision API |
| **Relación** | Incluye a UC-CNF-01 |
| **Precondiciones** | PRE1: El estudiante ha iniciado sesión (UC-AUT-02). PRE2: El estudiante otorgó permiso de cámara a la aplicación. |
| **Postcondición (éxito)** | Se genera una sugerencia de transacción con el monto detectado, que ingresa al flujo de confirmación (UC-CNF-01). |

## Descripción
Permite al estudiante capturar la imagen de una boleta o recibo para que el sistema extraiga automáticamente el monto, reduciendo el tiempo de registro manual.

## Flujo Básico
1. El estudiante selecciona "Escanear boleta" desde el módulo de transacciones.
2. El sistema activa la cámara del dispositivo.
3. El estudiante captura una imagen de la boleta.
4. El sistema envía la imagen al backend.
5. El backend envía la imagen al servicio Google Vision API.
6. Google Vision API procesa la imagen y devuelve el texto detectado.
7. El backend extrae el monto mediante un algoritmo de parsing sobre el texto detectado.
8. El sistema muestra el monto detectado en un formulario editable.
9. Se ejecuta el caso de uso incluido UC-CNF-01 (Confirmar transacción detectada).
10. El caso de uso finaliza cuando el estudiante confirma o descarta la sugerencia en UC-CNF-01.

## Flujos Alternos
**FA1 (desde el paso 3):** El estudiante selecciona una imagen existente en la galería en lugar de capturarla con la cámara. El flujo continúa en el paso 4.

**FA2 (desde el paso 8):** El estudiante edita manualmente el monto detectado antes de continuar al flujo de confirmación.

## Flujos de Excepción
**FE1 (desde el paso 6):** Google Vision API no logra detectar texto legible en la imagen. El sistema muestra "No se pudo leer la boleta" y ofrece las opciones "Reintentar" o "Registrar manualmente" (deriva a UC-TRX-01).

**FE2 (desde el paso 5):** Falla la conexión con el backend o con Google Vision API (timeout). El sistema muestra un mensaje de error de conexión y permite reintentar.

**FE3 (desde el paso 7):** El texto se detecta pero no contiene un monto reconocible. El sistema solicita al estudiante ingresar el monto manualmente en el mismo formulario, sin descartar la captura.

## Requisitos Especiales
- El tiempo de respuesta del servicio de OCR no debe superar 10 segundos (requisito no funcional de rendimiento).
- La imagen se almacena en Supabase Storage asociada a la transacción únicamente si esta se confirma en UC-CNF-01, no antes.

---

# UC-CNF-01 — Confirmar transacción detectada automáticamente

| Campo | Descripción |
|:--|:--|
| **Código** | UC-CNF-01 |
| **Nombre** | Confirmar transacción detectada automáticamente |
| **Actor principal** | Estudiante |
| **Actor(es) secundario(s)** | Ninguno |
| **Relación** | Incluido por UC-OCR-01 y UC-GML-02 |
| **Precondiciones** | PRE1: Existe una sugerencia de transacción generada por UC-OCR-01 o UC-GML-02. |
| **Postcondición (éxito)** | La transacción queda registrada con los valores confirmados o editados; o la sugerencia es descartada sin persistir datos. |

## Descripción
Ningún dato originado por un mecanismo automático se almacena sin que el estudiante lo revise explícitamente. Este caso de uso es el punto de control de calidad de todos los datos automáticos que alimentan la variable dependiente.

## Flujo Básico
1. El sistema presenta la sugerencia de transacción con monto, tipo, fecha y origen (OCR o correo bancario).
2. El estudiante revisa los datos mostrados.
3. El estudiante selecciona "Guardar".
4. El sistema almacena la transacción con los valores mostrados.
5. El sistema actualiza el dashboard y, si corresponde, la meta de ahorro asociada (dispara UC-AHO-02).

## Flujos Alternos
**FA1 (desde el paso 3):** El estudiante selecciona "Editar", modifica uno o más campos (monto, categoría, fecha) y confirma. El flujo continúa en el paso 4 con los valores editados.

**FA2 (desde el paso 3):** El estudiante selecciona "Descartar". El sistema elimina la sugerencia sin almacenar ningún registro. El caso de uso finaliza.

## Flujos de Excepción
**FE1 (desde el paso 1):** La sugerencia superó las 24 horas sin confirmación. El sistema la descarta automáticamente antes de presentarla al estudiante.

**FE2 (desde el paso 4):** Falla el guardado por pérdida de conexión. El sistema conserva la sugerencia pendiente y notifica al estudiante para reintentar, sin perder el dato capturado.

## Requisitos Especiales
- Solo se presenta una sugerencia a la vez; si existen varias pendientes, se muestran en cola.
- El origen de la sugerencia (OCR o correo bancario) debe mostrarse siempre, por transparencia del dato ante el estudiante.
- **Control de acceso (RF-50):** el sistema verifica que la sugerencia pertenezca al usuario autenticado antes de confirmarla, editarla o descartarla; si no le pertenece, responde "recurso no encontrado" (prevención de IDOR). La transacción resultante hereda el `usuario_id` del token, nunca uno provisto por el cliente.

---

# UC-GML-02 — Importación de transacción desde correo bancario

| Campo | Descripción |
|:--|:--|
| **Código** | UC-GML-02 |
| **Nombre** | Importar transacción desde correo bancario |
| **Actor principal** | Gmail API (dispara el caso de uso de forma programada) |
| **Actor(es) secundario(s)** | Estudiante (interviene en el flujo incluido de confirmación) |
| **Relación** | Incluye a UC-CNF-01. Requiere que UC-GML-01 esté completado previamente. |
| **Precondiciones** | PRE1: El estudiante completó UC-GML-01 y el token de acceso a Gmail es válido. |
| **Postcondición (éxito)** | Se genera una sugerencia de transacción que ingresa al flujo UC-CNF-01. |

## Descripción
El sistema detecta de forma periódica las notificaciones bancarias en el correo del estudiante y genera una sugerencia de transacción, reduciendo el registro manual de operaciones bancarias.

## Flujo Básico
1. El proceso programado del backend (cron, cada 6 horas) ejecuta la búsqueda de correos nuevos en la cuenta de Gmail conectada.
2. El sistema filtra los correos cuyo remitente coincide con la lista de bancos configurados (ej. BCP, Interbank, BBVA).
3. Para cada correo coincidente, el sistema aplica el parser correspondiente al banco (patrón Strategy) para extraer monto, tipo de movimiento y fecha.
4. El sistema genera una sugerencia de transacción con los datos extraídos.
5. Se ejecuta el caso de uso incluido UC-CNF-01 (Confirmar transacción detectada).
6. El caso de uso finaliza cuando el estudiante confirma o descarta la sugerencia.

## Flujos Alternos
**FA1 (desde el paso 2):** No se encuentran correos nuevos de bancos configurados en la ejecución actual. El sistema finaliza el ciclo sin generar sugerencias y espera la siguiente ejecución programada.

## Flujos de Excepción
**FE1 (desde el paso 1):** El token de acceso a Gmail expiró o fue revocado. El sistema marca la integración como "desconectada" y notifica al estudiante que debe reconectar su cuenta (deriva a UC-GML-01).

**FE2 (desde el paso 3):** El parser del banco no logra extraer un monto válido del correo (cambio de formato no contemplado). El sistema descarta ese correo específico y registra el evento en el log de errores (relacionado con UC-CAL-01), sin generar una sugerencia incompleta.

**FE3 (desde el paso 1):** La API de Gmail devuelve un error de límite de solicitudes (rate limit). El sistema pospone la ejecución hasta el siguiente ciclo programado.

## Requisitos Especiales
- El sistema no almacena el contenido completo del correo, solo los datos estructurados extraídos (monto, tipo, fecha) — regla de privacidad ya definida en la HU.
- El alcance de bancos soportados en el piloto se limita a 2-3 entidades; es extensible sin modificar el código existente gracias al patrón Strategy.

---

# UC-AHO-02 — Ver progreso de ahorro

| Campo | Descripción |
|:--|:--|
| **Código** | UC-AHO-02 |
| **Nombre** | Ver progreso de ahorro |
| **Actor principal** | Estudiante |
| **Actor(es) secundario(s)** | Ninguno |
| **Relación** | Puede ser disparado internamente por UC-CNF-01 o UC-TRX-02 (recalculo tras confirmar o editar transacciones) |
| **Precondiciones** | PRE1: El estudiante ha creado al menos una meta de ahorro (UC-AHO-01). |
| **Postcondición (éxito)** | Se muestra el monto ahorrado, el monto objetivo y el porcentaje de cumplimiento actualizado. |

## Descripción
Permite al estudiante visualizar el porcentaje de cumplimiento de una meta de ahorro activa, calculado en tiempo real a partir de las transacciones vinculadas a dicha meta — es el caso de uso que alimenta directamente dos de los indicadores de tu variable dependiente.

## Flujo Básico
1. El estudiante accede a la sección "Mis metas de ahorro".
2. El sistema obtiene las metas activas del estudiante.
3. Para cada meta, el sistema calcula el monto ahorrado sumando las transacciones marcadas como "ahorro" vinculadas a esa meta.
4. El sistema calcula el porcentaje de cumplimiento: (monto ahorrado / monto objetivo) × 100.
5. El sistema muestra la meta con una barra de progreso y el porcentaje calculado.

## Flujos Alternos
**FA1 (desde el paso 4):** El monto ahorrado supera el monto objetivo. El sistema limita la visualización del porcentaje a 100% e indica "meta cumplida".

**FA2 (desde el paso 2):** El estudiante no tiene ninguna meta activa. El sistema muestra un mensaje invitando a crear una nueva meta (deriva a UC-AHO-01).

## Flujos de Excepción
**FE1 (desde el paso 3):** No existen transacciones vinculadas a la meta todavía. El sistema muestra el progreso en 0%, sin generar error.

**FE2 (desde el paso 2):** Falla la conexión con el backend al solicitar las metas. El sistema muestra un mensaje de error y permite reintentar la carga.

## Requisitos Especiales
- El cálculo se ejecuta en tiempo real cada vez que se accede a la pantalla; no se almacena un valor precalculado, para evitar inconsistencias tras ediciones o eliminaciones de transacciones (relacionado con UC-TRX-02).
- **Control de acceso (RF-50):** todas las consultas de metas y de transacciones vinculadas se acotan por el `usuario_id` del token; un estudiante no puede consultar el progreso de ahorro de otro.

---

## RESUMEN DE TRAZABILIDAD

| Caso de uso | HU de origen | RF relacionados |
|:--|:--|:--|
| UC-OCR-01 | OCR-01 | RF-16 a RF-19 |
| UC-CNF-01 | CNF-01 | RF-20 a RF-22 |
| UC-GML-02 | GML-02 | RF-26 a RF-29 |
| UC-AHO-02 | AHO-02 | RF-33 a RF-35 |
