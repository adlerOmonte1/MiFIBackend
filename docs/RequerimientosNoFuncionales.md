# CATÁLOGO DE REQUISITOS NO FUNCIONALES (RNF)

> Basado en el modelo de calidad **ISO/IEC 25010**. Cada RNF tiene una métrica medible porque varios de estos requisitos **son directamente indicadores de la tesis** (ver [README §8](README.md#8-indicadores-de-tesis-que-alimenta-el-software)) o condicionan su validez. Los RNF no se implementan con código nuevo por sí mismos: **restringen las decisiones arquitectónicas** que ya se tomaron en el registro de decisiones ([README §6](README.md#6-registro-de-decisiones-de-diseño-y-seguridad-adr)) y que se aplican con los principios SOLID de la arquitectura en capas.

**Nota para agentes de IA:** los valores marcados como *(sugerido)* son propuestas razonables no confirmadas en ninguna HU/RF existente — un valor de referencia, no una regla de negocio ya decidida. No los trates como definitivos sin que el usuario los confirme; si generas código que dependa de ellos, hazlo configurable (variable de entorno o constante aislada), nunca hardcodeado en la lógica de dominio.

---

## 1. Eficiencia de desempeño (rendimiento)

| RNF | Descripción | Métrica | Verificación | Relacionado |
|---|---|---|---|---|
| RNF-01 | Los endpoints CRUD de transacciones y metas de ahorro deben responder dentro de un tiempo aceptable bajo la carga esperada del piloto. | ≤ 2 s (percentil 95) con 40 usuarios concurrentes. | Prueba de carga antes del despliegue (Fase 4). | RF-09, RF-13, RF-30 |
| RNF-02 | El procesamiento de una imagen por OCR no debe exceder el tiempo máximo de espera del cliente móvil. | ≤ 10 s por imagen (ya definido en la especificación de UC-OCR-01). | Prueba de integración contra Google Vision API con imágenes reales de boletas. | RF-17, UC-OCR-01 |
| RNF-03 | El dashboard debe calcular sus totales en tiempo real sin degradar la experiencia, incluso acumulando datos durante todo el periodo de piloto. | ≤ 3 s con hasta 1000 transacciones por usuario *(sugerido: volumen razonable para 40 usuarios en el periodo de medición)*. | Prueba de rendimiento con dataset sintético de ese volumen. | RF-40, RF-41, D. de que ningún cálculo se precalcula (AHO-02, DSH-01) |
| RNF-04 | La búsqueda periódica de correos bancarios (cron cada 6 h) no debe solaparse con la ejecución siguiente ni duplicar sugerencias para el mismo correo. | 0 sugerencias duplicadas por correo procesado, medido en pruebas del `ImportBankEmailUseCase`. | Prueba unitaria/integración del caso de uso + revisión de logs del cron. | RF-28, D-12 |

---

## 2. Fiabilidad

| RNF | Descripción | Métrica | Verificación | Relacionado |
|---|---|---|---|---|
| RNF-05 | El backend debe estar disponible durante la ventana activa del piloto (pretest, uso continuo, postest). | ≥ 99% de disponibilidad, excluyendo mantenimiento programado. | Monitoreo del servicio en Render durante la Fase 6. | Fase 5–6 del plan de trabajo |
| RNF-06 | Todo error no controlado debe capturarse y registrarse sin interrumpir la sesión activa del estudiante. | 0 excepciones no registradas en `registros_error` detectadas en pruebas de Fase 4. | Middleware global de manejo de errores + revisión de `registros_error` tras pruebas funcionales. | RF-45, CAL-01 |
| RNF-07 | Una sugerencia de transacción (OCR/Gmail) no debe perderse por una falla de conexión al confirmarla o descartarla. | El endpoint de confirmación/descarte es reintentable sin efecto duplicado (idempotente) ante el mismo `id` de sugerencia. | Prueba de integración simulando desconexión a mitad del flujo (FE2 de UC-CNF-01). | RF-21, UC-CNF-01 |

---

## 3. Seguridad

| RNF | Descripción | Métrica | Verificación | Relacionado |
|---|---|---|---|---|
| RNF-08 | Las contraseñas se almacenan únicamente como hash bcrypt con el factor de costo definido. | Factor de costo = 12 en el 100% de los hashes generados. | Prueba unitaria de `AuthService.hashPassword`. | RF-04, D-02 |
| RNF-09 | Un JWT deja de ser válido inmediatamente tras el logout, aunque no haya expirado. | 0% de solicitudes aceptadas con un `jti` marcado como revocado. | Prueba de integración: logout → reintento de endpoint protegido con el mismo token → 401. | RF-08, D-03 |
| RNF-10 | Ningún endpoint que opere sobre un recurso de usuario debe confirmar la existencia de un recurso ajeno. | 0% de respuestas 403/200 ante un recurso que no pertenece al usuario del token; siempre 404. | Suite de pruebas de autorización cruzada (usuario A contra recursos de usuario B) en cada endpoint de transacciones, metas, sugerencias, Gmail y categorías propias (RF-53/54, D-13). | RF-50, D-05 |
| RNF-11 | Los tokens de Gmail se almacenan cifrados y la clave de cifrado nunca reside en el repositorio ni en el cliente. | 100% de los tokens en `conexiones_gmail` cifrados con AES-256-GCM; 0 coincidencias en escaneo de secretos del repositorio. | Prueba unitaria de `CryptoService` + escaneo de secretos (ej. gitleaks) en CI. | RF-24, D-06 |
| RNF-12 | Toda comunicación cliente↔backend y backend↔servicios externos viaja cifrada. | 100% de los endpoints solo aceptan HTTPS/TLS 1.2+; HTTP simple rechazado o redirigido. | Revisión de configuración de despliegue (Render fuerza HTTPS) + prueba manual. | RF-52, D-09 |
| RNF-13 | Tras 5 intentos fallidos de login consecutivos, la cuenta queda bloqueada temporalmente. | Duración de bloqueo = 15 minutos *(sugerido — RF-07 no fija el valor; debe confirmarse antes de implementar)*, configurable por variable de entorno, no hardcodeada. | Prueba de integración: 5 intentos fallidos → 6.º intento devuelve 423 aunque la contraseña sea correcta. | RF-07, D-04 |

---

## 4. Usabilidad

| RNF | Descripción | Métrica | Verificación | Relacionado |
|---|---|---|---|---|
| RNF-14 | La aplicación debe alcanzar un nivel de usabilidad aceptable según el estándar de la industria para el cuestionario SUS. | Puntaje SUS promedio ≥ 68 *(umbral estándar de aceptabilidad SUS, no un valor inventado para este proyecto — es meta de referencia, no bloqueante para el piloto)*. | Cálculo del puntaje SUS en la Fase 4/postest. | USA-01, RF-43 |
| RNF-15 | Los formularios críticos (transacción manual, meta de ahorro) deben minimizar la carga cognitiva del estudiante. | ≤ 5 campos visibles simultáneamente por formulario. | Revisión de wireframes (pendiente, ver README §9) contra este criterio. | TRX-01, AHO-01 |
| RNF-16 | Los mensajes de validación deben ser específicos y ubicarse junto al campo correspondiente, salvo el caso explícito de seguridad del login. | 100% de los errores de validación de formularios muestran el campo afectado, excepto AUT-02/CA02 (mensaje genérico intencional). | Revisión manual durante pruebas de usabilidad. | RF-03, RF-10, RF-31; excepción: RF-05/AUT-02 CA02 |

---

## 5. Mantenibilidad

| RNF | Descripción | Métrica | Verificación | Relacionado |
|---|---|---|---|---|
| RNF-17 | El dominio de negocio no debe depender de detalles de infraestructura (Prisma, Google Vision, Gmail). | 0 imports de infraestructura dentro de `src/dominio` (o equivalente), verificable por convención de carpetas. | Revisión de imports / regla de lint de arquitectura. | Arquitectura en capas (README §3), Dependency Inversion |
| RNF-18 | La lógica que produce los datos de los indicadores de tesis (cálculo de ahorro, umbral de gasto hormiga, autenticación) debe estar cubierta por pruebas automatizadas. | Cobertura ≥ 70% en Casos de Uso y Servicios de dominio relacionados a F1, F6–F9. | Reporte de cobertura de Jest en CI. | Plan de trabajo — DoD de cada sprint (S1–S4) |
| RNF-19 | Agregar un banco nuevo al parser de correos o cambiar el proveedor de OCR no debe requerir modificar código existente, solo agregar una clase nueva. | 0 cambios en clases existentes al agregar un `IBankEmailParser` o `IReceiptOcrService` adicional. | Revisión de diseño (Open/Closed ya documentado en Diagrama de Clases). | Diagrama de Clases, Open/Closed |

---

## 6. Portabilidad / Compatibilidad

| RNF | Descripción | Métrica | Verificación | Relacionado |
|---|---|---|---|---|
| RNF-20 | El backend debe ejecutarse sin cambios de código entre el entorno local y Render. | Toda configuración sensible al entorno (URLs, credenciales, claves) sale por variables de entorno, ninguna hardcodeada. | Revisión de `prisma.config.ts` / `.env` vs. código fuente. | Fase 2.2–2.3 del plan de trabajo |
| RNF-21 | La app móvil debe funcionar en los dispositivos reales de la muestra de estudio. | Compatible con Android 8.0 (API 26) en adelante *(sugerido — perfil típico de dispositivos de estudiantes; confirmar con la muestra real antes del piloto)*. | Prueba manual en al menos un dispositivo de gama baja/media antes de la Fase 5. | Fase 5.1 del plan de trabajo |

---

## Trazabilidad RNF ↔ indicador de tesis

| Indicador de tesis | RNF que lo protege o lo mide directamente |
|:--|:--|
| N.º de errores funcionales | RNF-06 (todo error se captura, ninguno se pierde) |
| Puntaje de usabilidad (SUS) | RNF-14, RNF-15, RNF-16 |
| N.º de funcionalidades implementadas/planificadas | RNF-17, RNF-18 (arquitectura que permite entregar cada sprint completo, no a medias) |
| Validez de la comparación O₁ vs. O₂ | RNF-05 (disponibilidad durante toda la ventana de medición), RNF-13 (parámetros de seguridad estables, no cambian a mitad de estudio, igual que D-08 con el umbral de gasto hormiga) |

---

## Pendiente de confirmación antes de implementar

Los siguientes valores están marcados *(sugerido)* arriba y requieren decisión explícita del investigador/autor de la tesis, no del agente de IA que programa:

1. Duración exacta del bloqueo de cuenta tras 5 intentos fallidos (RNF-13).
2. Volumen de datos de referencia para la prueba de rendimiento del dashboard (RNF-03).
3. Versión mínima de Android soportada, en función de los dispositivos reales de la muestra (RNF-21).

---
