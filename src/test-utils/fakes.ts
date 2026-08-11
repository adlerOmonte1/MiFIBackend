import { randomUUID } from "node:crypto";
import { Categoria } from "../dominio/entidades/Categoria";
import { Sesion } from "../dominio/entidades/Sesion";
import { Transaccion } from "../dominio/entidades/Transaccion";
import { Usuario } from "../dominio/entidades/Usuario";
import type { ICategoriaRepository } from "../dominio/repositorios/ICategoriaRepository";
import type {
  DatosNuevaSesion,
  ISesionRepository,
} from "../dominio/repositorios/ISesionRepository";
import type {
  DatosNuevaTransaccion,
  FiltrosTransacciones,
  ITransaccionRepository,
  ResultadoListaTransacciones,
} from "../dominio/repositorios/ITransaccionRepository";
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

export class TransaccionRepositoryFalso implements ITransaccionRepository {
  private readonly transacciones = new Map<string, Transaccion>();

  async buscarPorId(id: string): Promise<Transaccion | null> {
    return this.transacciones.get(id) ?? null;
  }

  async listar(filtros: FiltrosTransacciones): Promise<ResultadoListaTransacciones> {
    let resultado = [...this.transacciones.values()].filter(
      (t) => t.usuarioId === filtros.usuarioId,
    );
    if (filtros.tipo) resultado = resultado.filter((t) => t.tipo === filtros.tipo);
    if (filtros.categoriaId) {
      resultado = resultado.filter((t) => t.categoriaId === filtros.categoriaId);
    }
    if (filtros.fechaInicio) {
      const desde = filtros.fechaInicio;
      resultado = resultado.filter((t) => t.fecha.getTime() >= desde.getTime());
    }
    if (filtros.fechaFin) {
      const hasta = filtros.fechaFin;
      resultado = resultado.filter((t) => t.fecha.getTime() <= hasta.getTime());
    }
    resultado.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());

    const total = resultado.length;
    const inicio = (filtros.pagina - 1) * filtros.tamanoPagina;
    const datos = resultado.slice(inicio, inicio + filtros.tamanoPagina);

    return { datos, total };
  }

  async crear(datos: DatosNuevaTransaccion): Promise<Transaccion> {
    const transaccion = new Transaccion({
      id: randomUUID(),
      usuarioId: datos.usuarioId,
      categoriaId: datos.categoriaId,
      metaAhorroId: datos.metaAhorroId,
      monto: datos.monto,
      tipo: datos.tipo,
      fecha: datos.fecha,
      origen: datos.origen,
      esGastoHormiga: datos.esGastoHormiga,
      esGastoHormigaUsuario: null,
      umbralHormigaAplicado: datos.umbralHormigaAplicado,
      imagenUrl: datos.imagenUrl,
      fechaCreacion: new Date(),
    });
    this.transacciones.set(transaccion.id, transaccion);
    return transaccion;
  }

  async actualizar(transaccion: Transaccion): Promise<void> {
    this.transacciones.set(transaccion.id, transaccion);
  }

  async eliminar(id: string): Promise<void> {
    this.transacciones.delete(id);
  }
}

export class CategoriaRepositoryFalso implements ICategoriaRepository {
  private readonly categorias = new Map<string, Categoria>();

  async buscarPorId(id: string): Promise<Categoria | null> {
    return this.categorias.get(id) ?? null;
  }

  /** Fuera del contrato de ICategoriaRepository — solo para armar el escenario en las pruebas. */
  agregar(categoria: Categoria): void {
    this.categorias.set(categoria.id, categoria);
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
