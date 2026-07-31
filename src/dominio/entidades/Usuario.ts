import type { IHashService } from "../servicios/IHashService";

export interface UsuarioProps {
  // objeto plano, sin db
  id: string;
  nombre: string;
  correo: string;
  passwordHash: string;
  rol: string;
  intentosFallidos: number;
  bloqueadoHasta: Date | null;
  consentimientoAceptado: boolean;
  fechaConsentimiento: Date | null;
  versionConsentimiento: string | null;
  fechaRegistro: Date;
}

/**
 * Entidad de dominio — reglas puras, sin dependencias de infraestructura.
 * Ver docs/DiagramaClases.md y ADR D-01/D-02/D-04/D-05 (docs/README.md §6).
 */
export class Usuario {
  readonly id: string;
  readonly nombre: string;
  readonly correo: string;
  readonly passwordHash: string;
  readonly rol: string;
  intentosFallidos: number;
  bloqueadoHasta: Date | null;
  consentimientoAceptado: boolean;
  fechaConsentimiento: Date | null;
  versionConsentimiento: string | null;
  readonly fechaRegistro: Date;

  constructor(props: UsuarioProps) {
    this.id = props.id;
    this.nombre = props.nombre;
    this.correo = props.correo;
    this.passwordHash = props.passwordHash;
    this.rol = props.rol;
    this.intentosFallidos = props.intentosFallidos;
    this.bloqueadoHasta = props.bloqueadoHasta;
    this.consentimientoAceptado = props.consentimientoAceptado;
    this.fechaConsentimiento = props.fechaConsentimiento;
    this.versionConsentimiento = props.versionConsentimiento;
    this.fechaRegistro = props.fechaRegistro;
  }

  /** RF-07 */
  estaBloqueado(): boolean {
    return this.bloqueadoHasta !== null && this.bloqueadoHasta.getTime() > Date.now();
  }

  /** RF-49 */
  haAceptadoConsentimiento(): boolean {
    return this.consentimientoAceptado;
  }

  /**
   * RF-05. Recibe IHashService por parámetro (no lo importa) para que la
   * entidad siga sin depender de infraestructura — el algoritmo concreto
   * (bcrypt, D-02) vive en infraestructura/servicios.
   */
  validarCredenciales(passwordPlano: string, hashService: IHashService): Promise<boolean> {
    return hashService.comparar(passwordPlano, this.passwordHash);
  }

  /** RF-07 — la política (umbral, duración del bloqueo) la decide el caso de uso, no la entidad. */
  registrarIntentoFallido(maxIntentos: number, duracionBloqueoMs: number): void {
    this.intentosFallidos += 1;
    if (this.intentosFallidos >= maxIntentos) {
      this.bloqueadoHasta = new Date(Date.now() + duracionBloqueoMs);
    }
  }
  // cuando registra, los intentos se pasa a 0
  registrarInicioSesionExitoso(): void {
    this.intentosFallidos = 0;
    this.bloqueadoHasta = null;
  }

  /** RF-47..RF-49 */
  aceptarConsentimiento(versionTexto: string): void {
    this.consentimientoAceptado = true;
    this.fechaConsentimiento = new Date();
    this.versionConsentimiento = versionTexto;
  }
}
