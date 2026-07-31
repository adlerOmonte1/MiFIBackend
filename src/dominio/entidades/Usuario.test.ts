import type { IHashService } from "../servicios/IHashService";
import { Usuario, type UsuarioProps } from "./Usuario";

function crearUsuario(overrides: Partial<UsuarioProps> = {}): Usuario {
  return new Usuario({
    id: "usuario-1",
    nombre: "Ana Torres",
    correo: "ana@unmsm.pe",
    passwordHash: "hash:clave-correcta",
    rol: "estudiante",
    intentosFallidos: 0,
    bloqueadoHasta: null,
    consentimientoAceptado: false,
    fechaConsentimiento: null,
    versionConsentimiento: null,
    fechaRegistro: new Date("2026-01-01"),
    ...overrides,
  });
}

const hashServiceFalso: IHashService = {
  async hashear(passwordPlano) {
    return `hash:${passwordPlano}`;
  },
  async comparar(passwordPlano, hash) {
    return hash === `hash:${passwordPlano}`;
  },
};

describe("Usuario", () => {
  describe("estaBloqueado", () => {
    it("es false si nunca se bloqueó", () => {
      expect(crearUsuario({ bloqueadoHasta: null }).estaBloqueado()).toBe(false);
    });

    it("es true si bloqueadoHasta está en el futuro", () => {
      const usuario = crearUsuario({ bloqueadoHasta: new Date(Date.now() + 60_000) });
      expect(usuario.estaBloqueado()).toBe(true);
    });

    it("es false si bloqueadoHasta ya pasó", () => {
      const usuario = crearUsuario({ bloqueadoHasta: new Date(Date.now() - 60_000) });
      expect(usuario.estaBloqueado()).toBe(false);
    });
  });

  describe("registrarIntentoFallido (RF-07)", () => {
    it("incrementa el contador sin bloquear si no llega al máximo", () => {
      const usuario = crearUsuario();
      usuario.registrarIntentoFallido(5, 60_000);
      expect(usuario.intentosFallidos).toBe(1);
      expect(usuario.estaBloqueado()).toBe(false);
    });

    it("bloquea al llegar al máximo de intentos", () => {
      const usuario = crearUsuario({ intentosFallidos: 4 });
      usuario.registrarIntentoFallido(5, 60_000);
      expect(usuario.intentosFallidos).toBe(5);
      expect(usuario.estaBloqueado()).toBe(true);
    });
  });

  it("registrarInicioSesionExitoso resetea intentos y bloqueo", () => {
    const usuario = crearUsuario({
      intentosFallidos: 5,
      bloqueadoHasta: new Date(Date.now() + 60_000),
    });
    usuario.registrarInicioSesionExitoso();
    expect(usuario.intentosFallidos).toBe(0);
    expect(usuario.bloqueadoHasta).toBeNull();
  });

  it("validarCredenciales delega en el IHashService recibido por parámetro (RF-05)", async () => {
    const usuario = crearUsuario({ passwordHash: "hash:clave-correcta" });
    await expect(usuario.validarCredenciales("clave-correcta", hashServiceFalso)).resolves.toBe(
      true,
    );
    await expect(usuario.validarCredenciales("clave-incorrecta", hashServiceFalso)).resolves.toBe(
      false,
    );
  });

  it("aceptarConsentimiento marca aceptado, fecha y versión (RF-47 a RF-49)", () => {
    const usuario = crearUsuario();
    usuario.aceptarConsentimiento("v1.0");
    expect(usuario.haAceptadoConsentimiento()).toBe(true);
    expect(usuario.versionConsentimiento).toBe("v1.0");
    expect(usuario.fechaConsentimiento).not.toBeNull();
  });
});
