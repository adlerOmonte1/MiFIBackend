export interface CategoriaProps {
  id: string;
  usuarioId: string | null;
  nombre: string;
  esPredefinida: boolean;
}

/**
 * Entidad de dominio — reglas puras, sin dependencias de infraestructura.
 * Ver docs/DiagramaClases.md y ADR D-13 (docs/README.md §6).
 */
export class Categoria {
  readonly id: string;
  readonly usuarioId: string | null;
  readonly nombre: string;
  readonly esPredefinida: boolean;

  constructor(props: CategoriaProps) {
    this.id = props.id;
    this.usuarioId = props.usuarioId;
    this.nombre = props.nombre;
    this.esPredefinida = props.esPredefinida;
  }

  /** D-13 — true únicamente si la creó ese estudiante (nunca para las predefinidas, aunque las use todo el mundo). */
  esPropiaDe(usuarioId: string): boolean {
    return this.usuarioId === usuarioId;
  }

  /**
   * RF-36, RF-50 — regla real que valida cada transacción: una categoría
   * predefinida la puede usar cualquiera; una propia, solo su dueño. Ninguna
   * transacción puede clasificarse con la categoría propia de otro usuario.
   */
  puedeSerUsadaPor(usuarioId: string): boolean {
    return this.esPredefinida || this.esPropiaDe(usuarioId);
  }
}
