# MiFi — Documentación de Diseño del Sistema

> **Qué es MiFi.** Aplicación móvil de gestión financiera personal para estudiantes, desarrollada como instrumento de una **investigación de tesis**. El software no es un fin en sí mismo: existe para producir los datos que miden los indicadores de la matriz de operacionalización en **pretest (O₁)** y **postest (O₂)**. Cada decisión de diseño se valida contra esa meta.

Este documento es el **punto de entrada** a toda la documentación de diseño. Resume el sistema, indexa el resto de documentos y consolida las **decisiones de arquitectura y seguridad**. Está redactado para dos audiencias: el equipo/jurado de tesis y los **agentes de IA** que asisten el desarrollo (ver [§10](#10-instrucciones-para-agentes-de-ia)).

---

## 1. Cómo usar este documento

- **Si eres humano (autor o jurado):** empieza aquí, salta al documento que te interese vía el [índice (§4)](#4-índice-de-documentos), y revisa las [decisiones clave (§6)](#6-registro-de-decisiones-de-diseño-y-seguridad-adr) para entender los "por qué".
- **Si eres un agente de IA:** carga este archivo como **contexto fijo** antes de generar código. Respeta la arquitectura en capas, los contratos (interfaces) y las decisiones de §6. No inventes entidades, endpoints ni reglas que no estén aquí; si algo falta, pídelo o márcalo como pendiente.

---

## 2. Stack tecnológico

| Capa | Tecnología |
|:--|:--|
| App móvil | React Native (JS), estado con Zustand, cliente HTTP con Axios / React Query |
| Backend | Node.js + Express, arquitectura en capas |
| ORM | Prisma |
| Base de datos | PostgreSQL (gestionado por Supabase) |
| Almacenamiento de archivos | Supabase Storage (imágenes de boletas) |
| OCR | Google Cloud Vision API |
| Correo bancario | Gmail API (OAuth 2.0, `gmail.readonly`) |
| Autenticación | **Propia del backend** (bcrypt + JWT), no Supabase Auth — ver [D-01](#6-registro-de-decisiones-de-diseño-y-seguridad-adr) |
| Despliegue | Backend en Render · App como APK Android |

**Estándares de referencia:** ISO/IEC 12207 (ciclo de vida), ISO/IEC 25010 (calidad), SOLID, 3FN, Ley N.º 29733 (protección de datos personales, Perú).

---

## 3. Arquitectura en una vista

Backend en **4 capas** con dependencias apuntando siempre hacia el dominio (Dependency Inversion):

```
Controllers (Presentación)
   └─ Middleware Auth + Autorización   ← valida JWT/sesión (RF-51) y propiedad del recurso (RF-50)
        └─ Casos de Uso (Aplicación)
             └─ Entidades + Interfaces de Repositorio (Dominio)   ← reglas puras, sin dependencias externas
                  └─ Infraestructura   ← Repositorios (Prisma), AuthService, CryptoService,
                                          GoogleVisionOcrService, GmailApiAdapter, Bank Parsers (Strategy)
```

**SOLID aplicado con casos reales:**
- **Open/Closed + Dependency Inversion:** `IBankEmailParser` (BCP / Interbank / BBVA) e `IReceiptOcrService` → agregar un banco o cambiar de proveedor de OCR es crear una clase nueva, sin tocar las existentes.
- **Single Responsibility:** `SugerenciaTransaccion` solo sabe confirmarse/descartarse/expirar; `MetaAhorro` calcula su propio progreso.

---

## 4. Índice de documentos

| # | Documento | Contenido | Cuándo consultarlo |
|:--|:--|:--|:--|
| — | **README.md** (este archivo) | Resumen, índice y decisiones consolidadas | Siempre, primero |
| 1 | [HistoriasUsuario.md](HistoriasUsuario.md) | Backlog de HU con criterios de aceptación (Gherkin) | Para entender el "qué" desde el usuario |
| 2 | [RequerimientosFuncionales.md](RequerimientosFuncionales.md) | RF-01…RF-52 trazados a su HU de origen | Para implementar una funcionalidad concreta |
| 3 | [DiagramaCasosUso.md](DiagramaCasosUso.md) | Actores, casos de uso y relaciones «include»/precedencia | Para ver el alcance global del sistema |
| 4 | [DiagramaClases.md](DiagramaClases.md) | Modelo de dominio (entidades, interfaces, SOLID) | Para diseñar/generar clases de dominio |
| 5 | [DiagramaEntidadRelacion.md](DiagramaEntidadRelacion.md) | Esquema de BD en 3FN, diccionario de datos, índices | Para el esquema Prisma y las migraciones |
| 6 | [DiagramaComponentes.md](DiagramaComponentes.md) | Arquitectura técnica y decisiones de despliegue | Para entender cómo se conectan los componentes |
| 7 | [DiagramaSecuencias.md](DiagramaSecuencias.md) | Flujos críticos: OCR, confirmación, Gmail, ahorro, login | Para implementar la orquestación de un caso de uso |
| 8 | [EspecificacionesCasosUsoCriticos.md](EspecificacionesCasosUsoCriticos.md) | Flujos básico/alterno/excepción de los UC críticos | Para el detalle fino de un caso de uso |
| — | [../PlanTrabajo.md](../PlanTrabajo.md) | Plan de trabajo secuencial por fases (ISO 12207) | Para ubicar en qué fase estamos |

---

## 5. Módulos funcionales (mapa rápido)

| Épica | HU | Criticidad |
|:--|:--|:--|
| Autenticación y gestión de usuario | AUT-01, AUT-02, **CON-01** | Crítica |
| Gestión de transacciones | TRX-01, TRX-02 | Crítica |
| Gestión del ahorro | AHO-01, AHO-02 | Crítica |
| Categorización y análisis de gastos | CAT-01, CAT-02 | Crítica |
| Panel de control (dashboard) | DSH-01 | Crítica |
| Usabilidad y evaluación (SUS) | USA-01 | Crítica |
| Calidad y soporte a la investigación | CAL-01 | Crítica |
| Automatización del registro (OCR) | OCR-01, CNF-01 | Acelerador (recortable) |
| Integración con notificaciones bancarias | GML-01, GML-02, CNF-01 | Acelerador (recortable) |

> **Regla de seguridad de la tesis:** las funcionalidades **críticas** bastan para medir todos los indicadores. Los **aceleradores** (OCR, Gmail) añaden valor pero se recortan primero si el cronograma se aprieta.

---

## 6. Registro de decisiones de diseño y seguridad (ADR)

Decisiones tomadas y por qué. Son la referencia autoritativa cuando el código deba resolver una ambigüedad.

| ID | Decisión | Justificación | Afecta |
|:--|:--|:--|:--|
| **D-01** | **Autenticación propia** en el backend (bcrypt + JWT), no Supabase Auth. Supabase se usa solo como Postgres + Storage. | RF-06/07/08 exigen comportamiento (token de 7 días, bloqueo por intentos, logout que invalida) que Supabase Auth no da nativo; centralizar la lógica la hace auditable. | Componentes, ERD, Clases, RF-04/06/07/08 |
| **D-02** | Contraseñas con **bcrypt (factor de costo 12)**. | Estándar probado, salt incorporado, resistente a fuerza bruta. | RF-04, ERD (`usuarios.password_hash`) |
| **D-03** | JWT con `jti` + tabla **`sesiones`** para revocación. | Permite **logout real** (RF-08) y rechazo de tokens revocados (RF-51) sin renunciar a JWT. | ERD (`sesiones`), Clases (`Sesion`), Secuencia UC-AUT-02 |
| **D-04** | Bloqueo tras 5 intentos con contador persistido (`intentos_fallidos`, `bloqueado_hasta`). | RF-07; evita fuerza bruta contra cuentas reales. | ERD (`usuarios`) |
| **D-05** | **Control de acceso a nivel de objeto (anti-IDOR).** Todo caso de uso verifica que el recurso pertenezca al usuario del token; si no, responde **404** (no 403). | Datos financieros sensibles: un estudiante nunca debe leer/editar recursos de otro; el 404 no revela existencia. | RF-50, Secuencias (CNF-01, AHO-02), Especificaciones |
| **D-06** | Tokens de Gmail cifrados con **AES-256-GCM**; clave en variable de entorno, nunca en el repo ni en el cliente. | RF-24; los tokens dan acceso al correo del estudiante — máxima protección. | ERD (`conexiones_gmail`), Componentes (`CryptoService`) |
| **D-07** | **Consentimiento informado** modelado en el sistema (HU CON-01): se registra aceptación, fecha y versión del texto. | Evidencia auditable para el comité de ética; cumplimiento de la Ley N.º 29733 (consentimiento, finalidad). | HU CON-01, RF-47/48/49, ERD (`usuarios`), Casos de Uso |
| **D-08** | **Umbral de gasto hormiga congelado** durante la medición + snapshot `umbral_hormiga_aplicado` por transacción. | Cambiar el umbral a mitad de estudio rompería la comparabilidad O₁ vs O₂ (validez interna); el snapshot hace la marca reproducible. | RF-38, ERD (`transacciones`), HU CAT-02 |
| **D-09** | Toda comunicación sobre **HTTPS/TLS**; credenciales de servicios externos nunca en el cliente móvil. | RF-52; protege datos en tránsito. | RF-52, Componentes |
| **D-10** | `registros_error` **sin FK a usuarios**. | Regla de privacidad de CAL-01: un error nunca debe rastrearse hasta un estudiante concreto. | ERD (`registros_error`) |
| **D-11** *(temporal)* | **Gmail API en modo Testing** durante la construcción. | El refresh token expira cada 7 días. Aceptado en construcción; el flujo FE1 de UC-GML-02 maneja la reconexión. **Plan:** verificar/adquirir el servicio antes del pretest/postest. | Componentes (§ decisiones temporales) |
| **D-12** *(temporal)* | **Cron in-process (`node-cron`)** en Render para la búsqueda cada 6 h. | Simplicidad en construcción. Limitación: puede no dispararse si el servicio se suspende. **Plan:** migrar a disparador externo robusto (Render Cron Job / GitHub Actions / `pg_cron`) en la operación real. | Componentes (§ decisiones temporales) |

---

## 7. Modelo de datos (resumen)

Entidades persistidas (PostgreSQL, 3FN). Detalle completo en [DiagramaEntidadRelacion.md](DiagramaEntidadRelacion.md).

- **usuarios** — cuenta, rol, estado de bloqueo, aceptación de consentimiento.
- **sesiones** — sesiones JWT activas (`jti`, expiración, revocada).
- **transacciones** — ingresos/egresos; `origen` (manual/ocr/gmail), `es_gasto_hormiga`, `umbral_hormiga_aplicado`, `imagen_url`.
- **categorias** — clasificación predefinida de gastos.
- **metas_ahorro** — objetivo, fecha límite, estado; progreso calculado en tiempo real (nunca precalculado).
- **sugerencias_transaccion** — transacciones automáticas pendientes de confirmación (OCR/Gmail); expiran a las 24 h.
- **conexiones_gmail** — vínculo OAuth (tokens cifrados AES-256-GCM), 1 por usuario.
- **encuestas_sus** — respuestas y puntaje SUS, 1 por usuario.
- **registros_error** — bitácora de errores, sin FK a usuario (privacidad).
- **presupuestos_categoria** — *reservada para sprint futuro.*

---

## 8. Indicadores de tesis que alimenta el software

El software produce los datos; la matriz de operacionalización completa vive en el documento de tesis. Estos son los indicadores que el sistema alimenta directamente:

| Indicador | Fuente de dato en el sistema | HU/UC |
|:--|:--|:--|
| N.º de registros por semana | `transacciones(usuario_id, fecha)` | TRX-01, DSH-01 |
| Monto ahorrado y % de cumplimiento | `SUM(monto)` por meta vs. objetivo | AHO-01, AHO-02 |
| N.º de gastos categorizados | `transacciones` con `categoria_id` | CAT-01 |
| % de gastos hormiga sobre egresos | `es_gasto_hormiga` sobre total de egresos | CAT-02 |
| Puntaje de usabilidad (SUS) | `encuestas_sus.puntaje` | USA-01 |
| N.º de errores funcionales | `registros_error` agrupados por módulo/periodo | CAL-01 |
| N.º de funcionalidades implementadas/planificadas | Plan de pruebas vs. F1–F12 | Fase 4 (QA) |

---

## 9. Estado del proyecto y pendientes

- **Fase actual:** Fase 1 — Diseño (ISO/IEC 12207). El paquete de diseño está casi completo.
- **Pendientes de la Fase 1 para poder cerrarla** (definidos en [PlanTrabajo.md](../PlanTrabajo.md), aún no generados):
  1. **Catálogo de Requisitos No Funcionales (RNF)** — rendimiento, seguridad, usabilidad, con métricas medibles.
  2. **Contrato OpenAPI/Swagger** de todos los endpoints.
  3. **Wireframes** de las 6–8 pantallas principales (base del SUS).

---

## 10. Instrucciones para agentes de IA

Al generar código o artefactos para este proyecto:

1. **Respeta la arquitectura en capas** (§3). La lógica de negocio vive en Casos de Uso; el dominio no depende de infraestructura; el acceso a datos/servicios externos siempre pasa por una **interfaz**.
2. **Autenticación = propia** (D-01). No introduzcas Supabase Auth. Usa bcrypt (D-02), JWT con `jti` + `sesiones` (D-03).
3. **Seguridad por defecto:** aplica el control de acceso anti-IDOR (D-05) en todo endpoint que opere sobre un recurso de usuario; nunca confíes en un `usuario_id` que venga del cliente, usa el del token. Cifra tokens de Gmail (D-06). Todo por HTTPS (D-09).
4. **No inventes** entidades, columnas, endpoints ni reglas de negocio que no estén en esta documentación. Si falta algo, decláralo como pendiente en vez de improvisarlo.
5. **Trazabilidad:** cuando implementes algo, referencia el RF/HU/UC que lo origina (p. ej. `// RF-38 gasto hormiga`).
6. **Consistencia de idioma:** nombres de dominio y comentarios en español (coherente con la documentación); convenciones de código según el stack (JS/Node).
7. **Decisiones temporales (D-11, D-12):** son deliberadas; no las "corrijas" sin instrucción explícita. Están planificadas para migrar en la fase de ejecución.

---

*Última actualización: refleja la resolución de los hallazgos de auditoría de diseño (auth propia, control de acceso anti-IDOR, criptografía explícita, consentimiento informado, congelamiento del umbral de gasto hormiga y limpieza del modelo de dominio).*
