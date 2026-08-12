import type { Categoria } from "../entidades/Categoria";

/**
 * Mínima a propósito: solo lo que necesita validar que una transacción use
 * una categoría permitida (RF-36, RF-50) y listar las disponibles para que
 * el cliente arme el selector (RF-36, CAT-01, GET /categorias). La gestión
 * de categorías propias (crear/renombrar/eliminar, RF-53/RF-54) agrega más
 * métodos cuando se implemente esa funcionalidad — no antes.
 */
export interface ICategoriaRepository {
  buscarPorId(id: string): Promise<Categoria | null>;
  /** Predefinidas (globales) + propias del usuario — nunca las propias de otro. */
  listar(usuarioId: string): Promise<Categoria[]>;
}
