import type { Categoria } from "../../dominio/entidades/Categoria";

/**
 * Mapea la entidad Categoria a la forma del contrato
 * (docs/openapi.yaml -> components.schemas.Categoria). No expone
 * `usuarioId`: el cliente no necesita saber de quién es cada categoría
 * propia, solo cuáles puede usar.
 */
export function aRespuestaCategoria(categoria: Categoria) {
  return {
    id: categoria.id,
    nombre: categoria.nombre,
    esPredefinida: categoria.esPredefinida,
  };
}
