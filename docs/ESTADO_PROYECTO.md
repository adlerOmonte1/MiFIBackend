# ESTADO DEL PROYECTO — MiFi Backend

> **Si sos una sesión nueva de Claude Code retomando este proyecto: leé este
> archivo completo antes de hacer nada.** Después cargá la skill
> `mifi-flujo-incremental` (metodología de trabajo) y corré `git status` +
> `git log --oneline -8` para confirmar que el estado real del repo coincide
> con lo que dice acá. Si no coincide, avisá antes de seguir.

*Última actualización: Sprint 2 completo y mergeado a `staging` y `main`
(PR #21 y #22). Listo para arrancar Sprint 3 (Ahorro).*

---

## 1. Qué es este proyecto (resumen ultra corto)

MiFi es una app de finanzas personales para estudiantes universitarios —
**instrumento de una investigación de tesis**, no un producto comercial. El
software existe para producir los datos que se comparan antes (pretest O₁)
y después (postest O₂) de que 40 estudiantes usen la app. Contexto completo
en `docs/README.md`.

## 2. Cómo se viene trabajando (ver skill `mifi-flujo-incremental`)

"Vibe coding supervisado": el código lo genera la IA, pero cada paso se
valida de verdad — tests reales (no solo "debería funcionar"), pruebas
contra el Supabase real del usuario cuando aplica, bugs reintroducidos a
propósito para confirmar que el test los detecta. Se trabaja en **pasos
chicos y numerados**, un commit por unidad de trabajo, con los comandos de
git dados explícitamente para que el usuario mismo los corra.

## 3. Dónde estamos AHORA MISMO

- **Sprint 2 (Transacciones) está COMPLETO y mergeado**: PR #21
  (`feature/rf09-rf15-transacciones` → `staging`) y PR #22 (`staging` →
  `main`), ambos mergeados por el usuario. `main` y `staging` están al día.
- La rama `feature/rf09-rf15-transacciones` ya cumplió su propósito — no
  seguir trabajando ahí. Para Sprint 3, crear una rama nueva desde
  `staging` (ej. `feature/rf30-rf35-ahorro`).
- **Fase del `PlanTrabajo.md`:** Fase 3 — Desarrollo incremental,
  **Sprint 3 (Ahorro) sin empezar**.
- **Siguiente paso concreto: Sprint 3 / Paso 1** — entidad de dominio
  `MetaAhorro`. Ver plan completo en la sección 5.1 de este documento.

## 4. Sprint 1 — Autenticación: ✅ COMPLETO, mergeado a `staging`

RF-01 a RF-08, RF-47 a RF-49. 5 endpoints (`/auth/registro`, `/auth/login`,
`/auth/logout`, `/usuarios/me`, `/consentimiento`), arquitectura en 4 capas
completa, probado de punta a punta contra Supabase real (registro → login →
logout → confirmar que el token murió). Detalle completo en el historial de
commits de `staging` — no hace falta releerlo para seguir con Sprint 2.

**4 hallazgos de una auditoría de seguridad OWASP quedaron pendientes,
cargados como Issues en GitHub** (el usuario los creó a mano siguiendo la
skill `mifi-checklist-pr`/`.github/ISSUE_TEMPLATE/bug_report.md`):
1. Enumeración de usuarios en login (timing attack + status 423 revela
   existencia de cuenta)
2. Sin rate limiting en `/auth/login` y `/auth/registro`
3. Middleware de consentimiento — **ya resuelto** en Sprint 2 (ver abajo,
   `consentimientoMiddleware.ts`), pero el Issue sigue abierto en GitHub,
   cerrarlo ahí manualmente
4. `JWT_SECRET` sin validar fuerza mínima + password sin longitud máxima
   (bcrypt trunca a 72 bytes) + CORS abierto a cualquier origen

Ninguno de estos 4 se tocó todavía en código, excepto el punto 3.

## 5. Sprint 2 — Transacciones: ✅ COMPLETO, mergeado a `staging` y `main`

RF-09 a RF-15, RF-36 a RF-41, RF-55/RF-56 (adenda). Objetivo: es el sprint
que produce el primer dato real de la tesis ("N.º de registros por
semana").

### Pasos completados

| Paso | Qué es | Commit(s) |
|---|---|---|
| 1 | Seed de categorías predefinidas (Comida, Transporte, Ocio, Servicios, Otros) | `feat(prisma): seed de categorias predefinidas` |
| 2 | Entidad `Transaccion` (dominio puro) | `feat(dominio): entidad Transaccion...` + fix posterior |
| 3 | Interfaz `ITransaccionRepository` | `feat(dominio): interfaz ITransaccionRepository...` + método `listarPorPeriodo` agregado en el Paso 4.5 |
| — | Middleware de consentimiento (Issue #3) | `feat(presentacion): middleware de consentimiento (RF-49, CON-01)` — **construido pero todavía NO montado en ninguna ruta** (no hay rutas financieras todavía) |
| — | Fix: `Transaccion.tipo` editable + `marcarComoGastoHormiga()` borra la marca al pasar a ingreso | `fix(dominio): borra la marca de gasto hormiga al editar...` |
| — | Fix: `ConsentimientoController` devolvía solo 4 de 8 campos del contrato | `fix(presentacion): POST /consentimiento devuelve el esquema Usuario completo` |
| — | Fix: `npm run build` compilaba los `.test.ts` a `dist/` | `fix(build): excluye archivos de test y test-utils del build` |
| — | Entidad `Categoria` + `ICategoriaRepository` (hallazgo #7 de la auditoría: nadie validaba que `categoriaId` fuera válido) | `fix(aplicacion): valida que la categoria sea predefinida o propia del usuario` |
| **4.1** | `RegistrarTransaccionUseCase` (RF-09 a RF-11, RF-38) | `feat(aplicacion): RegistrarTransaccionUseCase...` |
| **4.2** | `ListarTransaccionesUseCase` + `calcularRangoPeriodo` (RF-09, RF-41) | `feat(aplicacion): ListarTransaccionesUseCase...` |
| **4.3** | `EditarTransaccionUseCase` (RF-13, RF-15, RF-55) | `feat(aplicacion): EditarTransaccionUseCase...` |
| **4.4** | `EliminarTransaccionUseCase` (RF-14, RF-15) | `feat(aplicacion): EliminarTransaccionUseCase...` |
| **4.5** | `ObtenerResumenDashboardUseCase` (RF-37, RF-39 a RF-41) | `feat(aplicacion): ObtenerResumenDashboardUseCase...` |

**106 pruebas automatizadas**, todas coloc adas junto a su archivo fuente
(`Archivo.ts` + `Archivo.test.ts` — convención confirmada explícitamente
con el usuario, no cambiar sin volver a preguntar).

### Pasos 5 a 8 (completados en esta sesión)

| Paso | Qué es | Commit(s) |
|---|---|---|
| **5.1** | `ICategoriaRepository.listar()` + `PrismaCategoriaRepository` | `feat(infraestructura): PrismaCategoriaRepository (RF-36, RF-50)` |
| **5.2** | `PrismaTransaccionRepository` (los 6 métodos de la interfaz) | `feat(infraestructura): PrismaTransaccionRepository...` + `fix(estilo): formatea con Prettier` |
| **6.1** | `ListarCategoriasUseCase` (RF-36, RF-37) | `feat(dominio,aplicacion): ListarCategoriasUseCase...` |
| **6.2** | `TransaccionController` + rutas `/transacciones` (CRUD completo, RF-10/RF-11 validados con Zod) | `feat(dominio,aplicacion): ListarCategoriasUseCase...` (mensaje mal etiquetado, contenido correcto — ver nota abajo) |
| **6.3 + 6.4** | `CategoriaController` + `GET /categorias`, `DashboardController` + `GET /dashboard/resumen` | `feat(presentacion): endpoint GET /dashboard/resumen...` (un solo commit con ambos, ver nota abajo) |
| **6.5 / 7** | Composición en `contenedor.ts`: todos los repos/casos de uso/controllers/rutas conectados con `authMiddleware` + `consentimientoMiddleware` | `feat(composicion): conecta transacciones, categorias y dashboard...` |
| **8** | Prueba E2E con `curl` contra Supabase real: registro → consentimiento → categorías → crear/editar/listar/eliminar transacción → dashboard → 404 anti-IDOR tras eliminar. Todo OK. | (no aplica, verificación manual) |

**Nota sobre el historial de commits:** al pegar los comandos de git para
6.2/6.3/6.4, los mensajes quedaron desalineados del contenido real (ver
`git log --stat` de esos commits si hace falta reconstruir el detalle). El
código y las pruebas son correctos — es solo el texto del mensaje. No se
reescribió el historial porque ya estaba pusheado.

**Hallazgos corregidos sobre la marcha (no eran parte del plan original):**
- `ICategoriaRepository` no tenía forma de listar categorías — hacía falta
  para `GET /categorias` (necesario para que el cliente arme el selector
  de categoría al crear una transacción). Se agregó `listar(usuarioId)`.
- `docs/openapi.yaml` no documentaba el `403 ConsentimientoRequerido` en
  `GET/PUT/DELETE /transacciones/{id}` (sí lo tenía en POST y GET listado).
  Se sincronizó el contrato: las 5 rutas de `/transacciones` llevan
  `authMiddleware` + `consentimientoMiddleware` de forma uniforme.
- RF-10 (monto > 0) y RF-11 (fecha no futura) no estaban validados en
  ningún lado — se agregaron en `TransaccionController` con Zod
  (`z.iso.date()` + comparación de calendario UTC para RF-11).
- El `.env` local no tenía `JWT_SECRET` (vacío) ni `UMBRAL_GASTO_HORMIGA`
  (ausente) — se completaron con un valor generado y el default de
  `.env.example` (15) para poder levantar el servidor y probar.

## 5.1. Sprint 3 — Ahorro (siguiente, sin empezar): plan de pasos

RF-30 a RF-35, AHO-01/AHO-02. Objetivo: producir "monto ahorrado" y
"% cumplimiento" para la tesis. Contrato ya definido en
`docs/openapi.yaml` (`/metas-ahorro`) y modelo `MetaAhorro` en
`prisma/schema.prisma`. Mismo patrón de pasos chicos que Sprint 2:

| Paso | Qué es |
|---|---|
| 1 | Entidad de dominio `MetaAhorro` — calcula `montoAhorrado`, `porcentajeCumplimiento` (tope 100%, RF-33/34) y transición de `estado` (activa/cumplida/inactiva) |
| 2 | Interfaz `IMetaAhorroRepository` |
| 3 | **Cerrar deuda pendiente de Sprint 2:** `RegistrarTransaccionUseCase`/`EditarTransaccionUseCase` hoy ignoran `metaAhorroId` a propósito (comentario "Sprint 3" en el código) — habilitarlo, validando pertenencia igual que `categoriaId` (anti-IDOR) |
| 4 | Casos de uso: `CrearMetaAhorroUseCase` (RF-30 a RF-32), `ListarMetasAhorroUseCase` con progreso en tiempo real (RF-33/34), `ObtenerMetaAhorroUseCase`, `EliminarMetaAhorroUseCase` (elimina o marca `inactiva` si tiene transacciones vinculadas, ver detalle de AHO-01/openapi) |
| 5 | Infraestructura: `PrismaMetaAhorroRepository` |
| 6 | Presentación: `MetaAhorroController` + rutas `/metas-ahorro` (con `authMiddleware` + `consentimientoMiddleware`) |
| 7 | Composición en `contenedor.ts` |
| 8 | Prueba real de punta a punta contra Supabase (script descartable primero, después Postman/manual) |

**Nota:** RF-35 ("recalcular el progreso automáticamente") se cumple
gratis con el Paso 1 + 4, si se mantiene el mismo criterio que el
dashboard: todo se calcula en tiempo real desde las transacciones, sin
precálculo — no hace falta lógica extra de "recálculo".

**Antes de arrancar:** crear una rama nueva desde `staging`
(`feature/rf30-rf35-ahorro` o similar) — `feature/rf09-rf15-transacciones`
ya está mergeada y no debe seguir recibiendo commits.

## 6. Decisiones tomadas durante Sprint 2 (más allá del `docs/README.md` §6)

Todas ya están en el código como comentarios, pero acá el resumen:

- **D-15** (ya en el ADR del README): doble marca de gasto hormiga —
  automática por umbral (`esGastoHormiga`, RF-38, inmutable) + criterio
  propio del estudiante (`esGastoHormigaUsuario`, RF-55, opcional). Ninguna
  sobrescribe a la otra. El indicador de la tesis usa **siempre** la
  automática.
- **Umbral de gasto hormiga**: variable de entorno `UMBRAL_GASTO_HORMIGA`
  (default 15 en `.env.example`), inyectada por constructor a los casos de
  uso — nunca hardcodeada, para que sea ajustable en la calibración (D-08).
- **`metaAhorroId` NO se acepta todavía** en ningún caso de uso de Sprint 2
  — las metas de ahorro son Sprint 3; aceptar el campo sin poder validar
  pertenencia sería un hueco anti-IDOR. Siempre se persiste `null`.
- **`categoriaId` SÍ se valida** (`Categoria.puedeSerUsadaPor(usuarioId)`):
  predefinida (usable por cualquiera) o propia del mismo usuario — nunca la
  categoría propia de otro.
- **`ahorroTotal` del dashboard = ingresos − egresos del periodo.**
  Supuesto explícito, ningún RF lo define con esa precisión — distinto del
  progreso de una meta de ahorro (AHO-02, Sprint 3, concepto separado).
- **"semana" = lunes a domingo calendario** que contiene la fecha de
  referencia (no una ventana móvil de 7 días). Supuesto explícito, RF-41 no
  lo especifica.
- **Todo cálculo de fechas usa métodos UTC**, nunca locales
  (`getUTCDate()`, no `getDate()`). Se encontró un bug real: una fecha como
  `"2026-08-12"` se parsea como medianoche UTC; leerla con métodos locales
  en un servidor que no corre en UTC (ej. Lima, UTC-5) hace que se lea como
  el día anterior. Afecta a `calcularRangoPeriodo.ts` y por extensión a
  cualquier cosa que compare `transaccion.fecha`.

## 7. Convenciones ya decididas (no volver a preguntar)

- Tests colocados junto al archivo fuente (confirmado explícitamente, ver
  §2 de este documento).
- Commits: tipo en inglés (`feat`/`fix`/`chore`/`docs`), descripción en
  español, referencia al RF/HU cuando aplica (`CONTRIBUTING.md`).
- Una rama por sprint/feature: `feature/rf01-rf08-...`,
  `feature/rf09-rf15-...`. Flujo: `feature/*` → PR → `staging` → PR → `main`
  (despliegue). El usuario viene sincronizando `staging` a `main` en cada
  merge — es su decisión de flujo, no cuestionarla sin que pregunte.
  `main` está definido como la rama de despliegue.
- Antes de cada commit: chequear dependencias ocultas con
  `grep "^import"` de cada archivo nuevo (incluye buscar `.d.ts` sin
  import explícito), correr el pipeline completo local — **exactamente
  los mismos pasos que `.github/workflows/ci.yml`**: `npx prisma validate`
  (si tocaste el schema), `npm run lint`, `npm run format:check`,
  `npm run typecheck`, `npm run test:coverage` (no solo `jest` — hay un
  umbral de cobertura RNF-18 en dominio/aplicación), `npm run build` — y
  recién ahí dar los comandos de git. El usuario los corre.
  (Se aprendió en Sprint 2: correr solo lint/typecheck/jest/build sin
  `format:check` dejó pasar un archivo mal formateado que rompió el CI.)
- `gh` (CLI de GitHub) **no está disponible** en este entorno — los PRs y
  Issues se crean manualmente en la web de GitHub.

## 8. Cómo probar contra Supabase real (si hace falta)

`.env` ya existe localmente con `DATABASE_URL` (Session Pooler de Supabase
— el "Direct connection" no funciona en este entorno por resolver solo
IPv6). Patrón usado para pruebas puntuales: escribir un script `.mjs`/`.mts`
descartable, correrlo con `node`/`npx tsx`, borrar los datos de prueba
después, y limpiar el archivo temporal. Nunca dejar scripts de prueba
sueltos en el repo.
