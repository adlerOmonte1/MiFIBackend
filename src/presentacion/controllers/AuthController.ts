import type { Request, Response } from "express";
import { z } from "zod";
import type { CerrarSesionUseCase } from "../../aplicacion/casos-uso/CerrarSesionUseCase";
import type { IniciarSesionUseCase } from "../../aplicacion/casos-uso/IniciarSesionUseCase";
import type { ObtenerPerfilUseCase } from "../../aplicacion/casos-uso/ObtenerPerfilUseCase";
import type { RegistrarUsuarioUseCase } from "../../aplicacion/casos-uso/RegistrarUsuarioUseCase";
import type { Usuario } from "../../dominio/entidades/Usuario";

// RF-01 a RF-03: forma del request, según docs/openapi.yaml (/auth/registro, /auth/login).
const esquemaRegistro = z.object({
  nombre: z.string().min(1).max(150),
  correo: z.string().email().max(150),
  password: z.string().min(8), // RF-03
});

const esquemaLogin = z.object({
  correo: z.string().email(),
  password: z.string().min(1),
});

/** Nunca se devuelve passwordHash al cliente. */
function aRespuestaUsuario(usuario: Usuario) {
  return {
    id: usuario.id,
    nombre: usuario.nombre,
    correo: usuario.correo,
    rol: usuario.rol,
    consentimientoAceptado: usuario.consentimientoAceptado,
    fechaConsentimiento: usuario.fechaConsentimiento,
    versionConsentimiento: usuario.versionConsentimiento,
    fechaRegistro: usuario.fechaRegistro,
  };
}

/** Solo traduce HTTP <-> caso de uso; sin lógica de negocio (ver skill mifi-arquitectura-solid). */
export class AuthController {
  constructor(
    private readonly registrarUsuarioUseCase: RegistrarUsuarioUseCase,
    private readonly iniciarSesionUseCase: IniciarSesionUseCase,
    private readonly cerrarSesionUseCase: CerrarSesionUseCase,
    private readonly obtenerPerfilUseCase: ObtenerPerfilUseCase,
  ) {}

  registro = async (req: Request, res: Response): Promise<void> => {
    const datos = esquemaRegistro.parse(req.body);
    const { usuario, token } = await this.registrarUsuarioUseCase.ejecutar(datos);
    res.status(201).json({ token, usuario: aRespuestaUsuario(usuario) });
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const datos = esquemaLogin.parse(req.body);
    const { usuario, token } = await this.iniciarSesionUseCase.ejecutar(datos);
    res.status(200).json({ token, usuario: aRespuestaUsuario(usuario) });
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    // authMiddleware siempre corre antes en la ruta protegida y ya validó
    // el jti; llega garantizado.
    await this.cerrarSesionUseCase.ejecutar(req.jti as string);
    res.status(204).send();
  };

  me = async (req: Request, res: Response): Promise<void> => {
    const usuario = await this.obtenerPerfilUseCase.ejecutar(req.usuarioId as string);
    res.status(200).json(aRespuestaUsuario(usuario));
  };
}
