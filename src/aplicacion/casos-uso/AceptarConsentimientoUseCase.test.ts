import {
  ConsentimientoYaAceptadoError,
  UsuarioNoEncontradoError,
} from "../errores/ErroresAplicacion";
import { UsuarioRepositoryFalso } from "../../test-utils/fakes";
import { AceptarConsentimientoUseCase } from "./AceptarConsentimientoUseCase";

describe("AceptarConsentimientoUseCase", () => {
  it("registra la aceptación con fecha y versión del texto (RF-47, RF-48)", async () => {
    const usuarioRepository = new UsuarioRepositoryFalso();
    const usuarioCreado = await usuarioRepository.crear({
      nombre: "Ana Torres",
      correo: "ana.torres@unmsm.pe",
      passwordHash: "hash",
      rol: "estudiante",
    });

    const casoDeUso = new AceptarConsentimientoUseCase(usuarioRepository);
    const usuario = await casoDeUso.ejecutar({
      usuarioId: usuarioCreado.id,
      versionTexto: "v1.0",
    });

    expect(usuario.consentimientoAceptado).toBe(true);
    expect(usuario.versionConsentimiento).toBe("v1.0");
    expect(usuario.fechaConsentimiento).not.toBeNull();
  });

  it("rechaza una segunda aceptación (RF-44, mismo patrón de unicidad)", async () => {
    const usuarioRepository = new UsuarioRepositoryFalso();
    const usuarioCreado = await usuarioRepository.crear({
      nombre: "Ana Torres",
      correo: "ana.torres@unmsm.pe",
      passwordHash: "hash",
      rol: "estudiante",
    });
    const casoDeUso = new AceptarConsentimientoUseCase(usuarioRepository);
    await casoDeUso.ejecutar({ usuarioId: usuarioCreado.id, versionTexto: "v1.0" });

    await expect(
      casoDeUso.ejecutar({ usuarioId: usuarioCreado.id, versionTexto: "v1.0" }),
    ).rejects.toThrow(ConsentimientoYaAceptadoError);
  });

  it("responde 'no encontrado' si el usuario no existe (D-05)", async () => {
    const usuarioRepository = new UsuarioRepositoryFalso();
    const casoDeUso = new AceptarConsentimientoUseCase(usuarioRepository);

    await expect(
      casoDeUso.ejecutar({ usuarioId: "no-existe", versionTexto: "v1.0" }),
    ).rejects.toThrow(UsuarioNoEncontradoError);
  });
});
