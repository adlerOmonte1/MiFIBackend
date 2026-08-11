---
name: mifi-contexto-diseno
description: Índice y reglas de uso del paquete de diseño de MiFi (Historias de Usuario, Requerimientos Funcionales y No Funcionales, Entidad-Relación, Diagrama de Clases y Componentes, Wireframes, contrato OpenAPI, registro de decisiones ADR). Úsalo ANTES de implementar, diseñar o explicar cualquier funcionalidad del backend de MiFi, para saber qué documento consultar y no inventar entidades, endpoints o reglas de negocio que no estén documentados. Se activa con tareas como "implementa X", "agrega el endpoint Y", "qué campos tiene la tabla Z", "cómo funciona el flujo de W", o cualquier trabajo dentro del repositorio MiFiBackend.
metadata:
  version: "1.1.0"
  proyecto: MiFi
---

# Contexto de diseño de MiFi

MiFi es una app de gestión financiera personal para estudiantes,
**instrumento de una investigación de tesis** (no un producto comercial).
El software existe para producir los datos que miden los indicadores de la
matriz de operacionalización (pretest O₁ / postest O₂). Cada decisión de
diseño se valida contra esa meta, no contra "cuántas funciones tiene la app".

## Regla de oro

**No inventes** entidades, columnas, endpoints ni reglas de negocio que no
estén en la documentación de `docs/`. Si algo falta, decláralo como
pendiente y pregunta — no lo improvises. Esta regla ya está en
`docs/README.md §10` (instrucciones para agentes de IA); esta skill la
opera para que se cumpla automáticamente.

## Qué documento consultar según la tarea

| Tarea | Documento |
|:--|:--|
| **Retomar el proyecto en una sesión nueva, saber en qué paso quedamos** | **`docs/ESTADO_PROYECTO.md`** — leer primero, siempre |
| Entender el sistema completo, punto de partida | `docs/README.md` |
| Entender el "qué" desde el usuario | `docs/HistoriasUsuario.md` |
| Implementar una funcionalidad concreta | `docs/RequerimientosFuncionales.md` (busca el RF-XX) |
| Fijar una métrica no funcional (rendimiento, seguridad, usabilidad) | `docs/RequerimientosNoFuncionales.md` |
| Diseñar/generar clases de dominio | `docs/DiagramaClases.md` |
| Escribir el schema de Prisma o una migración | `docs/DiagramaEntidadRelacion.md` |
| Entender cómo se conectan los componentes técnicos | `docs/DiagramaComponentes.md` |
| Implementar la orquestación de un caso de uso | `docs/DiagramaSecuencias.md` |
| Detalle fino (flujos alterno/excepción) de un caso de uso crítico | `docs/EspecificacionesCasosUsoCriticos.md` |
| Implementar o consumir un endpoint | `docs/openapi.yaml` (fuente de verdad del contrato) |
| Diseñar una pantalla o saber qué componentes UI soporta un endpoint | `docs/Wireframes.md` |
| Resolver una ambigüedad o entender el "por qué" de una decisión | `docs/README.md §6` (registro de decisiones ADR, D-01 a D-14) |
| Ubicar en qué fase/sprint del proyecto estamos | `PlanTrabajo.md` |

## Registro de decisiones (ADR) — referencia rápida

Antes de asumir un comportamiento de seguridad o de datos, revisa si ya hay
una decisión tomada en `docs/README.md §6`. Las más relevantes para
cualquier código nuevo:

- **D-01**: autenticación propia (bcrypt + JWT), nunca Supabase Auth.
- **D-02**: bcrypt factor de costo 12.
- **D-03**: JWT con `jti` + tabla `sesiones` (revocación real en logout).
- **D-05**: control de acceso anti-IDOR — todo caso de uso verifica
  propiedad del recurso; si no es del usuario, responde **404**, no 403.
- **D-06**: tokens de Gmail cifrados con AES-256-GCM, clave en variable de
  entorno.
- **D-08**: umbral de gasto hormiga congelado durante la medición, con
  snapshot por transacción (`umbral_hormiga_aplicado`).
- **D-13 / D-14**: categorías propias del usuario y meta de ahorro con
  fecha límite opcional (decisiones tomadas al revisar `Wireframes.md`).
- **D-15**: doble marca de gasto hormiga — automática por umbral (RF-38,
  inmutable, alimenta el indicador de la tesis) + criterio propio del
  estudiante (RF-55, opcional, no sobrescribe a la automática).

## Trazabilidad obligatoria

Todo lo que implementes debe poder señalar su origen: un RF, una HU o un UC.
Cuando el motivo de una línea de código no sea obvio por el nombre de la
variable/función, coméntalo con el código de origen (ej.
`// RF-38 gasto hormiga`) — así lo pide `docs/README.md §10.5`.

## Idioma

Nombres de dominio (clases, campos, tablas, variables de negocio) y
comentarios de código: **en español**, coherente con el resto de la
documentación y con `prisma/schema.prisma` (`Usuario`, `Transaccion`,
`MetaAhorro`). El código de infraestructura genérico (nombres de
librerías, convenciones propias de TypeScript/Express) sigue su
convención habitual en inglés.
