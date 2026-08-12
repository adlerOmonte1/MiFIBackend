import type { Request, Response } from "express";
import type { ObtenerResumenDashboardUseCase } from "../../aplicacion/casos-uso/ObtenerResumenDashboardUseCase";
import { DashboardController } from "./DashboardController";

function crearRes() {
  const res = { status: jest.fn(), json: jest.fn() };
  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);
  return res as unknown as Response & { status: jest.Mock; json: jest.Mock };
}

const RESUMEN_BASE = {
  periodo: "mes" as const,
  fechaInicio: new Date("2026-08-01T00:00:00.000Z"),
  fechaFin: new Date("2026-08-31T00:00:00.000Z"),
  ingresosTotal: 0,
  egresosTotal: 0,
  ahorroTotal: 0,
  gastosPorCategoria: [],
  gastosHormiga: { montoTotal: 0, porcentajeSobreEgresos: 0 },
};

describe("DashboardController", () => {
  it("toma el usuarioId del token y el periodo de query", async () => {
    const ejecutar = jest.fn().mockResolvedValue(RESUMEN_BASE);
    const controller = new DashboardController({
      ejecutar,
    } as unknown as ObtenerResumenDashboardUseCase);
    const req = {
      query: { periodo: "semana" },
      usuarioId: "usuario-del-token",
    } as unknown as Request;

    await controller.resumen(req, crearRes());

    expect(ejecutar).toHaveBeenCalledWith({ usuarioId: "usuario-del-token", periodo: "semana" });
  });

  it("responde 200 con el resumen mapeado al contrato", async () => {
    const controller = new DashboardController({
      ejecutar: jest.fn().mockResolvedValue(RESUMEN_BASE),
    } as unknown as ObtenerResumenDashboardUseCase);
    const req = { query: {}, usuarioId: "usuario-del-token" } as unknown as Request;
    const res = crearRes();

    await controller.resumen(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ periodo: "mes" }));
  });
});
