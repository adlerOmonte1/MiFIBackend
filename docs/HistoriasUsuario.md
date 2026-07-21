# BACKLOG DE HISTORIAS DE USUARIO
Aplicación móvil MiFi— Gestión financiera personal

---

# AUT-01 — Registro de nueva cuenta de usuario

| Campo | Descripción |
|:--|:--|
| **Identificador** | AUT-01 |
| **Épica** | Autenticación y Gestión de Usuario |
| **Nombre** | Registro de nueva cuenta de usuario |
| **Prioridad** | Alta |
| **Estado** | Pendiente |

## Historia de Usuario
**Como** estudiante nuevo, **quiero** registrar una cuenta con mi correo y una contraseña, **para** poder acceder de forma personal y segura a mis datos financieros.

## Descripción
El sistema debe permitir el autorregistro de estudiantes mediante correo electrónico y contraseña, validando que cada cuenta sea única y cumpla los requisitos mínimos de seguridad, antes de habilitar el acceso a las funcionalidades financieras de la aplicación.

## Detalles
- El correo debe cumplir un formato válido (usuario@dominio).
- La contraseña se almacena cifrada (hash); nunca en texto plano.
- Todos los campos del formulario son obligatorios; no se admite registro parcial.

## Criterios de Aceptación

> **CA01.** Dado que un estudiante ingresa un correo no registrado previamente en el sistema, cuando completa el formulario de registro con una contraseña de al menos 8 caracteres, entonces el sistema crea la cuenta y lo redirige al dashboard principal.

> **CA02.** Dado que un estudiante ingresa un correo ya registrado, cuando intenta completar el registro, entonces el sistema rechaza la operación y muestra un mensaje indicando que el correo ya está en uso.

> **CA03.** Dado que un estudiante ingresa una contraseña de menos de 8 caracteres, cuando intenta enviar el formulario, entonces el sistema impide el envío y muestra un mensaje indicando el requisito mínimo de seguridad.

---

# AUT-02 — Inicio de sesión

| Campo | Descripción |
|:--|:--|
| **Identificador** | AUT-02 |
| **Épica** | Autenticación y Gestión de Usuario |
| **Nombre** | Inicio de sesión |
| **Prioridad** | Alta |
| **Estado** | Pendiente |

## Historia de Usuario
**Como** estudiante registrado, **quiero** iniciar sesión con mi correo y contraseña, **para** acceder a mi información financiera sin perderla entre sesiones.

## Descripción
El sistema debe validar las credenciales del estudiante contra la información almacenada y mantener la sesión activa mediante un token, de manera que el usuario no deba autenticarse repetidamente durante el periodo de uso continuo de la aplicación (fase de intervención X de la investigación).

## Detalles
- El token de sesión expira tras 7 días de inactividad, por seguridad.
- Tras 5 intentos fallidos consecutivos, el sistema bloquea temporalmente los nuevos intentos de inicio de sesión.
- Cerrar sesión invalida el token activo de forma inmediata.

## Criterios de Aceptación

> **CA01.** Dado que un estudiante ingresa un correo y contraseña correctos, cuando envía el formulario de inicio de sesión, entonces el sistema lo autentica y lo redirige al dashboard.

> **CA02.** Dado que un estudiante ingresa un correo o contraseña incorrectos, cuando intenta iniciar sesión, entonces el sistema rechaza el acceso y muestra un mensaje de error genérico, sin indicar cuál dato fue incorrecto.

> **CA03.** Dado que un estudiante ha iniciado sesión previamente, cuando vuelve a abrir la aplicación dentro del periodo de validez del token, entonces el sistema lo mantiene autenticado sin solicitar sus credenciales nuevamente.

---

# TRX-01 — Registro manual de transacción

| Campo | Descripción |
|:--|:--|
| **Identificador** | TRX-01 |
| **Épica** | Gestión de Transacciones |
| **Nombre** | Registro manual de transacción |
| **Prioridad** | Alta |
| **Estado** | Pendiente |

## Historia de Usuario
**Como** estudiante, **quiero** registrar manualmente un ingreso o egreso indicando monto, categoría y fecha, **para** llevar control de mis movimientos financieros.

## Descripción
Esta funcionalidad constituye el mecanismo base de captura de datos de la variable dependiente. Debe estar disponible en todo momento como respaldo, independientemente de si el estudiante utiliza o no las funcionalidades de automatización (OCR o importación bancaria).

## Detalles
- El campo fecha no admite valores posteriores a la fecha actual (no se registran transacciones futuras).
- El tipo de transacción (ingreso/egreso) es obligatorio y determina el signo del monto en los cálculos del dashboard.
- Los montos se almacenan con 2 decimales (soles y céntimos).

## Criterios de Aceptación

> **CA01.** Dado que un estudiante completa el formulario de nueva transacción con un monto mayor a 0, una categoría válida y una fecha, cuando confirma el registro, entonces el sistema almacena la transacción y la refleja de inmediato en el listado y en el dashboard.

> **CA02.** Dado que un estudiante ingresa un monto igual o menor a 0, cuando intenta guardar la transacción, entonces el sistema rechaza el registro y muestra un mensaje de validación.

> **CA03.** Dado que un estudiante no selecciona una categoría, cuando intenta guardar la transacción, entonces el sistema impide el guardado hasta que se seleccione una categoría válida.

---

# TRX-02 — Edición y eliminación de transacción

| Campo | Descripción |
|:--|:--|
| **Identificador** | TRX-02 |
| **Épica** | Gestión de Transacciones |
| **Nombre** | Edición y eliminación de transacción |
| **Prioridad** | Alta |
| **Estado** | Pendiente |

## Historia de Usuario
**Como** estudiante, **quiero** editar o eliminar una transacción previamente registrada, **para** corregir errores de digitación o registros duplicados.

## Descripción
El sistema debe permitir modificaciones sobre transacciones existentes sin afectar la integridad de las mediciones agregadas (dashboard, metas de ahorro), recalculando automáticamente los indicadores dependientes tras cada cambio.

## Detalles
- Solo el propietario de la transacción puede editarla o eliminarla.
- El sistema no conserva versiones anteriores del registro (la edición sobrescribe el dato).
- Eliminar una transacción vinculada a una meta de ahorro recalcula automáticamente el progreso de dicha meta.

## Criterios de Aceptación

> **CA01.** Dado que un estudiante selecciona una transacción existente, cuando modifica el monto, categoría o fecha y confirma, entonces el sistema actualiza el registro y recalcula el dashboard con los nuevos valores.

> **CA02.** Dado que un estudiante selecciona eliminar una transacción, cuando confirma la acción en el cuadro de diálogo de confirmación, entonces el sistema elimina el registro de forma permanente y actualiza el dashboard.

> **CA03.** Dado que un estudiante intenta eliminar una transacción, cuando cancela el cuadro de diálogo de confirmación, entonces el sistema no realiza ningún cambio sobre el registro.

---

# OCR-01 — Escaneo de boleta con reconocimiento óptico

| Campo | Descripción |
|:--|:--|
| **Identificador** | OCR-01 |
| **Épica** | Automatización del Registro (OCR) |
| **Nombre** | Escaneo de boleta con reconocimiento óptico |
| **Prioridad** | Media |
| **Estado** | Pendiente |

## Historia de Usuario
**Como** estudiante, **quiero** fotografiar una boleta o recibo y que la aplicación extraiga automáticamente el monto, **para** reducir el tiempo de registro manual.

## Descripción
La aplicación debe capturar una imagen mediante la cámara del dispositivo, enviarla al servicio de OCR (Google Cloud Vision) a través del backend, y presentar el monto detectado en un formulario editable antes de guardar la transacción, sin exponer nunca las credenciales del servicio en el cliente móvil.

## Detalles
- La imagen debe cumplir una resolución mínima para ser procesada correctamente.
- El procesamiento tiene un tiempo máximo de espera (timeout); superado ese límite, se considera fallido.
- La imagen original se almacena en Supabase Storage asociada a la transacción, para trazabilidad.

## Criterios de Aceptación

> **CA01.** Dado que un estudiante captura una imagen legible de una boleta, cuando el sistema procesa la imagen mediante el servicio de OCR, entonces se muestra el monto detectado en un campo editable dentro de un formulario de confirmación.

> **CA02.** Dado que la imagen capturada no permite detectar un monto válido, cuando el sistema procesa la imagen, entonces se informa al estudiante que el reconocimiento falló y se ofrece la opción de registrar la transacción manualmente (TRX-01).

> **CA03.** Dado que se muestra un monto detectado por OCR, cuando el estudiante lo modifica antes de guardar, entonces el sistema almacena el valor editado y no el valor originalmente detectado.

---

# CNF-01 — Confirmación de transacción detectada automáticamente

| Campo | Descripción |
|:--|:--|
| **Identificador** | CNF-01 |
| **Épica** | Validación de Registros Automáticos |
| **Nombre** | Confirmación de transacción detectada automáticamente |
| **Prioridad** | Media |
| **Estado** | Pendiente |

## Historia de Usuario
**Como** estudiante, **quiero** revisar y confirmar cualquier transacción detectada automáticamente por OCR o por correo bancario antes de que se guarde, **para** asegurarme de que el dato registrado es correcto.

## Descripción
Ninguna transacción originada por un mecanismo automático (OCR o integración con Gmail) debe almacenarse sin pasar por una pantalla de confirmación explícita del estudiante, dado que estos datos alimentan directamente los indicadores de la variable dependiente y su precisión es crítica para la validez de la medición.

## Detalles
- Cada sugerencia pendiente de confirmación expira a las 24 horas si el estudiante no responde, para evitar acumulación.
- Solo se presenta una sugerencia a la vez por notificación detectada.
- El origen de la sugerencia (OCR o correo bancario) se muestra siempre al estudiante, para transparencia del dato.

## Criterios de Aceptación

> **CA01.** Dado que el sistema detecta una posible transacción mediante OCR o mediante la integración con Gmail, cuando se genera la sugerencia, entonces el sistema la presenta en una pantalla de confirmación con las opciones "Guardar", "Editar" y "Descartar".

> **CA02.** Dado que un estudiante selecciona "Descartar" sobre una transacción sugerida, cuando confirma la acción, entonces el sistema elimina la sugerencia sin almacenar ningún registro.

> **CA03.** Dado que un estudiante selecciona "Editar" sobre una transacción sugerida, cuando modifica los campos y confirma, entonces el sistema almacena la transacción con los valores editados por el estudiante.

---

# GML-01 — Conexión de cuenta de Gmail

| Campo | Descripción |
|:--|:--|
| **Identificador** | GML-01 |
| **Épica** | Integración con Notificaciones Bancarias |
| **Nombre** | Conexión de cuenta de Gmail |
| **Prioridad** | Media |
| **Estado** | Pendiente |

## Historia de Usuario
**Como** estudiante, **quiero** autorizar a la aplicación a leer mis notificaciones bancarias mediante mi cuenta de Gmail, **para** que mis movimientos financieros se sugieran automáticamente sin digitarlos.

## Descripción
La conexión debe realizarse mediante el protocolo OAuth 2.0 oficial de Google, solicitando exclusivamente el permiso de lectura (scope `gmail.readonly`), e informando claramente al estudiante qué datos serán accedidos y con qué finalidad, en cumplimiento del consentimiento informado del estudio.

## Detalles
- El scope solicitado es únicamente de lectura; nunca se solicita permiso de envío o eliminación de correos.
- El estudiante debe figurar como usuario de prueba en la consola de Google Cloud (modo Testing) para poder autorizar el acceso.
- Los tokens de acceso se almacenan cifrados en el backend; nunca se guardan en el dispositivo móvil.

## Criterios de Aceptación

> **CA01.** Dado que un estudiante inicia el proceso de conexión de Gmail, cuando completa el flujo de autorización OAuth de Google, entonces el sistema almacena el token de acceso de forma segura y habilita la importación de notificaciones bancarias.

> **CA02.** Dado que un estudiante cancela el flujo de autorización de Google, cuando regresa a la aplicación, entonces el sistema no habilita la importación y la funcionalidad permanece desactivada.

> **CA03.** Dado que un estudiante tiene Gmail conectado, cuando revoca el acceso desde su perfil dentro de la aplicación, entonces el sistema elimina el token almacenado y detiene cualquier lectura futura de notificaciones.

---

# GML-02 — Importación de transacción desde correo bancario

| Campo | Descripción |
|:--|:--|
| **Identificador** | GML-02 |
| **Épica** | Integración con Notificaciones Bancarias |
| **Nombre** | Importación de transacción desde correo bancario |
| **Prioridad** | Media |
| **Estado** | Pendiente |

## Historia de Usuario
**Como** estudiante con Gmail conectado, **quiero** que la aplicación detecte las notificaciones de movimientos de mi banco y sugiera una transacción, **para** reducir el registro manual de mis operaciones bancarias.

## Descripción
El sistema debe identificar correos provenientes de remitentes bancarios conocidos (mínimo 2-3 bancos peruanos configurados), extraer el monto y tipo de movimiento mediante un parser específico por banco, y generar una sugerencia de transacción que debe pasar obligatoriamente por CNF-01 antes de almacenarse.

## Detalles
- Solo se procesan correos de remitentes explícitamente configurados en la lista de bancos soportados.
- La búsqueda de notificaciones se ejecuta cada 6 horas, no en tiempo real, para respetar los límites de uso de la API de Gmail.
- No se almacena el contenido completo del correo, únicamente los datos estructurados extraídos (monto, tipo, fecha).

## Criterios de Aceptación

> **CA01.** Dado que llega un nuevo correo de un remitente bancario configurado en el sistema, cuando el sistema ejecuta la búsqueda periódica de notificaciones, entonces se genera una sugerencia de transacción con el monto y tipo detectados.

> **CA02.** Dado que un correo bancario no corresponde a ninguno de los bancos configurados, cuando el sistema procesa la bandeja de entrada, entonces el correo se ignora y no se genera ninguna sugerencia.

> **CA03.** Dado que se genera una sugerencia de transacción desde un correo bancario, cuando el sistema la presenta al estudiante, entonces debe pasar por el flujo de confirmación definido en CNF-01 antes de almacenarse.

---

# AHO-01 — Creación de meta de ahorro

| Campo | Descripción |
|:--|:--|
| **Identificador** | AHO-01 |
| **Épica** | Gestión del Ahorro |
| **Nombre** | Creación de meta de ahorro |
| **Prioridad** | Alta |
| **Estado** | Pendiente |

## Historia de Usuario
**Como** estudiante, **quiero** definir una meta de ahorro con un monto objetivo y una fecha límite, **para** planificar mi ahorro de manera concreta.

## Descripción
Cada estudiante puede definir una o más metas de ahorro activas, cada una asociada a un monto objetivo positivo y una fecha límite futura, que servirán como referencia para calcular el porcentaje de cumplimiento del indicador correspondiente.

## Detalles
- Un estudiante puede tener varias metas de ahorro activas de forma simultánea.
- El nombre de la meta es obligatorio, para poder diferenciarla en el listado.
- Una meta no puede eliminarse si ya tiene transacciones de ahorro asociadas (se marca como inactiva en su lugar).

## Criterios de Aceptación

> **CA01.** Dado que un estudiante completa el formulario de nueva meta con un monto mayor a 0 y una fecha límite posterior a la fecha actual, cuando confirma la creación, entonces el sistema almacena la meta y la muestra en el dashboard.

> **CA02.** Dado que un estudiante ingresa un monto objetivo igual o menor a 0, cuando intenta guardar la meta, entonces el sistema rechaza el registro y muestra un mensaje de validación.

> **CA03.** Dado que un estudiante selecciona una fecha límite anterior o igual a la fecha actual, cuando intenta guardar la meta, entonces el sistema impide el registro y muestra un mensaje indicando que la fecha debe ser futura.

---

# AHO-02 — Seguimiento del progreso de ahorro

| Campo | Descripción |
|:--|:--|
| **Identificador** | AHO-02 |
| **Épica** | Gestión del Ahorro |
| **Nombre** | Seguimiento del progreso de ahorro |
| **Prioridad** | Alta |
| **Estado** | Pendiente |

## Historia de Usuario
**Como** estudiante, **quiero** visualizar cuánto llevo ahorrado en relación con mi meta, **para** saber si estoy cumpliendo mi objetivo de ahorro.

## Descripción
El sistema debe calcular automáticamente el porcentaje de cumplimiento de cada meta activa a partir de las transacciones registradas como ahorro, y representarlo visualmente mediante una barra o gráfico de progreso, actualizándose cada vez que se registra una nueva transacción vinculada a la meta.

## Detalles
- El cálculo de progreso solo considera transacciones marcadas explícitamente como "ahorro" y vinculadas a la meta correspondiente.
- Si el estudiante elimina una transacción vinculada a una meta, el progreso se recalcula de forma automática.
- El porcentaje de cumplimiento nunca se muestra por encima de 100%, aunque el monto ahorrado supere el objetivo.

## Criterios de Aceptación

> **CA01.** Dado que un estudiante tiene una meta de ahorro activa con transacciones asociadas, cuando accede a la pantalla de la meta, entonces el sistema muestra el monto ahorrado, el monto objetivo y el porcentaje de cumplimiento calculado.

> **CA02.** Dado que un estudiante registra una nueva transacción asociada a una meta de ahorro, cuando la transacción se guarda, entonces el sistema recalcula y actualiza el porcentaje de cumplimiento de dicha meta de forma inmediata.

> **CA03.** Dado que el monto ahorrado alcanza o supera el monto objetivo de la meta, cuando el estudiante consulta el progreso, entonces el sistema indica visualmente que la meta ha sido cumplida al 100%.

---

# CAT-01 — Categorización de gastos

| Campo | Descripción |
|:--|:--|
| **Identificador** | CAT-01 |
| **Épica** | Categorización y Análisis de Gastos |
| **Nombre** | Categorización de gastos |
| **Prioridad** | Alta |
| **Estado** | Pendiente |

## Historia de Usuario
**Como** estudiante, **quiero** asignar una categoría a cada gasto registrado, **para** entender en qué se concentra mi gasto mensual.

## Descripción
El sistema debe ofrecer un conjunto predefinido de categorías (comida, transporte, ocio, servicios, otros) que el estudiante asigna al registrar o editar una transacción de tipo egreso, permitiendo posteriormente consultar el total gastado por cada categoría.

## Detalles
- Las categorías predefinidas no pueden eliminarse desde la app del estudiante.
- Una transacción solo puede pertenecer a una categoría a la vez.
- Si un egreso no se categoriza explícitamente, se asigna a la categoría "Otros" por defecto.

## Criterios de Aceptación

> **CA01.** Dado que un estudiante registra un egreso, cuando selecciona una categoría de la lista predefinida, entonces el sistema asocia la transacción a dicha categoría de forma permanente.

> **CA02.** Dado que existen transacciones categorizadas en un periodo determinado, cuando el estudiante consulta el resumen por categoría, entonces el sistema muestra el monto total agrupado por cada categoría.

> **CA03.** Dado que un estudiante edita una transacción existente, cuando cambia su categoría, entonces el sistema actualiza el resumen por categoría reflejando el nuevo agrupamiento.

---

# CAT-02 — Identificación de gastos hormiga

| Campo | Descripción |
|:--|:--|
| **Identificador** | CAT-02 |
| **Épica** | Categorización y Análisis de Gastos |
| **Nombre** | Identificación de gastos hormiga |
| **Prioridad** | Alta |
| **Estado** | Pendiente |

## Historia de Usuario
**Como** estudiante, **quiero** que la aplicación identifique automáticamente mis gastos pequeños no planificados, **para** tomar conciencia de mis hábitos de consumo.

## Descripción
El sistema debe marcar automáticamente como "gasto hormiga" toda transacción de egreso cuyo monto sea menor o igual a un umbral configurable, y calcular el porcentaje que estos gastos representan sobre el total de egresos del periodo consultado.

## Detalles
- El umbral por defecto es S/ 15, pero es ajustable por el investigador para fines de calibración del instrumento durante el piloto.
- La regla aplica únicamente a transacciones de tipo egreso; nunca a ingresos.
- El marcado como "gasto hormiga" es automático; el estudiante no puede desmarcarlo manualmente (garantiza consistencia del indicador).

## Criterios de Aceptación

> **CA01.** Dado que un estudiante registra un egreso con un monto igual o menor al umbral configurado, cuando la transacción se guarda, entonces el sistema la marca automáticamente como "gasto hormiga".

> **CA02.** Dado que existen transacciones marcadas como "gasto hormiga" en un periodo determinado, cuando el estudiante consulta su resumen financiero, entonces el sistema muestra el porcentaje que estos gastos representan sobre el total de egresos del periodo.

> **CA03.** Dado que un estudiante registra un egreso con un monto mayor al umbral configurado, cuando la transacción se guarda, entonces el sistema no la marca como "gasto hormiga".

---

# DSH-01 — Visualización del dashboard financiero

| Campo | Descripción |
|:--|:--|
| **Identificador** | DSH-01 |
| **Épica** | Panel de Control |
| **Nombre** | Visualización del dashboard financiero |
| **Prioridad** | Alta |
| **Estado** | Pendiente |

## Historia de Usuario
**Como** estudiante, **quiero** ver un resumen visual de mis ingresos, egresos, ahorro y gastos, **para** tener una vista general de mi situación financiera en un solo lugar.

## Descripción
El dashboard constituye la pantalla principal de la aplicación y debe consolidar, mediante gráficos, la información proveniente de los módulos de transacciones, ahorro y categorización, permitiendo al estudiante filtrar la información por periodo (semana o mes).

## Detalles
- Los totales se calculan en tiempo real a partir de la base de datos; no se almacenan valores precalculados.
- El periodo por defecto al abrir la aplicación es "mes actual".
- El dashboard es de solo lectura; no permite editar transacciones directamente desde ahí.

## Criterios de Aceptación

> **CA01.** Dado que un estudiante tiene transacciones registradas, cuando accede al dashboard, entonces el sistema muestra los totales de ingresos, egresos y ahorro correspondientes al periodo seleccionado.

> **CA02.** Dado que un estudiante registra una nueva transacción, cuando regresa al dashboard, entonces los valores mostrados se actualizan reflejando el nuevo registro sin necesidad de recargar manualmente la aplicación.

> **CA03.** Dado que un estudiante cambia el filtro de periodo entre semana y mes, cuando aplica el cambio, entonces el sistema recalcula y muestra la información correspondiente al nuevo periodo seleccionado.

---

# USA-01 — Encuesta de usabilidad SUS

| Campo | Descripción |
|:--|:--|
| **Identificador** | USA-01 |
| **Épica** | Usabilidad y Evaluación |
| **Nombre** | Encuesta de usabilidad SUS |
| **Prioridad** | Alta |
| **Estado** | Pendiente |

## Historia de Usuario
**Como** estudiante participante del piloto, **quiero** responder un cuestionario de usabilidad dentro de la aplicación, **para** que el investigador pueda medir objetivamente el nivel de usabilidad del sistema.

## Descripción
El sistema debe presentar el cuestionario estándar System Usability Scale (10 ítems, escala Likert de 5 puntos) en un momento definido del flujo de uso, garantizando que cada estudiante lo complete una única vez, y almacenando el puntaje resultante para su posterior análisis estadístico.

## Detalles
- El cuestionario se habilita únicamente durante la ventana de tiempo definida para el postest.
- El puntaje se calcula con la fórmula estándar SUS (rango 0-100), no con el promedio simple de las respuestas.
- Las respuestas individuales del cuestionario no se muestran al estudiante después del envío, solo la confirmación de que fue registrado.

## Criterios de Aceptación

> **CA01.** Dado que un estudiante participante no ha respondido previamente la encuesta SUS, cuando el sistema se la presenta, entonces se muestran los 10 ítems estándar con escala de 1 a 5.

> **CA02.** Dado que un estudiante completa los 10 ítems de la encuesta, cuando confirma el envío, entonces el sistema calcula y almacena el puntaje SUS asociado a dicho estudiante.

> **CA03.** Dado que un estudiante ya respondió la encuesta SUS, cuando intenta acceder nuevamente al cuestionario, entonces el sistema le indica que ya fue completada y no permite un nuevo envío.

---

# CAL-01 — Registro de errores funcionales del sistema

| Campo | Descripción |
|:--|:--|
| **Identificador** | CAL-01 |
| **Épica** | Calidad y Soporte a la Investigación |
| **Nombre** | Registro de errores funcionales del sistema |
| **Prioridad** | Alta |
| **Estado** | Pendiente |

## Historia de Usuario
**Como** investigador, **quiero** que el sistema registre automáticamente los errores funcionales ocurridos durante el periodo de pruebas, **para** poder calcular el indicador de errores detectados establecido en la investigación.

## Descripción
Todo error no controlado (excepciones, fallos de conexión con servicios externos, fallos de validación no capturados) debe quedar registrado con fecha, módulo afectado y una breve descripción, en un registro accesible para el investigador, sin exponer información sensible del estudiante.

## Detalles
- Los registros de error se conservan durante todo el periodo de piloto, para el análisis final del indicador.
- El panel de errores es accesible únicamente para el rol investigador, no para los estudiantes.
- El registro nunca incluye datos financieros ni credenciales del usuario, solo el identificador técnico necesario para depurar.

## Criterios de Aceptación

> **CA01.** Dado que ocurre un error no controlado durante el uso de la aplicación, cuando el error es capturado por el sistema, entonces se almacena un registro con fecha, módulo afectado y descripción del error.

> **CA02.** Dado que existen registros de errores almacenados, cuando el investigador consulta el panel de errores, entonces el sistema muestra el conteo total de errores agrupados por módulo y por periodo.

> **CA03.** Dado que un error ocurre en un módulo determinado, cuando se registra, entonces el sistema no almacena información personal sensible del estudiante asociada al error, solo el identificador técnico necesario para la depuración.

---