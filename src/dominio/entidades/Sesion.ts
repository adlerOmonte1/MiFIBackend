export interface SesionProps {
  id: string;
  usuarioId: string;
  jti: string;
  fechaCreacion: Date;
  fechaExpiracion: Date;
  revocada: boolean;
}

/**
 * Sesión JWT revocable (D-03). Ver docs/DiagramaClases.md.
 */
export class Sesion {
  readonly id: string;
  readonly usuarioId: string;
  readonly jti: string; // jwt
  readonly fechaCreacion: Date;
  readonly fechaExpiracion: Date;
  revocada: boolean;

  constructor(props: SesionProps) {
    this.id = props.id;
    this.usuarioId = props.usuarioId;
    this.jti = props.jti;
    this.fechaCreacion = props.fechaCreacion;
    this.fechaExpiracion = props.fechaExpiracion;
    this.revocada = props.revocada;
  }

  /** RF-51 — validada en cada petición a un endpoint protegido. */
  esValida(): boolean {
    return !this.revocada && this.fechaExpiracion.getTime() > Date.now();
  }

  /** RF-08 */
  revocar(): void {
    this.revocada = true;
  }
}
