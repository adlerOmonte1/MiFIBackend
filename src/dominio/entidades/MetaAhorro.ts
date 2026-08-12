export type EstadoMetaAhorro = "activa" | "cumplida" | "inactiva";

export interface MetaAhorroProps {
  id: string;
  usuarioId: string;
  nombre: string;
  montoObjetivo: number;
  /** Opcional (D-14) — null = sin fecha límite. */
  fechaLimite: Date | null;
  /**
   * Solo "activa"/"inactiva" los escribe el backend (creación y
   * eliminación con transacciones vinculadas, RF-32/AHO-01). "cumplida" es
   * un estado calculado en tiempo real por estadoVisible(), nunca
   * persistido — mismo criterio que el resto de Sprint 2 (dashboard,
   * gasto hormiga): sin precálculo.
   */
  estado: EstadoMetaAhorro;
  fechaCreacion: Date;
}

/**
 * Entidad de dominio — reglas puras, sin dependencias de infraestructura.
 * Ver docs/DiagramaClases.md y ADR D-14 (docs/README.md §6).
 */
export class MetaAhorro {
  readonly id: string;
  readonly usuarioId: string;
  nombre: string;
  montoObjetivo: number;
  fechaLimite: Date | null;
  estado: EstadoMetaAhorro;
  readonly fechaCreacion: Date;

  constructor(props: MetaAhorroProps) {
    this.id = props.id;
    this.usuarioId = props.usuarioId;
    this.nombre = props.nombre;
    this.montoObjetivo = props.montoObjetivo;
    this.fechaLimite = props.fechaLimite;
    this.estado = props.estado;
    this.fechaCreacion = props.fechaCreacion;
  }

  /** RF-50, D-05 — la propiedad se verifica en el dominio, no solo en la consulta SQL. */
  perteneceA(usuarioId: string): boolean {
    return this.usuarioId === usuarioId;
  }

  /** D-14 — true si el estudiante definió fecha límite; una meta sin ella participa igual del cálculo de progreso (AHO-01). */
  tieneFechaLimite(): boolean {
    return this.fechaLimite !== null;
  }

  /**
   * RF-33, UC-AHO-02 — saldo neto "metido" en la meta: la suma de los
   * egresos vinculados a ella (aportes, como meter plata a una alcancía)
   * menos los ingresos vinculados (retiros, plata que vuelve al fondo
   * general). Nunca negativo: un retiro que superara lo aportado no debería
   * pasar en el flujo normal, pero si pasa no se muestra un saldo negativo
   * (supuesto explícito, ningún RF lo cubre).
   */
  calcularMontoAhorrado(totalEgresosVinculados: number, totalIngresosVinculados: number): number {
    return Math.max(0, totalEgresosVinculados - totalIngresosVinculados);
  }

  /** RF-33, RF-34 — porcentaje de cumplimiento, nunca por encima de 100% (AHO-02/FA1). */
  calcularProgreso(montoAhorrado: number): number {
    if (this.montoObjetivo <= 0) return 0;
    return Math.min(100, (montoAhorrado / this.montoObjetivo) * 100);
  }

  private estaCumplida(montoAhorrado: number): boolean {
    return montoAhorrado >= this.montoObjetivo;
  }

  /**
   * Estado a mostrar al cliente: "inactiva" es definitivo (RF-32/AHO-01,
   * ya no admite aportes); si no, "cumplida" cuando el saldo alcanzó el
   * objetivo, si no "activa". No muta `estado` — es una proyección, no
   * persiste nada (ver nota en MetaAhorroProps.estado).
   */
  estadoVisible(montoAhorrado: number): EstadoMetaAhorro {
    if (this.estado === "inactiva") return "inactiva";
    return this.estaCumplida(montoAhorrado) ? "cumplida" : "activa";
  }
}
