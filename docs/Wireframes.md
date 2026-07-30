# WIREFRAMES — MOCKUP DE ALTA FIDELIDAD (17 PANTALLAS)

> **Origen:** boceto generado con Claude Design, publicado como Artifact
> ["Diseño de app financiera con 5 flujos"](https://claude.ai/code/artifact/fd493e7e-23f0-490d-b1d7-9c532067bdb7).
> Este documento transcribe su contenido a texto plano para que quede
> versionado junto al resto del paquete de diseño y sea legible por
> agentes de IA sin depender de renderizar el Artifact. Cierra el pendiente
> 1.4 del [PlanTrabajo.md](../PlanTrabajo.md) (Fase 1 — Diseño de interfaz).

## Especificación general

| Aspecto | Definición |
|:--|:--|
| Pantallas | 17, a 375×812 (referencia de UX para React Native) |
| Color | Verde esmeralda como primario (ahorro/crecimiento); ámbar solo para alertas |
| Tipografía | Nunito. El monto siempre es el elemento más grande de la pantalla |
| Navegación | Tab bar de 4 (Inicio · Movimientos · Metas · Perfil) + botón central para registrar (manual u OCR) |
| Supuestos | Moneda S/, un solo perfil, periodo por defecto = mes, íconos como placeholders geométricos |

---

## Flujo A — Entrada: onboarding, consentimiento y cuenta

Corresponde a AUT-01, AUT-02, CON-01.

| # | Pantalla | Elementos clave | HU/RF |
|---|:--|:--|:--|
| 01 | Onboarding | Ilustración, título "Tu plata, siempre clara", texto de valor, botón "Continuar" | — |
| 02 | Consentimiento informado | Bloques "Qué guardamos" / "Para qué" / "Tu control", checkbox "Acepto participar en el estudio y el uso de mis datos anónimos" con sello de fecha/hora de aceptación, botón "Acepto y continúo" | CON-01, RF-47 a RF-49 |
| 03 | Registro de cuenta | Campos Correo y Contraseña ("mínimo 8 caracteres"), botón "Crear cuenta", link "¿Ya tienes cuenta? Inicia sesión" | AUT-01, RF-01 a RF-04 |
| 04 | Inicio de sesión | Correo prellenado, botón "Entrar", link "¿Olvidaste tu contraseña?" | AUT-02, RF-05 a RF-07 |

---

## Flujo B — Núcleo: dashboard, registro manual y movimientos

Corresponde a DSH-01, TRX-01, TRX-02.

| # | Pantalla | Elementos clave | HU/RF |
|---|:--|:--|:--|
| 05 | Home / Dashboard | Saludo con nombre, toggle Mes/Semana, monto disponible del periodo, tarjetas Ingresos/Egresos/Ahorro/% Hormiga, lista "Últimos movimientos" con link "Ver todo", tab bar | DSH-01, RF-40, RF-41 |
| 05b | Botón central — elegir cómo registrar | Bottom sheet con 3 opciones: "Manual" (escribe el monto), "Escanear boleta" (la cámara lee el monto), "Desde mi correo" (badge con nº de movimientos por confirmar) | TRX-01, OCR-01, GML-02, CNF-01 |
| 06 | Registrar transacción manual | Selector Egreso/Ingreso, monto grande editable, chips de categoría (Comida, Pasaje, Estudio, Ocio, "···Más"), fecha, teclado numérico, botón "Guardar" | TRX-01, RF-09 a RF-11 |
| 07 | Movimientos (tab 2) | Buscador, filtro de mes, agrupación por día con subtotal, cada ítem muestra categoría/origen (manual, boleta escaneada, correo) y monto | TRX-01, TRX-02, RF-09 |

---

## Flujo C — Automatización: OCR de boletas y detección por correo

Corresponde a OCR-01, CNF-01, GML-01, GML-02.

| # | Pantalla | Elementos clave | HU/RF |
|---|:--|:--|:--|
| 08 | Escanear boleta (cámara) | Vista de cámara en vivo, guía de encuadre "A4", instrucción "Encuadra la boleta completa. Detectamos el monto automáticamente" | OCR-01, RF-16, RF-17 |
| 09 | Confirmar boleta escaneada (OCR) | Miniatura de la foto, monto detectado editable ("toca para editar"), comercio/tipo/fecha/categoría, aviso "Revisa el monto antes de guardar: la lectura tuvo 92% de confianza", botones "Guardar movimiento" / "Escanear otra vez" | OCR-01, CNF-01, RF-18, RF-19, RF-20 |
| 10 | Confirmar sugerencia (OCR / correo) — cola genérica | Contador "Por confirmar: 2", tarjeta por sugerencia con origen visible (correo / cámara), monto, comercio/categoría sugerida, acciones "Guardar" / "Editar" / "Descartar", nota "Nada se guarda sin tu confirmación" | CNF-01, RF-20 a RF-22 |
| 11 | Conectar cuenta de correo | Explicación "Sí leemos" (monto, comercio, fecha de avisos bancarios) vs. "No leemos" (correos personales, contactos, archivos), nota de poder desconectar en cualquier momento, botones "Autorizar mi correo" / "Ahora no" | GML-01, RF-23 a RF-25 |

---

## Flujo D — Ahorro y análisis: metas, categorías, gastos hormiga

Corresponde a AHO-01, AHO-02, CAT-01, CAT-02.

| # | Pantalla | Elementos clave | HU/RF |
|---|:--|:--|:--|
| 12 | Metas de ahorro — lista (tab 3) | Resumen "% ahorrado en total" con monto acumulado sobre objetivo total y nº de metas; tarjeta por meta con % de progreso, monto ahorrado/objetivo y fecha límite **o "Sin fecha límite"** | AHO-01, AHO-02, RF-32 a RF-34 |
| 13 | Crear nueva meta | Monto objetivo grande, nombre de la meta, selector de fecha límite con atajos (3 meses / 5 meses / 1 año), proyección "S/ X por semana equivale a...", botón "Crear meta" | AHO-01, RF-30, RF-31 |
| 14 | Categorías de gasto — resumen | Toggle Semana/Mes, total de egresos del periodo, barra por categoría con % y monto (Comida, Transporte, Estudio, Ocio, Otros) | CAT-01, RF-36, RF-37 |
| 15 | Gastos hormiga | % sobre egresos del periodo, monto total en "compras chicas", equivalencia motivacional ("2 semanas de tu meta"), ranking de gastos más repetidos con frecuencia y promedio, CTA "Ponle un límite semanal" | CAT-02, RF-38, RF-39 |

---

## Flujo E — Estudio y cuenta: encuesta SUS y perfil

Corresponde a USA-01, GML-01 (revocación), CON-01 (consulta).

| # | Pantalla | Elementos clave | HU/RF |
|---|:--|:--|:--|
| 16 | Encuesta de usabilidad (SUS) | Progreso "3 de 10", ítem estándar SUS con escala Likert 1-5 ("En desacuerdo" ↔ "De acuerdo"), navegación "Atrás" / "Siguiente" | USA-01, RF-42 a RF-44 |
| 17 | Perfil / Configuración (tab 4) | Datos de cuenta, estado de correo conectado ("Activo · leído hoy") con "Desconectar correo", accesos a Notificaciones / Categorías y límites / Exportar mis datos / Consentimiento del estudio (con fecha), "Cerrar sesión" | GML-01, RF-08, RF-25 |

---

## Decisiones tomadas a partir de la revisión de este boceto

Al revisar el mockup contra la documentación existente se detectaron dos
puntos donde el boceto se adelantaba a una decisión de producto que los RF
originales no contemplaban. Se resolvieron así (ver ADR **D-13** y **D-14**
en [README.md §6](README.md#6-registro-de-decisiones-de-diseño-y-seguridad-adr)
para el detalle, y los documentos actualizados en consecuencia):

1. **Categorías libres.** El boceto (pantalla 06) sugiere una chip "···Más"
   junto a las categorías predefinidas. Se decidió que el estudiante puede
   **crear sus propias categorías**, además de usar las predefinidas —no
   solo eran un chip visual, es una capacidad real del sistema. Ver RF-53,
   RF-54 (nuevas) en [RequerimientosFuncionales.md](RequerimientosFuncionales.md).
2. **Fecha límite de meta opcional.** El boceto (pantalla 12, meta "Fondo de
   emergencia") muestra una meta sin fecha límite, lo cual contradecía
   RF-31/ERD (fecha límite obligatoria). Se decidió que la fecha límite es
   **opcional, a elección del estudiante**; si se define, debe ser futura.
   Ver RF-30/RF-31 actualizados.

## Pendientes de refinamiento (no bloquean Fase 1)

El propio boceto señala 5 puntos de detalle a definir durante la
construcción (Fase 3), no antes:

1. Taxonomía final de categorías predefinidas (hoy: Comida, Pasaje/Transporte, Estudio, Ocio, Otros).
2. Estados de error del OCR: monto no legible, boleta borrosa, duplicado.
3. Reglas de detección por correo por banco y ventana de deduplicación.
4. Estados vacíos (sin movimientos, sin metas) y micro-copys de alerta de gastos hormiga.
5. Prototipo navegable de los 3 flujos críticos (B, C, núcleo) para el test SUS piloto.

---
