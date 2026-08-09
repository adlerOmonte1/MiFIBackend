import type { Usuario } from "../../dominio/entidades/Usuario";
import type { ISesionRepository } from "../../dominio/repositorios/ISesionRepository";
import type { IUsuarioRepository } from "../../dominio/repositorios/IUsuarioRepository";
import type { IHashService } from "../../dominio/servicios/IHashService";
import type { ITokenService } from "../../dominio/servicios/ITokenService";
import { CorreoYaRegistradoError } from "../errores/ErroresAplicacion";
import { emitirSesion } from "./compartido/emitirSesion";

export interface DatosRegistro {
  nombre: string;
  correo: string;
  password: string;
}

export interface ResultadoRegistro {
  usuario: Usuario;
  token: string;
}

/** RF-01 a RF-04, RF-06 — UC-AUT-01. */
export class RegistrarUsuarioUseCase {
  constructor(
    private readonly usuarioRepository: IUsuarioRepository,
    private readonly sesionRepository: ISesionRepository,
    private readonly hashService: IHashService,
    private readonly tokenService: ITokenService,
  ) {}

  async ejecutar(datos: DatosRegistro): Promise<ResultadoRegistro> {
    const existente = await this.usuarioRepository.buscarPorCorreo(datos.correo);
    if (existente) {
      throw new CorreoYaRegistradoError(); // RF-02
    }

    const passwordHash = await this.hashService.hashear(datos.password); // RF-04, D-02

    // El autorregistro (AUT-01) solo crea cuentas de estudiante; el rol
    // "investigador" se provisiona fuera de este flujo.
    const usuario = await this.usuarioRepository.crear({
      nombre: datos.nombre,
      correo: datos.correo,
      passwordHash,
      rol: "estudiante",
    });

    const token = await emitirSesion(usuario, {
      sesionRepository: this.sesionRepository,
      tokenService: this.tokenService,
    });

    return { usuario, token };
  }
}
