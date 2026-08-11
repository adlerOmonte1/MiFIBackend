import type { TipoTransaccion } from "../../dominio/entidades/Transaccion";
import type {
  ITransaccionRepository,
  ResultadoListaTransacciones,
} from "../../dominio/repositorios/ITransaccionRepository";
import { calcularRangoPeriodo, type Periodo } from "./compartido/calcularRangoPeriodo";

export interface DatosListadoTransacciones {
  usuarioId: string;
  periodo?: Periodo;
  tipo?: TipoTransaccion;
  categoriaId?: string;
  pagina?: number;
  tamanoPagina?: number;
}

const PERIODO_DEFECTO: Periodo = "mes"; // RF-41
const PAGINA_DEFECTO = 1;
const TAMANO_PAGINA_DEFECTO = 20;

/**
 * RF-09 — UC-TRX-01. Es la fuente directa del indicador de tesis
 * "N.º de registros por semana": todo lo que este caso de uso devuelve es
 * exactamente lo que se cuenta para ese dato.
 */
export class ListarTransaccionesUseCase {
  constructor(private readonly transaccionRepository: ITransaccionRepository) {}

  async ejecutar(datos: DatosListadoTransacciones): Promise<ResultadoListaTransacciones> {
    const { fechaInicio, fechaFin } = calcularRangoPeriodo(datos.periodo ?? PERIODO_DEFECTO);

    return this.transaccionRepository.listar({
      usuarioId: datos.usuarioId,
      fechaInicio,
      fechaFin,
      pagina: datos.pagina ?? PAGINA_DEFECTO,
      tamanoPagina: datos.tamanoPagina ?? TAMANO_PAGINA_DEFECTO,
      ...(datos.tipo !== undefined && { tipo: datos.tipo }),
      ...(datos.categoriaId !== undefined && { categoriaId: datos.categoriaId }),
    });
  }
}
