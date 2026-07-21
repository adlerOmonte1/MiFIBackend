# ESPECIFICACIÓN DE REQUERIMIENTOS FUNCIONALES (RF)

---

## MÓDULO: Autenticación y Gestión de Usuario

| RF | Descripción | HU de origen |
|---|---|---|
| RF-01 | El sistema debe permitir a un estudiante registrarse mediante correo electrónico y contraseña. | AUT-01 |
| RF-02 | El sistema debe validar que el correo electrónico no esté previamente registrado. | AUT-01 |
| RF-03 | El sistema debe validar que la contraseña tenga un mínimo de 8 caracteres. | AUT-01 |
| RF-04 | El sistema debe almacenar la contraseña de forma cifrada (hash). | AUT-01 |
| RF-05 | El sistema debe permitir el inicio de sesión mediante correo y contraseña. | AUT-02 |
| RF-06 | El sistema debe generar un token de sesión válido por 7 días tras la autenticación exitosa. | AUT-02 |
| RF-07 | El sistema debe bloquear temporalmente el inicio de sesión tras 5 intentos fallidos consecutivos. | AUT-02 |
| RF-08 | El sistema debe invalidar el token de sesión al cerrar sesión. | AUT-02 |

---

## MÓDULO: Gestión de Transacciones

| RF | Descripción | HU de origen |
|---|---|---|
| RF-09 | El sistema debe permitir registrar una transacción con monto, tipo (ingreso/egreso), categoría y fecha. | TRX-01 |
| RF-10 | El sistema debe validar que el monto ingresado sea mayor a 0. | TRX-01 |
| RF-11 | El sistema debe impedir el registro de transacciones con fecha futura. | TRX-01 |
| RF-12 | El sistema debe actualizar el dashboard inmediatamente después de registrar una transacción. | TRX-01 |
| RF-13 | El sistema debe permitir editar los campos de una transacción existente. | TRX-02 |
| RF-14 | El sistema debe permitir eliminar una transacción previa confirmación del usuario. | TRX-02 |
| RF-15 | El sistema debe recalcular automáticamente el dashboard y las metas de ahorro asociadas tras editar o eliminar una transacción. | TRX-02 |

---

## MÓDULO: Automatización del Registro (OCR)

| RF | Descripción | HU de origen |
|---|---|---|
| RF-16 | El sistema debe permitir capturar una imagen mediante la cámara del dispositivo. | OCR-01 |
| RF-17 | El sistema debe procesar la imagen capturada mediante un servicio de reconocimiento óptico de caracteres (OCR). | OCR-01 |
| RF-18 | El sistema debe mostrar el monto detectado en un campo editable antes de guardar la transacción. | OCR-01 |
| RF-19 | El sistema debe permitir el registro manual como alternativa si el OCR no logra detectar un monto válido. | OCR-01 |

---

## MÓDULO: Validación de Registros Automáticos

| RF | Descripción | HU de origen |
|---|---|---|
| RF-20 | El sistema debe presentar toda transacción detectada automáticamente (OCR o correo bancario) en una pantalla de confirmación antes de almacenarla. | CNF-01 |
| RF-21 | El sistema debe permitir al estudiante guardar, editar o descartar una transacción sugerida. | CNF-01 |
| RF-22 | El sistema debe descartar automáticamente las sugerencias no confirmadas después de 24 horas. | CNF-01 |

---

## MÓDULO: Integración con Notificaciones Bancarias

| RF | Descripción | HU de origen |
|---|---|---|
| RF-23 | El sistema debe permitir autorizar el acceso de lectura a la cuenta de Gmail del estudiante mediante OAuth 2.0. | GML-01 |
| RF-24 | El sistema debe almacenar el token de acceso de Gmail de forma cifrada en el backend. | GML-01 |
| RF-25 | El sistema debe permitir revocar el acceso a Gmail desde el perfil del estudiante. | GML-01 |
| RF-26 | El sistema debe identificar correos provenientes de remitentes bancarios configurados. | GML-02 |
| RF-27 | El sistema debe extraer el monto y tipo de movimiento de los correos bancarios identificados. | GML-02 |
| RF-28 | El sistema debe ejecutar la búsqueda de notificaciones bancarias cada 6 horas. | GML-02 |
| RF-29 | El sistema debe enviar toda transacción detectada por correo al flujo de confirmación (CNF-01) antes de almacenarla. | GML-02 |

---

## MÓDULO: Gestión del Ahorro

| RF | Descripción | HU de origen |
|---|---|---|
| RF-30 | El sistema debe permitir crear una meta de ahorro con monto objetivo y fecha límite. | AHO-01 |
| RF-31 | El sistema debe validar que el monto objetivo sea mayor a 0 y la fecha límite sea futura. | AHO-01 |
| RF-32 | El sistema debe permitir múltiples metas de ahorro activas por estudiante. | AHO-01 |
| RF-33 | El sistema debe calcular el porcentaje de cumplimiento de cada meta de ahorro activa. | AHO-02 |
| RF-34 | El sistema debe mostrar visualmente el progreso de ahorro mediante una barra o gráfico. | AHO-02 |
| RF-35 | El sistema debe recalcular el progreso automáticamente al registrar, editar o eliminar una transacción vinculada a la meta. | AHO-02 |

---

## MÓDULO: Categorización y Análisis de Gastos

| RF | Descripción | HU de origen |
|---|---|---|
| RF-36 | El sistema debe permitir asignar una categoría predefinida a cada transacción de egreso. | CAT-01 |
| RF-37 | El sistema debe permitir consultar el monto total de gastos agrupado por categoría. | CAT-01 |
| RF-38 | El sistema debe marcar automáticamente como "gasto hormiga" toda transacción de egreso igual o menor a un umbral configurable. | CAT-02 |
| RF-39 | El sistema debe calcular el porcentaje de gastos hormiga sobre el total de egresos del periodo. | CAT-02 |

---

## MÓDULO: Panel de Control

| RF | Descripción | HU de origen |
|---|---|---|
| RF-40 | El sistema debe mostrar un resumen consolidado de ingresos, egresos y ahorro del periodo seleccionado. | DSH-01 |
| RF-41 | El sistema debe permitir filtrar la información del dashboard por semana o por mes. | DSH-01 |

---

## MÓDULO: Usabilidad y Evaluación

| RF | Descripción | HU de origen |
|---|---|---|
| RF-42 | El sistema debe presentar el cuestionario estándar SUS de 10 ítems durante el periodo de postest. | USA-01 |
| RF-43 | El sistema debe calcular y almacenar el puntaje SUS de cada estudiante. | USA-01 |
| RF-44 | El sistema debe impedir que un estudiante responda la encuesta más de una vez. | USA-01 |

---

## MÓDULO: Calidad y Soporte a la Investigación

| RF | Descripción | HU de origen |
|---|---|---|
| RF-45 | El sistema debe registrar automáticamente los errores no controlados ocurridos durante su ejecución. | CAL-01 |
| RF-46 | El sistema debe permitir al investigador consultar el conteo de errores agrupado por módulo y periodo. | CAL-01 |

---
