import type { Request, Response } from "express";
import { z } from "zod";
import type { EditarTransaccionUseCase } from "../../aplicacion/casos-uso/EditarTransaccionUseCase";
import type { EliminarTransaccionUseCase } from "../../aplicacion/casos-uso/EliminarTransaccionUseCase";
import type { ListarTransaccionesUseCase } from "../../aplicacion/casos-uso/ListarTransaccionesUseCase";
import type { ObtenerTransaccionUseCase } from "../../aplicacion/casos-uso/ObtenerTransaccionUseCase";
import type { RegistrarTransaccionUseCase } from "../../aplicacion/casos-uso/RegistrarTransaccionUseCase";
import { aRespuestaTransaccion } from "../mapeadores/transaccionResponse";

// docs/openapi.yaml -> TransaccionInput.
const esquemaTransaccionInput = z.object({
  monto: z.number().positive(), // RF-10
  tipo: z.enum(["ingreso", "egreso"]),
  categoriaId: z.string().uuid(),
  metaAhorroId: z.string().uuid().nullable().optional(), // RF-33
  // RF-11 — comparación por calendario UTC (ver convención de fechas del proyecto), no por hora exacta.
  fecha: z.iso.date().refine((f) => f <= new Date().toISOString().slice(0, 10), {
    message: "La fecha no puede ser futura (RF-11).",
  }),
  esGastoHormigaUsuario: z.boolean().nullable().optional(), // RF-55, D-15
});

const esquemaListadoQuery = z.object({
  periodo: z.enum(["semana", "mes"]).optional(), // RF-41
  tipo: z.enum(["ingreso", "egreso"]).optional(),
  categoriaId: z.string().uuid().optional(),
  pagina: z.coerce.number().int().min(1).optional(),
  tamanoPagina: z.coerce.number().int().min(1).max(100).optional(),
});

/** Solo traduce HTTP <-> caso de uso; sin lógica de negocio (ver skill mifi-arquitectura-solid). */
export class TransaccionController {
  constructor(
    private readonly registrarTransaccionUseCase: RegistrarTransaccionUseCase,
    private readonly listarTransaccionesUseCase: ListarTransaccionesUseCase,
    private readonly obtenerTransaccionUseCase: ObtenerTransaccionUseCase,
    private readonly editarTransaccionUseCase: EditarTransaccionUseCase,
    private readonly eliminarTransaccionUseCase: EliminarTransaccionUseCase,
  ) {}

  crear = async (req: Request, res: Response): Promise<void> => {
    const datos = esquemaTransaccionInput.parse(req.body);
    const transaccion = await this.registrarTransaccionUseCase.ejecutar({
      usuarioId: req.usuarioId as string, // ver nota en AuthController
      categoriaId: datos.categoriaId,
      monto: datos.monto,
      tipo: datos.tipo,
      fecha: new Date(`${datos.fecha}T00:00:00.000Z`),
      // exactOptionalPropertyTypes: omitido = no mandar la clave (el caso de uso trata undefined como null).
      ...(datos.metaAhorroId !== undefined && { metaAhorroId: datos.metaAhorroId }),
    });
    res.status(201).json(aRespuestaTransaccion(transaccion));
  };

  listar = async (req: Request, res: Response): Promise<void> => {
    const query = esquemaListadoQuery.parse(req.query);
    const resultado = await this.listarTransaccionesUseCase.ejecutar({
      usuarioId: req.usuarioId as string,
      ...(query.periodo !== undefined && { periodo: query.periodo }),
      ...(query.tipo !== undefined && { tipo: query.tipo }),
      ...(query.categoriaId !== undefined && { categoriaId: query.categoriaId }),
      ...(query.pagina !== undefined && { pagina: query.pagina }),
      ...(query.tamanoPagina !== undefined && { tamanoPagina: query.tamanoPagina }),
    });
    res.status(200).json({
      datos: resultado.datos.map(aRespuestaTransaccion),
      total: resultado.total,
    });
  };

  obtener = async (req: Request, res: Response): Promise<void> => {
    const transaccion = await this.obtenerTransaccionUseCase.ejecutar({
      transaccionId: req.params["id"] as string,
      usuarioId: req.usuarioId as string,
    });
    res.status(200).json(aRespuestaTransaccion(transaccion));
  };

  editar = async (req: Request, res: Response): Promise<void> => {
    const datos = esquemaTransaccionInput.parse(req.body);
    const transaccion = await this.editarTransaccionUseCase.ejecutar({
      transaccionId: req.params["id"] as string,
      usuarioId: req.usuarioId as string,
      categoriaId: datos.categoriaId,
      monto: datos.monto,
      tipo: datos.tipo,
      fecha: new Date(`${datos.fecha}T00:00:00.000Z`),
      // Reemplazo completo: omitido = sin meta (desvincula), igual que categoriaId/monto/etc.
      ...(datos.metaAhorroId !== undefined && { metaAhorroId: datos.metaAhorroId }),
      // undefined = no tocar (ver DatosEdicionTransaccion); no enviar la
      // clave en vez de mandarla en undefined, exactOptionalPropertyTypes.
      ...(datos.esGastoHormigaUsuario !== undefined && {
        esGastoHormigaUsuario: datos.esGastoHormigaUsuario,
      }),
    });
    res.status(200).json(aRespuestaTransaccion(transaccion));
  };

  eliminar = async (req: Request, res: Response): Promise<void> => {
    await this.eliminarTransaccionUseCase.ejecutar({
      transaccionId: req.params["id"] as string,
      usuarioId: req.usuarioId as string,
    });
    res.status(204).send();
  };
}
