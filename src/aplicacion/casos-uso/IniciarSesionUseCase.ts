import type { Usuario } from "../../dominio/entidades/Usuario";
import type { ISesionRepository } from "../../dominio/repositorios/ISesionRepository";
import type { IUsuarioRepository } from "../../dominio/repositorios/IUsuarioRepository";
import type { IHashService } from "../../dominio/servicios/IHashService";
import type { ITokenService } from "../../dominio/servicios/ITokenService";
import { CredencialesInvalidasError, CuentaBloqueadaError } from "../errores/ErroresAplicacion";
import { emitirSesion } from "./compartido/emitirSesion";

/** RF-07 */
export const MAX_INTENTOS_FALLIDOS = 5;
export const DURACION_BLOQUEO_MS = 15 * 60 * 1000;

export interface DatosLogin {
  correo: string;
  password: string;
}

export interface ResultadoLogin {
  usuario: Usuario;
  token: string;
}

/** RF-05 a RF-07 — UC-AUT-02. */
export class IniciarSesionUseCase {
  constructor(
    private readonly usuarioRepository: IUsuarioRepository,
    private readonly sesionRepository: ISesionRepository,
    private readonly hashService: IHashService,
    private readonly tokenService: ITokenService,
  ) {}

  async ejecutar(datos: DatosLogin): Promise<ResultadoLogin> {
    const usuario = await this.usuarioRepository.buscarPorCorreo(datos.correo);
    if (!usuario) {
      // AUT-02/CA02: mensaje genérico, no revela cuál dato falló.
      throw new CredencialesInvalidasError();
    }

    if (usuario.estaBloqueado()) {
      throw new CuentaBloqueadaError();
    }

    const passwordValido = await usuario.validarCredenciales(datos.password, this.hashService);
    if (!passwordValido) {
      usuario.registrarIntentoFallido(MAX_INTENTOS_FALLIDOS, DURACION_BLOQUEO_MS);
      await this.usuarioRepository.actualizar(usuario);
      throw new CredencialesInvalidasError();
    }

    usuario.registrarInicioSesionExitoso();
    await this.usuarioRepository.actualizar(usuario);

    const token = await emitirSesion(usuario, {
      sesionRepository: this.sesionRepository,
      tokenService: this.tokenService,
    });

    return { usuario, token };
  }
}
