import type { Usuario } from "../entidades/Usuario";

export interface DatosNuevoUsuario {
  nombre: string;
  correo: string;
  passwordHash: string;
  rol: string;
}

export interface IUsuarioRepository {
  buscarPorId(id: string): Promise<Usuario | null>;
  buscarPorCorreo(correo: string): Promise<Usuario | null>;
  crear(datos: DatosNuevoUsuario): Promise<Usuario>;
  /** Persiste el estado actual de la entidad (intentos fallidos, bloqueo, consentimiento). */
  actualizar(usuario: Usuario): Promise<void>;
}
