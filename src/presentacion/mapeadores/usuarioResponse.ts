import type { Usuario } from "../../dominio/entidades/Usuario";

/**
 * Mapea la entidad Usuario a la forma que promete el contrato
 * (docs/openapi.yaml -> components.schemas.Usuario).
 *
 * Se arma campo por campo a propósito, en vez de devolver la entidad
 * completa: así `passwordHash` no puede filtrarse en una respuesta por
 * accidente. Vive acá (y no dentro de un controller) para que todos los
 * endpoints que devuelven un usuario respondan exactamente lo mismo.
 */
export function aRespuestaUsuario(usuario: Usuario) {
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
