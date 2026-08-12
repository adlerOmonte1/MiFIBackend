import type { Transaccion } from "../../dominio/entidades/Transaccion";

/**
 * Mapea la entidad Transaccion a la forma del contrato
 * (docs/openapi.yaml -> components.schemas.Transaccion).
 *
 * `fecha` se sirve como YYYY-MM-DD (format: date del contrato, no
 * date-time): la entidad la guarda en UTC medianoche (ver decisión sobre
 * fechas en docs/ESTADO_PROYECTO.md §6), así que recortar el ISO string
 * evita el corrimiento de día que daría leerla con métodos locales.
 */
export function aRespuestaTransaccion(transaccion: Transaccion) {
  return {
    id: transaccion.id,
    monto: transaccion.monto,
    tipo: transaccion.tipo,
    categoriaId: transaccion.categoriaId,
    metaAhorroId: transaccion.metaAhorroId,
    fecha: transaccion.fecha.toISOString().slice(0, 10),
    esGastoHormigaUsuario: transaccion.esGastoHormigaUsuario,
    origen: transaccion.origen,
    esGastoHormiga: transaccion.esGastoHormiga,
    umbralHormigaAplicado: transaccion.umbralHormigaAplicado,
    imagenUrl: transaccion.imagenUrl,
    fechaCreacion: transaccion.fechaCreacion,
  };
}
