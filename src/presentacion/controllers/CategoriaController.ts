import type { Request, Response } from "express";
import type { ListarCategoriasUseCase } from "../../aplicacion/casos-uso/ListarCategoriasUseCase";
import { aRespuestaCategoria } from "../mapeadores/categoriaResponse";

/** Solo traduce HTTP <-> caso de uso; sin lógica de negocio (ver skill mifi-arquitectura-solid). */
export class CategoriaController {
  constructor(private readonly listarCategoriasUseCase: ListarCategoriasUseCase) {}

  listar = async (req: Request, res: Response): Promise<void> => {
    const categorias = await this.listarCategoriasUseCase.ejecutar(req.usuarioId as string);
    res.status(200).json(categorias.map(aRespuestaCategoria));
  };
}
