import type { MetaAhorro } from "../entidades/MetaAhorro";

/** RF-30, RF-31, RF-32, AHO-01. */
export interface DatosNuevaMetaAhorro {
  usuarioId: string;
  nombre: string;
  montoObjetivo: number;
  fechaLimite: Date | null;
}

export interface IMetaAhorroRepository {
  /** Sin filtrar por dueño: el anti-IDOR lo aplica el caso de uso con MetaAhorro.perteneceA() (RF-50, D-05). */
  buscarPorId(id: string): Promise<MetaAhorro | null>;
  /**
   * Todas las metas del usuario (activa + inactiva), sin filtrar por
   * estado: "cumplida" es un estado calculado en tiempo real
   * (MetaAhorro.estadoVisible()), nunca una columna que se pueda filtrar
   * en la consulta — el filtro por estado del contrato (GET /metas-ahorro)
   * lo aplica el caso de uso sobre el valor ya calculado.
   */
  listar(usuarioId: string): Promise<MetaAhorro[]>;
  crear(datos: DatosNuevaMetaAhorro): Promise<MetaAhorro>;
  /** RF-32/AHO-01 — "eliminar" una meta con transacciones vinculadas la marca inactiva en vez de borrarla. */
  marcarInactiva(id: string): Promise<MetaAhorro>;
  eliminar(id: string): Promise<void>;
}
