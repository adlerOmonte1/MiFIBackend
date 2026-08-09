import { randomUUID } from "node:crypto";
import { Sesion } from "../dominio/entidades/Sesion";
import { Usuario } from "../dominio/entidades/Usuario";
import type {
  DatosNuevaSesion,
  ISesionRepository,
} from "../dominio/repositorios/ISesionRepository";
import type {
  DatosNuevoUsuario,
  IUsuarioRepository,
} from "../dominio/repositorios/IUsuarioRepository";
import type { IHashService } from "../dominio/servicios/IHashService";
import type { ITokenService, PayloadToken } from "../dominio/servicios/ITokenService";

/**
 * Fakes en memoria para probar casos de uso sin base de datos ni librerías
 * reales (bcrypt/jsonwebtoken) — es la razón de ser de la Inversión de
 * Dependencias (ver skill mifi-arquitectura-solid). Solo para pruebas.
 */

export class UsuarioRepositoryFalso implements IUsuarioRepository {
  private readonly usuarios = new Map<string, Usuario>();

  async buscarPorId(id: string): Promise<Usuario | null> {
    return this.usuarios.get(id) ?? null;
  }

  async buscarPorCorreo(correo: string): Promise<Usuario | null> {
    for (const usuario of this.usuarios.values()) {
      if (usuario.correo === correo) return usuario;
    }
    return null;
  }

  async crear(datos: DatosNuevoUsuario): Promise<Usuario> {
    const usuario = new Usuario({
      id: randomUUID(),
      nombre: datos.nombre,
      correo: datos.correo,
      passwordHash: datos.passwordHash,
      rol: datos.rol,
      intentosFallidos: 0,
      bloqueadoHasta: null,
      consentimientoAceptado: false,
      fechaConsentimiento: null,
      versionConsentimiento: null,
      fechaRegistro: new Date(),
    });
    this.usuarios.set(usuario.id, usuario);
    return usuario;
  }

  async actualizar(usuario: Usuario): Promise<void> {
    this.usuarios.set(usuario.id, usuario);
  }
}

export class SesionRepositoryFalso implements ISesionRepository {
  private readonly sesiones = new Map<string, Sesion>();

  async crear(datos: DatosNuevaSesion): Promise<Sesion> {
    const sesion = new Sesion({
      id: randomUUID(),
      usuarioId: datos.usuarioId,
      jti: datos.jti,
      fechaCreacion: new Date(),
      fechaExpiracion: datos.fechaExpiracion,
      revocada: false,
    });
    this.sesiones.set(sesion.jti, sesion);
    return sesion;
  }

  async buscarPorJti(jti: string): Promise<Sesion | null> {
    return this.sesiones.get(jti) ?? null;
  }

  async revocarPorJti(jti: string): Promise<void> {
    this.sesiones.get(jti)?.revocar();
  }
}

export class HashServiceFalso implements IHashService {
  async hashear(passwordPlano: string): Promise<string> {
    return `hash:${passwordPlano}`;
  }

  async comparar(passwordPlano: string, hash: string): Promise<boolean> {
    return hash === `hash:${passwordPlano}`;
  }
}

export class TokenServiceFalso implements ITokenService {
  generar(payload: PayloadToken): string {
    return `token:${payload.usuarioId}:${payload.jti}`;
  }

  verificar(token: string): PayloadToken | null {
    const [prefijo, usuarioId, jti] = token.split(":");
    if (prefijo !== "token" || !usuarioId || !jti) return null;
    return { usuarioId, jti };
  }
}
