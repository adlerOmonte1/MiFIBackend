---
name: mifi-nuevo-endpoint
description: Procedimiento paso a paso para agregar o modificar un endpoint del backend de MiFi, desde el contrato OpenAPI hasta las pruebas, garantizando trazabilidad RF/HU y que docs/openapi.yaml quede sincronizado con el código. Úsalo cuando la tarea sea "agrega el endpoint X", "implementa la ruta Y", "cambia el contrato de Z", o "expón esta funcionalidad en la API".
metadata:
  version: "1.0.0"
  proyecto: MiFi
---

# Procedimiento para un endpoint nuevo en MiFi

Sigue este orden. No saltes pasos aunque el endpoint parezca trivial —
es lo que mantiene `docs/openapi.yaml` como fuente de verdad real y no un
documento que se desactualiza.

## 1. Verifica el contrato en `docs/openapi.yaml`

- Si el endpoint **ya está definido**, esa es la especificación a
  implementar tal cual (path, método, request/response, códigos de
  error). No cambies el contrato sin decírselo al usuario primero.
- Si **no existe**, antes de inventarlo revisa si corresponde a un RF/HU
  ya documentado (carga la skill `mifi-contexto-diseno`). Si el RF no
  existe tampoco, decláralo como pendiente — no lo improvises.

## 2. Ubica el RF/HU/UC de origen

Todo endpoint debe trazarse a un requisito. Anótalo en el summary del
path en `openapi.yaml` (ya es la convención existente, ej. `RF-09 a
RF-12, UC-TRX-01`) y en el comentario del caso de uso que lo implementa.

## 3. Dominio (si aplica)

¿El endpoint necesita una entidad o regla de negocio nueva? Revisa
`docs/DiagramaClases.md` y `docs/DiagramaEntidadRelacion.md` — si la
entidad ya existe, reutilízala; si no, sigue el patrón de las existentes
(nombres en español, métodos que expresan reglas de negocio como
`estaBloqueado()`, `calcularProgreso()`).

## 4. Caso de uso

Un caso de uso por operación (crear, listar, confirmar, etc.), en
`src/aplicacion/casos-uso/`. Depende solo de interfaces de `dominio/`
(ver skill `mifi-arquitectura-solid`). Aplica aquí las reglas de negocio
del RF (validaciones, anti-IDOR, snapshot de umbral hormiga, etc.).

## 5. Infraestructura

Implementa contra las interfaces del paso 4 si aún no existen
(repositorio Prisma, servicio externo). Si ya existen, reutilízalas.

## 6. Controller + ruta

El controller solo traduce HTTP <-> caso de uso: parsea el request,
llama al caso de uso, mapea la respuesta/errores a los códigos HTTP del
contrato OpenAPI. Sin lógica de negocio aquí.

## 7. Pruebas

- **Unitaria del caso de uso**, con mocks de las interfaces (sin DB
  real) — cubre el camino feliz y al menos un caso de error del RF.
- **Integración/E2E del endpoint** con Supertest — status code y forma
  de la respuesta coinciden con `openapi.yaml`.
- Si el endpoint opera sobre un recurso de usuario, agrega el caso de
  prueba anti-IDOR: usuario A no puede acceder/editar un recurso de
  usuario B → 404 (D-05).

## 8. Sincroniza el contrato

Si algo cambió respecto a lo que decía `openapi.yaml` (un campo nuevo,
un código de error adicional), actualiza el YAML en el mismo cambio —
nunca dejes que el código y el contrato diverjan.

## Antes de terminar

Corre `npm run lint`, `npm run typecheck` y `npm test` — deben pasar
limpios antes de considerar el endpoint terminado (ver skill
`mifi-checklist-pr` para el resto del checklist previo a un PR).
