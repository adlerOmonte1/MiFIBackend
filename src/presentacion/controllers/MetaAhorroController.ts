import type { Request, Response } from "express";
import { z } from "zod";
import type { CrearMetaAhorroUseCase } from "../../aplicacion/casos-uso/CrearMetaAhorroUseCase";
import type { EliminarMetaAhorroUseCase } from "../../aplicacion/casos-uso/EliminarMetaAhorroUseCase";
import type { ListarMetasAhorroUseCase } from "../../aplicacion/casos-uso/ListarMetasAhorroUseCase";
import type { ObtenerMetaAhorroUseCase } from "../../aplicacion/casos-uso/ObtenerMetaAhorroUseCase";
import { aRespuestaMetaAhorro } from "../mapeadores/metaAhorroResponse";

// docs/openapi.yaml -> POST /metas-ahorro.
const esquemaMetaAhorroInput = z.object({
  nombre: z.string().min(1).max(100),
  montoObjetivo: z.number().positive(), // RF-31
  fechaLimite: z.iso
    .date()
    .nullable()
    .optional()
    // RF-31 — futura en sentido estricto (no basta con "hoy"), comparación
    // por calendario UTC igual que RF-11 en TransaccionController.
    .refine((f) => f === undefined || f === null || f > new Date().toISOString().slice(0, 10), {
      message: "La fecha límite debe ser futura (RF-31).",
    }),
});

const esquemaListadoQuery = z.object({
  estado: z.enum(["activa", "cumplida", "inactiva"]).optional(),
});

/** Solo traduce HTTP <-> caso de uso; sin lógica de negocio (ver skill mifi-arquitectura-solid). */
export class MetaAhorroController {
  constructor(
    private readonly crearMetaAhorroUseCase: CrearMetaAhorroUseCase,
    private readonly listarMetasAhorroUseCase: ListarMetasAhorroUseCase,
    private readonly obtenerMetaAhorroUseCase: ObtenerMetaAhorroUseCase,
    private readonly eliminarMetaAhorroUseCase: EliminarMetaAhorroUseCase,
  ) {}

  crear = async (req: Request, res: Response): Promise<void> => {
    const datos = esquemaMetaAhorroInput.parse(req.body);
    const resultado = await this.crearMetaAhorroUseCase.ejecutar({
      usuarioId: req.usuarioId as string, // ver nota en AuthController
      nombre: datos.nombre,
      montoObjetivo: datos.montoObjetivo,
      fechaLimite: datos.fechaLimite ? new Date(`${datos.fechaLimite}T00:00:00.000Z`) : null,
    });
    res.status(201).json(aRespuestaMetaAhorro(resultado));
  };

  listar = async (req: Request, res: Response): Promise<void> => {
    const query = esquemaListadoQuery.parse(req.query);
    const resultados = await this.listarMetasAhorroUseCase.ejecutar({
      usuarioId: req.usuarioId as string,
      ...(query.estado !== undefined && { estado: query.estado }),
    });
    res.status(200).json(resultados.map(aRespuestaMetaAhorro));
  };

  obtener = async (req: Request, res: Response): Promise<void> => {
    const resultado = await this.obtenerMetaAhorroUseCase.ejecutar({
      metaAhorroId: req.params["id"] as string,
      usuarioId: req.usuarioId as string,
    });
    res.status(200).json(aRespuestaMetaAhorro(resultado));
  };

  eliminar = async (req: Request, res: Response): Promise<void> => {
    const resultado = await this.eliminarMetaAhorroUseCase.ejecutar({
      metaAhorroId: req.params["id"] as string,
      usuarioId: req.usuarioId as string,
    });

    if (resultado.tipo === "eliminada") {
      res.status(204).send();
      return;
    }
    res.status(200).json(aRespuestaMetaAhorro(resultado.meta));
  };
}
