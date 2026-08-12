import type { EstadoMetaAhorro, MetaAhorro } from "../../../dominio/entidades/MetaAhorro";
import type { ITransaccionRepository } from "../../../dominio/repositorios/ITransaccionRepository";

export interface MetaAhorroConProgreso {
  meta: MetaAhorro;
  montoAhorrado: number;
  porcentajeCumplimiento: number;
  estado: EstadoMetaAhorro;
}

/**
 * RF-33 a RF-35 — junta la meta con su progreso, recalculado siempre en
 * tiempo real a partir de las transacciones vinculadas (modelo de
 * alcancía: egresos vinculados = aportes, ingresos vinculados = retiros).
 * Sin precálculo, mismo criterio que el dashboard (ObtenerResumenDashboardUseCase).
 */
export async function calcularProgresoMeta(
  meta: MetaAhorro,
  transaccionRepository: ITransaccionRepository,
): Promise<MetaAhorroConProgreso> {
  const transacciones = await transaccionRepository.listarPorMeta(meta.id);

  let totalEgresosVinculados = 0;
  let totalIngresosVinculados = 0;
  for (const transaccion of transacciones) {
    if (transaccion.tipo === "egreso") {
      totalEgresosVinculados += transaccion.monto;
    } else {
      totalIngresosVinculados += transaccion.monto;
    }
  }

  const montoAhorrado = meta.calcularMontoAhorrado(totalEgresosVinculados, totalIngresosVinculados);

  return {
    meta,
    montoAhorrado,
    porcentajeCumplimiento: meta.calcularProgreso(montoAhorrado),
    estado: meta.estadoVisible(montoAhorrado),
  };
}
