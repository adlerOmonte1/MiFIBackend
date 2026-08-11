export type Periodo = "semana" | "mes";

export interface RangoFechas {
  fechaInicio: Date;
  fechaFin: Date;
}

/**
 * RF-41 — traduce el filtro amigable de periodo a un rango de fechas
 * concreto. Vive acá, no en el repositorio: interpretar qué significa
 * "semana" o "mes" es una decisión de negocio, no de persistencia (lo
 * anotamos como pendiente al escribir ITransaccionRepository, Paso 3).
 *
 * Todo el cálculo usa métodos UTC (getUTCDate, Date.UTC...), nunca los
 * locales (getDate, new Date(y,m,d)): una fecha sin hora como "2026-08-12"
 * se parsea como medianoche UTC, y leerla con métodos locales en un
 * servidor que no corre en UTC (ej. America/Lima, UTC-5) hace que se lea
 * como el día anterior. Usar UTC de punta a punta evita que el resultado
 * dependa de en qué zona horaria esté desplegado el backend.
 *
 * Supuesto no documentado en los RF, lo dejo explícito: "semana" es la
 * semana calendario de lunes a domingo que contiene fechaReferencia, igual
 * que "mes" es el mes calendario que la contiene — no una ventana móvil de
 * los últimos 7/30 días. Y "hoy" se calcula en UTC, no en la hora local del
 * estudiante — razonable mientras toda la muestra esté en una sola zona
 * horaria (Perú), pero no lo sería si el proyecto creciera a otros países.
 */
export function calcularRangoPeriodo(
  periodo: Periodo,
  fechaReferencia: Date = new Date(),
): RangoFechas {
  if (periodo === "mes") {
    const fechaInicio = new Date(
      Date.UTC(fechaReferencia.getUTCFullYear(), fechaReferencia.getUTCMonth(), 1),
    );
    const fechaFin = new Date(
      Date.UTC(fechaReferencia.getUTCFullYear(), fechaReferencia.getUTCMonth() + 1, 0),
    );
    return { fechaInicio, fechaFin };
  }

  // "semana": lunes a domingo. getUTCDay() -> 0=domingo, 1=lunes, ..., 6=sábado.
  const diaSemana = fechaReferencia.getUTCDay();
  const diasDesdeElLunes = diaSemana === 0 ? 6 : diaSemana - 1;
  const fechaInicio = new Date(
    Date.UTC(
      fechaReferencia.getUTCFullYear(),
      fechaReferencia.getUTCMonth(),
      fechaReferencia.getUTCDate() - diasDesdeElLunes,
    ),
  );
  const fechaFin = new Date(
    Date.UTC(fechaInicio.getUTCFullYear(), fechaInicio.getUTCMonth(), fechaInicio.getUTCDate() + 6),
  );

  return { fechaInicio, fechaFin };
}
