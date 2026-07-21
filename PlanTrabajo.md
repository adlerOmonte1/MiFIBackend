# PLAN DE TRABAJO SECUENCIAL — DESARROLLO DE LA APP MÓVIL
**Desde la fase de diseño · Alineado a estándares de software (ISO/IEC 12207 e ISO/IEC 25010)**

> **Principio rector:** el software existe para producir los datos que miden los 10 indicadores de tu matriz de operacionalización, en pretest (O₁) y postest (O₂). Cada fase de este plan se valida contra esa meta, no contra "cuántas funciones tiene la app".

---

## VIABILIDAD Y COMPATIBILIDAD CON EL PROPÓSITO

**Veredicto: viable.** El stack es maduro y documentado, la escala es pequeña (40 usuarios de prueba) y ningún componente depende de tecnología experimental.

**Clasificación de funcionalidades por criticidad para la tesis:**

| Nivel | Funcionalidades | Consecuencia si no se completan |
|---|---|---|
| **Críticas (núcleo de medición)** | F1 Auth · F2 Registro manual · F6–F7 Ahorro · F8 Categorización · F9 Gastos hormiga · F10 Dashboard · F11 SUS · F12 Logging | La tesis NO puede medirse. Son obligatorias. |
| **Aceleradores (valor añadido)** | F3 OCR · F4 Gmail API · F5 Confirmación | La tesis sigue siendo válida sin ellas; se recortan primero si falta tiempo. |

Esta separación es tu **red de seguridad**: te garantiza que el proyecto de tesis se completa aunque el desarrollo tenga imprevistos.

---

## FASES ISO/IEC 12207 APLICADAS A TU PROYECTO

El desarrollo sigue las fases del ciclo de vida del software. Cada fase tiene entrada, actividades y un entregable verificable (el "hecho/no hecho" que necesitas para tu informe).

---

### FASE 1 — DISEÑO (Análisis y especificación)
*Antes de escribir una sola línea de código.*

| # | Actividad | Entregable | Estándar / Criterio |
|---|---|---|---|
| 1.1 | Especificación de requisitos (SRS) | Documento con requisitos funcionales (F1–F12) y no funcionales (rendimiento, seguridad, usabilidad) | ISO/IEC 25010 — define qué atributos de calidad medirás |
| 1.2 | Modelo de datos | Diagrama Entidad-Relación (Usuario, Transacción, Categoría, MetaAhorro, ImportacionCorreo) | Normalización 3FN |
| 1.3 | Diseño de arquitectura | Diagrama de capas (Controller→UseCase→Repositorio→Dominio) + diagrama de componentes | SOLID documentado |
| 1.4 | Diseño de interfaz | Wireframes de las 6–8 pantallas principales | Usabilidad (base para el SUS) |
| 1.5 | Contrato de API | Especificación OpenAPI/Swagger de todos los endpoints | Interoperabilidad |
| 1.6 | Plan de pruebas | Matriz caso de prueba ↔ requisito ↔ indicador de tesis | Trazabilidad |

**Salida de la fase:** paquete de diseño completo. Este paquete es también material directo para el capítulo de "Diseño del software" de tu informe final de tesis.

---

### FASE 2 — CONFIGURACIÓN DEL ENTORNO (Sprint 0)

| # | Actividad | Entregable |
|---|---|---|
| 2.1 | Crear repositorios (móvil + backend) con control de versiones Git | Repos con estructura de carpetas del plan |
| 2.2 | Configurar Supabase (Postgres + Auth + Storage) | Base de datos con esquema aplicado vía Prisma |
| 2.3 | Configurar proyecto en Google Cloud (Vision API + Gmail API en modo Testing) | Credenciales OAuth listas |
| 2.4 | Configurar linting, formateo y estructura de pruebas (ESLint, Prettier, Jest) | Pipeline de calidad de código |
| 2.5 | Definir convención de commits y ramas (Git Flow simplificado) | Guía de contribución |

**Salida:** entorno reproducible y listo para desarrollar.

---

### FASE 3 — DESARROLLO INCREMENTAL (Sprints 1–6)

Orden estricto: **primero todo lo crítico, después los aceleradores.** Cada sprint entrega funcionalidad probada, no a medias.

| Sprint | Módulo | Funcionalidades | Regla de "terminado" (DoD) |
|---|---|---|---|
| **S1** | Autenticación | F1 | Login/registro funcional + prueba unitaria del AuthService |
| **S2** | Transacciones (núcleo) | F2, F10 | CRUD ingresos/egresos + dashboard + pruebas + validación de que produce el dato "N.º de registros/semana" |
| **S3** | Ahorro | F6, F7 | Crear meta, ver progreso + pruebas + produce "monto ahorrado" y "% cumplimiento" |
| **S4** | Categorización | F8, F9 | Categorías + detección de gastos hormiga + pruebas + produce "N.º gastos categorizados" y "% gastos hormiga" |
| **S5** | OCR (acelerador) | F3, F5 | Foto→Vision→autocompletar→confirmar + pruebas del OcrService |
| **S6** | Gmail (acelerador) | F4, F5 | OAuth + parsers de 2–3 bancos (patrón Strategy) + pruebas de cada parser |

**Checkpoint tras S4:** en este punto ya tienes TODO lo crítico funcionando. Si el cronograma se aprieta, aquí puedes decidir congelar S5/S6 y pasar directo a pruebas — la tesis ya es viable.

---

### FASE 4 — PRUEBAS Y ASEGURAMIENTO DE CALIDAD (Sprint 7)

Se evalúan las características de calidad ISO/IEC 25010 que importan para tu tesis:

| Característica ISO 25010 | Cómo la verificas | Alimenta indicador |
|---|---|---|
| Funcionalidad (completitud) | Pruebas funcionales de F1–F12 vs. plan de pruebas | N.º funcionalidades implementadas/planificadas |
| Fiabilidad (madurez) | Registro de errores/crashes durante pruebas | N.º de errores funcionales detectados |
| Usabilidad | Cuestionario SUS con usuarios piloto | Puntaje SUS |
| Rendimiento | Tiempo de respuesta de operaciones clave | Requisito no funcional |
| Seguridad | Verificar que credenciales no se exponen, OAuth correcto | Requisito no funcional |

**Entregables:** informe de pruebas, puntaje SUS piloto, lista de errores corregidos, evidencia de la funcionalidad completada (tu numerador y denominador reales).

---

### FASE 5 — DESPLIEGUE Y PILOTO (Sprint 8)

| # | Actividad | Entregable |
|---|---|---|
| 5.1 | Desplegar backend (Render) y build de la app (APK Android) | App instalable |
| 5.2 | Onboarding de la muestra: 40 estudiantes + consentimiento informado | Muestra activa |
| 5.3 | Capacitación breve de uso de la app | Usuarios operativos |
| 5.4 | Aplicar medición PRETEST (O₁) | Datos O₁ recolectados |

**Salida:** app en producción con la muestra usando el sistema.

---

### FASE 6 — OPERACIÓN Y MEDICIÓN (según cronograma de tesis)

| # | Actividad | Entregable |
|---|---|---|
| 6.1 | Periodo de uso continuo de la app (la intervención X) | Datos de uso acumulados |
| 6.2 | Soporte y corrección de incidencias durante el periodo | App estable |
| 6.3 | Aplicar medición POSTEST (O₂) | Datos O₂ recolectados |
| 6.4 | Exportar datos para análisis estadístico (Shapiro-Wilk → t Student/Wilcoxon) | Dataset final para tu tesis |

**Salida:** los datos O₁ y O₂ que responden tu hipótesis. Aquí termina el rol del software y empieza tu análisis de resultados.

---

## SECUENCIA RESUMIDA (vista de una línea)

```
DISEÑO → SETUP → [Auth → Transacciones → Ahorro → Categorización]  ← núcleo crítico
                          ↓ (checkpoint: tesis ya viable)
              → [OCR → Gmail]  ← aceleradores (recortables)
                          ↓
              → PRUEBAS/QA (ISO 25010) → DESPLIEGUE → PILOTO (O₁)
                          ↓
              → USO CONTINUO (X) → POSTEST (O₂) → DATOS PARA LA TESIS
```

---

## ESTÁNDARES QUE CUMPLE ESTE PLAN

- **ISO/IEC 12207** — Ciclo de vida del software: el plan sigue sus fases (diseño → construcción → pruebas → despliegue → operación).
- **ISO/IEC 25010** — Modelo de calidad: mides funcionalidad, fiabilidad, usabilidad, rendimiento y seguridad (varias de estas SON indicadores de tu tesis).
- **SOLID** — Principios de diseño orientado a objetos aplicados en la arquitectura del backend.
- **Control de versiones (Git)** — trazabilidad de cambios, exigible en cualquier proyecto de software serio.
- **Trazabilidad requisito ↔ prueba ↔ indicador** — cada línea de código sirve a un dato de tu tesis.

---

## RECOMENDACIÓN FINAL

Empieza por la **Fase 1 completa** antes de programar. Es tentador saltar directo al código, pero el paquete de diseño (SRS, ERD, arquitectura, wireframes, contrato API, plan de pruebas) es lo que:
1. Te da el capítulo de diseño de software casi listo para el informe final.
2. Evita que reescribas código por decisiones mal tomadas.
3. Te permite trabajar con agentes de IA de forma consistente (les das el diseño como contexto fijo y generan módulos coherentes).

**Siguiente paso concreto:** empezar la Fase 1.2 con el diagrama Entidad-Relación, que es la base de todo lo demás.