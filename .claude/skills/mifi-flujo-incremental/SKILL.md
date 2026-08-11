---
name: mifi-flujo-incremental
description: Metodología de trabajo del proyecto MiFi — "vibe coding supervisado", código generado por IA pero validado en cada paso contra tests reales, Supabase real y los documentos de diseño, entregado en pasos chicos y comprobables. Úsala en CUALQUIER sesión de desarrollo de MiFiBackend, desde el primer mensaje — define cómo se trabaja, no qué se construye (para eso están mifi-contexto-diseno, mifi-arquitectura-solid, mifi-nuevo-endpoint, mifi-checklist-pr). Se activa siempre que el usuario pida seguir desarrollando, retomar el proyecto, o pregunte "en qué paso estamos".
metadata:
  version: "1.0.0"
  proyecto: MiFi
---

# Metodología de MiFi — vibe coding supervisado

## Lo primero, en cualquier sesión nueva

1. Leé **`docs/ESTADO_PROYECTO.md`** completo — dice exactamente en qué paso
   quedamos, qué se decidió, y qué falta. Es un documento vivo, se actualiza
   en cada corte de sesión.
2. Corré `git status` y `git log --oneline -8` — confirmá que el estado real
   del repo coincide con lo que dice `ESTADO_PROYECTO.md`. Si no coincide,
   avisá antes de seguir; no asumas.
3. Cargá `mifi-contexto-diseno` para saber qué documento consultar según la
   tarea, y `mifi-arquitectura-solid` si vas a escribir código.

## Qué significa "supervisado" acá — la regla que más importa

El usuario no confía en que el código "probablemente" funciona porque lo
generó una IA. Cada afirmación se **demuestra**, no se asume:

- Un caso de uso nuevo no está "listo" hasta que sus pruebas pasan de
  verdad (`npx jest`), no porque "debería funcionar".
- Un fix de un bug no está probado hasta que **se reintrodujo el bug a
  propósito y se confirmó que el test lo detecta** — ya pasó varias veces en
  este proyecto (`ConsentimientoController`, `calcularRangoPeriodo`).
- Un endpoint no está verificado hasta que corrió contra el **Supabase
  real** del usuario (no solo contra fakes en memoria) — con `curl` o un
  script `tsx` desechable, nunca asumiendo que "como pasan los tests,
  funciona en producción".
- Si algo no está en la documentación de diseño (`docs/`), no se inventa:
  se declara como supuesto explícito (comentario en el código + aviso al
  usuario) o se pregunta.

## El ritmo de trabajo: pasos chicos, comprobables, uno a la vez

Cada sprint se divide en **Pasos numerados** (y sub-pasos si hace falta,
ej. 4.1, 4.2). El patrón que se repite en cada uno:

1. **Revisar dependencias antes de escribir código** — qué RF/HU exige esto,
   qué interfaces/entidades ya existen para reusar. No asumir, `grep`/leer.
2. **Escribir el código**, con comentarios que referencien el RF/HU/UC/D-
   de origen — nunca código sin trazabilidad.
3. **Escribir las pruebas** en el mismo commit, coloc adas junto al archivo
   (`Archivo.ts` + `Archivo.test.ts` — es la convención elegida del
   proyecto, ver `mifi-checklist-pr`).
4. **Correr la prueba práctica**: `typecheck`, `lint`, `format`, `jest`, y
   cuando aplique, contra Supabase real.
5. **Chequear dependencias del commit** — `grep "^import"` de cada archivo
   nuevo, confirmar que todo lo que usa ya está comiteado o va en el mismo
   commit. Esto ya falló dos veces en este proyecto por no chequearlo
   (`test-utils/fakes.ts`, `presentacion/tipos/express.d.ts` — un `.d.ts`
   que ningún grep de imports detecta porque nadie lo importa
   explícitamente, TypeScript lo toma solo).
6. **Dar los comandos de git exactos**, agrupados por qué es cada cosa
   (fix separado de feature separado de docs). **El usuario corre los
   comandos, no vos** — es una decisión explícita del proyecto, no falta de
   confianza: así el usuario entiende y controla su propio historial de git.
7. Si en el camino aparece un bug o un hueco real (no hipotético), se
   corrige ahí mismo con transparencia — se explica qué se encontró, por
   qué importa, y se corrige en su propio commit separado del trabajo
   principal.

## Seguridad, siempre presente, no al final

- Anti-IDOR (D-05, RF-50): mismo error (404) si un recurso no existe o si
  es de otro usuario — nunca 403, nunca se distingue.
- El `usuarioId` siempre sale del token, nunca del body/params del cliente.
- Antes de aceptar una referencia a otro recurso (ej. `categoriaId` en una
  transacción), validar que el usuario tenga permiso de usarlo — no
  asumir que un id que llegó del cliente es válido.
- Cuando se encuentra un hallazgo de seguridad que no se va a arreglar en
  el momento, se dejan **Issues de GitHub** (`.github/ISSUE_TEMPLATE/`)
  para no perderlo — no alcanza con mencionarlo en el chat.

## Actualizar `ESTADO_PROYECTO.md`

Antes de cerrar una sesión larga o cuando el usuario pida migrar a un chat
nuevo, actualizá `docs/ESTADO_PROYECTO.md` con: en qué paso se quedó,
decisiones nuevas tomadas, deuda técnica nueva encontrada. Es lo que le
permite a la siguiente sesión (con contexto cero) retomar sin releer todo
este historial.
