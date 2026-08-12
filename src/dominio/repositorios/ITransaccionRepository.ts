import type { OrigenTransaccion, TipoTransaccion, Transaccion } from "../entidades/Transaccion";

/**
 * Datos para crear una transacción. `esGastoHormiga` y
 * `umbralHormigaAplicado` llegan ya decididos por el caso de uso (que usa
 * `Transaccion.marcarComoGastoHormiga()`, RF-38/D-08) — el repositorio solo
 * persiste, no decide reglas de negocio.
 */
export interface DatosNuevaTransaccion {
  usuarioId: string;
  categoriaId: string;
  metaAhorroId: string | null;
  monto: number;
  tipo: TipoTransaccion;
  fecha: Date;
  origen: OrigenTransaccion;
  esGastoHormiga: boolean;
  umbralHormigaAplicado: number | null;
  imagenUrl: string | null;
}

/**
 * Filtros de listado (GET /transacciones, docs/openapi.yaml). El rango de
 * fechas ya viene resuelto desde "semana"/"mes" — interpretar el periodo es
 * responsabilidad del caso de uso, no del repositorio.
 */
export interface FiltrosTransacciones {
  usuarioId: string;
  fechaInicio?: Date;
  fechaFin?: Date;
  tipo?: TipoTransaccion;
  categoriaId?: string;
  pagina: number;
  tamanoPagina: number;
}

export interface ResultadoListaTransacciones {
  datos: Transaccion[];
  total: number;
}

export interface ITransaccionRepository {
  /** Sin filtrar por dueño: el anti-IDOR lo aplica el caso de uso con Transaccion.perteneceA() (RF-50, D-05). */
  buscarPorId(id: string): Promise<Transaccion | null>;
  listar(filtros: FiltrosTransacciones): Promise<ResultadoListaTransacciones>;
  crear(datos: DatosNuevaTransaccion): Promise<Transaccion>;
  /** Persiste el estado actual de la entidad (monto, categoría, fecha, ambas marcas de hormiga). */
  actualizar(transaccion: Transaccion): Promise<void>;
  eliminar(id: string): Promise<void>;
  /**
   * RF-40, RF-41 — todas las transacciones del periodo, SIN paginar: el
   * dashboard necesita sumarlas todas, no mostrarlas de a páginas. Aceptable
   * en memoria por RNF-03 (hasta 1000 transacciones/usuario, ≤3s).
   */
  listarPorPeriodo(usuarioId: string, fechaInicio: Date, fechaFin: Date): Promise<Transaccion[]>;
  /**
   * RF-33, RF-35 — todas las transacciones vinculadas a una meta de ahorro
   * (ambos tipos), SIN paginar: el caso de uso las clasifica por tipo para
   * calcular MetaAhorro.calcularMontoAhorrado() (modelo de alcancía).
   */
  listarPorMeta(metaAhorroId: string): Promise<Transaccion[]>;
}
