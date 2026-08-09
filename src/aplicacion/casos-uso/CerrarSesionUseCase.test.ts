import { SesionRepositoryFalso } from "../../test-utils/fakes";
import { CerrarSesionUseCase } from "./CerrarSesionUseCase";

describe("CerrarSesionUseCase", () => {
  it("revoca la sesión — un jti revocado deja de ser válido (RF-08)", async () => {
    const sesionRepository = new SesionRepositoryFalso();
    const sesion = await sesionRepository.crear({
      usuarioId: "usuario-1",
      jti: "jti-1",
      fechaExpiracion: new Date(Date.now() + 60_000),
    });
    expect(sesion.esValida()).toBe(true);

    const casoDeUso = new CerrarSesionUseCase(sesionRepository);
    await casoDeUso.ejecutar("jti-1");

    const sesionRevocada = await sesionRepository.buscarPorJti("jti-1");
    expect(sesionRevocada?.esValida()).toBe(false);
  });
});
