import type { ICategoriaRepository } from "../../dominio/repositorios/ICategoriaRepository";
import type { ITransaccionRepository } from "../../dominio/repositorios/ITransaccionRepository";
import { calcularRangoPeriodo, type Periodo } from "./compartido/calcularRangoPeriodo";

export interface DatosResumenDashboard {
  usuarioId: string;
  periodo?: Periodo;
}

export interface GastoPorCategoria {
  categoriaId: string;
  nombre: string;
  montoTotal: number;
}

export interface ResumenDashboard {
  periodo: Periodo;
  fechaInicio: Date;
  fechaFin: Date;
  ingresosTotal: number;
  egresosTotal: number;
  /** Supuesto no documentado explícitamente en ningún RF: ingresos - egresos
   *  del periodo. Distinto del progreso de una meta de ahorro (AHO-02,
   *  Sprint 3) — acá es superávit general, no vinculado a una meta. */
  ahorroTotal: number;
  gastosPorCategoria: GastoPorCategoria[];
  gastosHormiga: {
    montoTotal: number;
    porcentajeSobreEgresos: number;
  };
}

const PERIODO_DEFECTO: Periodo = "mes";

/**
 * RF-37, RF-39, RF-40, RF-41 — UC-DSH-01. Todo se calcula en tiempo real a
 * partir de las transacciones (detalle de DSH-01: "no se almacenan valores
 * precalculados"), nunca desde un total guardado de antemano.
 */
export class ObtenerResumenDashboardUseCase {
  constructor(
    private readonly transaccionRepository: ITransaccionRepository,
    private readonly categoriaRepository: ICategoriaRepository,
  ) {}

  async ejecutar(datos: DatosResumenDashboard): Promise<ResumenDashboard> {
    const periodo = datos.periodo ?? PERIODO_DEFECTO;
    const { fechaInicio, fechaFin } = calcularRangoPeriodo(periodo);

    const transacciones = await this.transaccionRepository.listarPorPeriodo(
      datos.usuarioId,
      fechaInicio,
      fechaFin,
    );

    let ingresosTotal = 0;
    let egresosTotal = 0;
    let gastosHormigaTotal = 0;
    const montoPorCategoria = new Map<string, number>();

    for (const transaccion of transacciones) {
      if (transaccion.tipo === "ingreso") {
        ingresosTotal += transaccion.monto;
        continue;
      }

      // RF-37 — total por categoría (solo egresos: RF-38 nunca marca ingresos).
      egresosTotal += transaccion.monto;
      montoPorCategoria.set(
        transaccion.categoriaId,
        (montoPorCategoria.get(transaccion.categoriaId) ?? 0) + transaccion.monto,
      );

      // RF-39 — usa la marca AUTOMÁTICA (esGastoHormiga), nunca el criterio
      // del estudiante (esGastoHormigaUsuario): es la que alimenta el
      // indicador de la tesis (D-15).
      if (transaccion.esGastoHormiga) {
        gastosHormigaTotal += transaccion.monto;
      }
    }

    const gastosPorCategoria: GastoPorCategoria[] = [];
    for (const [categoriaId, montoTotal] of montoPorCategoria) {
      // onDelete: Restrict en el schema impide borrar una categoría con
      // transacciones asociadas — buscarPorId no debería fallar acá, pero
      // el fallback evita que un dato corrupto tumbe el dashboard entero.
      const categoria = await this.categoriaRepository.buscarPorId(categoriaId);
      gastosPorCategoria.push({
        categoriaId,
        nombre: categoria?.nombre ?? "Categoría no disponible",
        montoTotal,
      });
    }

    return {
      periodo,
      fechaInicio,
      fechaFin,
      ingresosTotal,
      egresosTotal,
      ahorroTotal: ingresosTotal - egresosTotal,
      gastosPorCategoria,
      gastosHormiga: {
        montoTotal: gastosHormigaTotal,
        porcentajeSobreEgresos: egresosTotal > 0 ? (gastosHormigaTotal / egresosTotal) * 100 : 0,
      },
    };
  }
}
