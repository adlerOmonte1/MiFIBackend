import type { Usuario } from "../../dominio/entidades/Usuario";
import type { IUsuarioRepository } from "../../dominio/repositorios/IUsuarioRepository";
import {
  ConsentimientoYaAceptadoError,
  UsuarioNoEncontradoError,
} from "../errores/ErroresAplicacion";

export interface DatosAceptarConsentimiento {
  usuarioId: string;
  versionTexto: string;
}

/** RF-47 a RF-49 — UC-CON-01. */
export class AceptarConsentimientoUseCase {
  constructor(private readonly usuarioRepository: IUsuarioRepository) {}

  async ejecutar(datos: DatosAceptarConsentimiento): Promise<Usuario> {
    const usuario = await this.usuarioRepository.buscarPorId(datos.usuarioId);
    if (!usuario) {
      throw new UsuarioNoEncontradoError();
    }
    if (usuario.haAceptadoConsentimiento()) {
      throw new ConsentimientoYaAceptadoError();
    }

    usuario.aceptarConsentimiento(datos.versionTexto);
    await this.usuarioRepository.actualizar(usuario);

    return usuario;
  }
}
