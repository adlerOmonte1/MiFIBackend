import type { ResumenDashboard } from "../../aplicacion/casos-uso/ObtenerResumenDashboardUseCase";

/**
 * Mapea ResumenDashboard a la forma del contrato
 * (docs/openapi.yaml -> components.schemas.DashboardResumen).
 * fechaInicio/fechaFin como YYYY-MM-DD (format: date), mismo criterio que
 * transaccionResponse.ts.
 */
export function aRespuestaDashboard(resumen: ResumenDashboard) {
  return {
    periodo: resumen.periodo,
    fechaInicio: resumen.fechaInicio.toISOString().slice(0, 10),
    fechaFin: resumen.fechaFin.toISOString().slice(0, 10),
    ingresosTotal: resumen.ingresosTotal,
    egresosTotal: resumen.egresosTotal,
    ahorroTotal: resumen.ahorroTotal,
    gastosPorCategoria: resumen.gastosPorCategoria,
    gastosHormiga: resumen.gastosHormiga,
  };
}
