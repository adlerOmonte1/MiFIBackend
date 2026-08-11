import type { Categoria } from "../entidades/Categoria";

/**
 * Mínima a propósito: solo lo que necesita validar que una transacción use
 * una categoría permitida (RF-36, RF-50). La gestión de categorías propias
 * (crear/renombrar/eliminar, RF-53/RF-54) agrega más métodos cuando se
 * implemente esa funcionalidad — no antes.
 */
export interface ICategoriaRepository {
  buscarPorId(id: string): Promise<Categoria | null>;
}
