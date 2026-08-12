import type { ResumenDashboard } from "../../aplicacion/casos-uso/ObtenerResumenDashboardUseCase";
import { aRespuestaDashboard } from "./dashboardResponse";

describe("aRespuestaDashboard", () => {
  it("devuelve exactamente los campos que declara el contrato, ni más ni menos", () => {
    const resumen: ResumenDashboard = {
      periodo: "mes",
      fechaInicio: new Date("2026-08-01T00:00:00.000Z"),
      fechaFin: new Date("2026-08-31T00:00:00.000Z"),
      ingresosTotal: 500,
      egresosTotal: 200,
      ahorroTotal: 300,
      gastosPorCategoria: [{ categoriaId: "cat-1", nombre: "Comida", montoTotal: 200 }],
      gastosHormiga: { montoTotal: 50, porcentajeSobreEgresos: 25 },
    };

    const respuesta = aRespuestaDashboard(resumen);

    expect(Object.keys(respuesta).sort()).toEqual(
      [
        "periodo",
        "fechaInicio",
        "fechaFin",
        "ingresosTotal",
        "egresosTotal",
        "ahorroTotal",
        "gastosPorCategoria",
        "gastosHormiga",
      ].sort(),
    );
    expect(respuesta.fechaInicio).toBe("2026-08-01");
    expect(respuesta.fechaFin).toBe("2026-08-31");
  });
});
