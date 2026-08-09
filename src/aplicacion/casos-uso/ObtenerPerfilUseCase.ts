import type { Usuario } from "../../dominio/entidades/Usuario";
import type { IUsuarioRepository } from "../../dominio/repositorios/IUsuarioRepository";
import { UsuarioNoEncontradoError } from "../errores/ErroresAplicacion";

/** GET /usuarios/me */
export class ObtenerPerfilUseCase {
  constructor(private readonly usuarioRepository: IUsuarioRepository) {}

  async ejecutar(usuarioId: string): Promise<Usuario> {
    const usuario = await this.usuarioRepository.buscarPorId(usuarioId);
    if (!usuario) {
      throw new UsuarioNoEncontradoError();
    }
    return usuario;
  }
}
