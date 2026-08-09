import type { Usuario as FilaUsuario } from "../../generated/prisma/client";
import { Usuario } from "../../dominio/entidades/Usuario";
import type {
  DatosNuevoUsuario,
  IUsuarioRepository,
} from "../../dominio/repositorios/IUsuarioRepository";
import { prisma } from "../prismaClient";

function aDominio(fila: FilaUsuario): Usuario {
  return new Usuario({
    id: fila.id,
    nombre: fila.nombre,
    correo: fila.correo,
    passwordHash: fila.passwordHash,
    rol: fila.rol,
    intentosFallidos: fila.intentosFallidos,
    bloqueadoHasta: fila.bloqueadoHasta,
    consentimientoAceptado: fila.consentimientoAceptado,
    fechaConsentimiento: fila.fechaConsentimiento,
    versionConsentimiento: fila.versionConsentimiento,
    fechaRegistro: fila.fechaRegistro,
  });
}

export class PrismaUsuarioRepository implements IUsuarioRepository {
  async buscarPorId(id: string): Promise<Usuario | null> {
    const fila = await prisma.usuario.findUnique({ where: { id } });
    return fila ? aDominio(fila) : null;
  }

  async buscarPorCorreo(correo: string): Promise<Usuario | null> {
    const fila = await prisma.usuario.findUnique({ where: { correo } });
    return fila ? aDominio(fila) : null;
  }

  async crear(datos: DatosNuevoUsuario): Promise<Usuario> {
    const fila = await prisma.usuario.create({
      data: {
        nombre: datos.nombre,
        correo: datos.correo,
        passwordHash: datos.passwordHash,
        rol: datos.rol,
      },
    });
    return aDominio(fila);
  }

  async actualizar(usuario: Usuario): Promise<void> {
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        intentosFallidos: usuario.intentosFallidos,
        bloqueadoHasta: usuario.bloqueadoHasta,
        consentimientoAceptado: usuario.consentimientoAceptado,
        fechaConsentimiento: usuario.fechaConsentimiento,
        versionConsentimiento: usuario.versionConsentimiento,
      },
    });
  }
}
