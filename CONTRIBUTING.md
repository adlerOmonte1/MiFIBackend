# Guía de contribución — MiFiBackend

Convención de ramas y commits para este repositorio (Fase 2.5 del
[PlanTrabajo.md](PlanTrabajo.md)). Git Flow simplificado — no hace falta
más ceremonia para un equipo pequeño y un proyecto de tesis.

## Ramas

| Rama | Propósito |
|:--|:--|
| `main` | Siempre desplegable. Solo se llega vía Pull Request con CI en verde. |
| `feature/<rf-o-hu>-descripcion-corta` | Una funcionalidad, ej. `feature/rf01-registro-usuario` |
| `fix/<descripcion-corta>` | Corrección de un bug, ej. `fix/bloqueo-login-no-persiste` |
| `docs/<descripcion-corta>` | Cambios solo de documentación |
| `chore/<descripcion-corta>` | Tooling, dependencias, configuración |

No se trabaja directo sobre `main`.

## Commits

Formato [Conventional Commits](https://www.conventionalcommits.org/),
tipo en inglés (estándar de la herramienta), descripción en español
(consistente con el resto del proyecto):

```
<tipo>(<alcance>): <descripción en español>
```

Tipos usados en este proyecto: `feat`, `fix`, `test`, `docs`, `refactor`,
`chore`, `perf`.

Cuando el commit implementa o modifica un requisito documentado,
referencia su código:

```
feat(auth): RF-01 registro de estudiante con validación de correo único
fix(ahorro): RF-35 recalcular progreso al eliminar transacción vinculada
docs(openapi): agrega endpoints de categorías propias (RF-53, RF-54)
```

## Pull Requests

1. Antes de abrir el PR, corre el checklist de la skill
   `mifi-checklist-pr` (lint, typecheck, tests, build — los mismos
   pasos que corre `.github/workflows/ci.yml`).
2. Usa la plantilla de PR (`.github/pull_request_template.md`) — se
   completa sola al abrir el PR en GitHub.
3. El PR debe pasar CI en verde antes de mergear a `main`.
4. Merge por squash, para mantener el historial de `main` legible
   (un commit por funcionalidad, no uno por cada `wip`).

## Convención de código

Ver la skill `mifi-arquitectura-solid` para la estructura de carpetas y
la aplicación de SOLID, y `mifi-contexto-diseno` para qué documento de
`docs/` consultar antes de implementar algo.
