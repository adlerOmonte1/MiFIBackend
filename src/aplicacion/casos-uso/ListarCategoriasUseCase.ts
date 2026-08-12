import type { Categoria } from "../../dominio/entidades/Categoria";
import type { ICategoriaRepository } from "../../dominio/repositorios/ICategoriaRepository";

/** RF-36, RF-37, CAT-01 — categorías disponibles para el selector del cliente. */
export class ListarCategoriasUseCase {
  constructor(private readonly categoriaRepository: ICategoriaRepository) {}

  async ejecutar(usuarioId: string): Promise<Categoria[]> {
    return this.categoriaRepository.listar(usuarioId);
  }
}
