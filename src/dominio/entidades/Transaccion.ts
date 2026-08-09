export type TipoTransaccion = "ingreso" | "egreso";
export type OrigenTransaccion = "manual" | "ocr" | "gmail";

export interface TransaccionProps {
  id: string;
  usuarioId: string;
  categoriaId: string;
  metaAhorroId: string | null;
  /**
   * Monto en soles. Se modela como number (no Decimal de Prisma) para que el
   * dominio no dependa de infraestructura; la precisión de 2 decimales la
   * garantiza la columna DECIMAL(10,2) y las sumas del dashboard se hacen en
   * SQL, no acumulando en JavaScript.
   */
  monto: number;
  tipo: TipoTransaccion;
  fecha: Date;
  origen: OrigenTransaccion;
  esGastoHormiga: boolean;
  esGastoHormigaUsuario: boolean | null;
  umbralHormigaAplicado: number | null;
  imagenUrl: string | null;
  fechaCreacion: Date;
}

/**
 * Entidad de dominio — reglas puras, sin dependencias de infraestructura.
 * Ver docs/DiagramaClases.md y ADR D-08/D-15 (docs/README.md §6).
 */
export class Transaccion {
  readonly id: string;
  readonly usuarioId: string;
  categoriaId: string;
  metaAhorroId: string | null;
  monto: number;
  readonly tipo: TipoTransaccion;
  fecha: Date;
  readonly origen: OrigenTransaccion;
  /** RF-38 — marca automática por umbral. Solo la modifica marcarComoGastoHormiga(). */
  esGastoHormiga: boolean;
  /** RF-55, D-15 — criterio del estudiante. null = todavía no opinó. */
  esGastoHormigaUsuario: boolean | null;
  umbralHormigaAplicado: number | null;
  readonly imagenUrl: string | null;
  readonly fechaCreacion: Date;

  constructor(props: TransaccionProps) {
    this.id = props.id;
    this.usuarioId = props.usuarioId;
    this.categoriaId = props.categoriaId;
    this.metaAhorroId = props.metaAhorroId;
    this.monto = props.monto;
    this.tipo = props.tipo;
    this.fecha = props.fecha;
    this.origen = props.origen;
    this.esGastoHormiga = props.esGastoHormiga;
    this.esGastoHormigaUsuario = props.esGastoHormigaUsuario;
    this.umbralHormigaAplicado = props.umbralHormigaAplicado;
    this.imagenUrl = props.imagenUrl;
    this.fechaCreacion = props.fechaCreacion;
  }

  esEgreso(): boolean {
    return this.tipo === "egreso";
  }

  /** RF-50, D-05 — la propiedad se verifica en el dominio, no solo en la consulta SQL. */
  perteneceA(usuarioId: string): boolean {
    return this.usuarioId === usuarioId;
  }

  /**
   * RF-38, D-08 — evalúa el egreso contra el umbral vigente y guarda el
   * snapshot del valor usado, para que la marca sea reproducible aunque el
   * umbral cambie entre estudios.
   *
   * No aplica a ingresos: para ellos no hace nada (guarda de RF-38, "la regla
   * aplica únicamente a transacciones de tipo egreso"), así el llamador no
   * necesita preguntar el tipo antes de invocarla.
   */
  marcarComoGastoHormiga(umbral: number): void {
    if (!this.esEgreso()) return;

    this.esGastoHormiga = this.monto <= umbral;
    this.umbralHormigaAplicado = umbral;
  }

  /**
   * RF-55, D-15 — registra el criterio propio del estudiante. Deliberadamente
   * NO toca esGastoHormiga: la marca automática es la que alimenta el
   * indicador de la tesis y debe permanecer inmutable para que O₁ y O₂ sean
   * comparables. Pasar null vuelve al estado "sin opinión".
   */
  indicarCriterioUsuario(esHormigaSegunUsuario: boolean | null): void {
    if (!this.esEgreso()) return;

    this.esGastoHormigaUsuario = esHormigaSegunUsuario;
  }

  /**
   * D-15 — true cuando el estudiante opinó y su criterio difiere de la marca
   * automática. Es el dato que permite observar cómo evoluciona su percepción
   * de qué es un gasto innecesario a lo largo del estudio.
   */
  difiereDelCriterioAutomatico(): boolean {
    if (this.esGastoHormigaUsuario === null) return false;
    return this.esGastoHormigaUsuario !== this.esGastoHormiga;
  }
}
