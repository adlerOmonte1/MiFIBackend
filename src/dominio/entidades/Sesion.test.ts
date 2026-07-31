import { Sesion, type SesionProps } from "./Sesion";

function crearSesion(overrides: Partial<SesionProps> = {}): Sesion {
  return new Sesion({
    id: "sesion-1",
    usuarioId: "usuario-1",
    jti: "jti-1",
    fechaCreacion: new Date(),
    fechaExpiracion: new Date(Date.now() + 60_000),
    revocada: false,
    ...overrides,
  });
}

describe("Sesion", () => {
  it("esValida es true recién creada, no revocada y no expirada (RF-51)", () => {
    expect(crearSesion().esValida()).toBe(true);
  });

  it("esValida es false si ya expiró", () => {
    const sesion = crearSesion({ fechaExpiracion: new Date(Date.now() - 1000) });
    expect(sesion.esValida()).toBe(false);
  });

  it("revocar() hace que esValida pase a false (RF-08)", () => {
    const sesion = crearSesion();
    sesion.revocar();
    expect(sesion.revocada).toBe(true);
    expect(sesion.esValida()).toBe(false);
  });
});
