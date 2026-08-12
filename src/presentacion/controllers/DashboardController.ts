import type { Request, Response } from "express";
import { z } from "zod";
import type { ObtenerResumenDashboardUseCase } from "../../aplicacion/casos-uso/ObtenerResumenDashboardUseCase";
import { aRespuestaDashboard } from "../mapeadores/dashboardResponse";

const esquemaDashboardQuery = z.object({
  periodo: z.enum(["semana", "mes"]).optional(), // RF-41
});

/** Solo traduce HTTP <-> caso de uso; sin lógica de negocio (ver skill mifi-arquitectura-solid). */
export class DashboardController {
  constructor(private readonly obtenerResumenDashboardUseCase: ObtenerResumenDashboardUseCase) {}

  resumen = async (req: Request, res: Response): Promise<void> => {
    const query = esquemaDashboardQuery.parse(req.query);
    const resumen = await this.obtenerResumenDashboardUseCase.ejecutar({
      usuarioId: req.usuarioId as string,
      ...(query.periodo !== undefined && { periodo: query.periodo }),
    });
    res.status(200).json(aRespuestaDashboard(resumen));
  };
}
