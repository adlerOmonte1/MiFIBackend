import type { MetaAhorroConProgreso } from "../../aplicacion/casos-uso/compartido/calcularProgresoMeta";

/**
 * Mapea MetaAhorroConProgreso a la forma del contrato
 * (docs/openapi.yaml -> components.schemas.MetaAhorroConProgreso).
 * fechaLimite como YYYY-MM-DD (format: date), mismo criterio que
 * transaccionResponse.ts; null si la meta no tiene fecha límite (D-14).
 */
export function aRespuestaMetaAhorro(resultado: MetaAhorroConProgreso) {
  return {
    id: resultado.meta.id,
    nombre: resultado.meta.nombre,
    montoObjetivo: resultado.meta.montoObjetivo,
    fechaLimite: resultado.meta.fechaLimite?.toISOString().slice(0, 10) ?? null,
    estado: resultado.estado,
    montoAhorrado: resultado.montoAhorrado,
    porcentajeCumplimiento: resultado.porcentajeCumplimiento,
    fechaCreacion: resultado.meta.fechaCreacion,
  };
}
