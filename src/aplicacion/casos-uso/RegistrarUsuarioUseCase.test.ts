import { CorreoYaRegistradoError } from "../errores/ErroresAplicacion";
import {
  HashServiceFalso,
  SesionRepositoryFalso,
  TokenServiceFalso,
  UsuarioRepositoryFalso,
} from "../../test-utils/fakes";
import { RegistrarUsuarioUseCase } from "./RegistrarUsuarioUseCase";

function crearCasoDeUso() {
  const usuarioRepository = new UsuarioRepositoryFalso();
  const sesionRepository = new SesionRepositoryFalso();
  const hashService = new HashServiceFalso();
  const tokenService = new TokenServiceFalso();
  const casoDeUso = new RegistrarUsuarioUseCase(
    usuarioRepository,
    sesionRepository,
    hashService,
    tokenService,
  );
  return { casoDeUso, usuarioRepository, sesionRepository };
}

describe("RegistrarUsuarioUseCase", () => {
  it("registra un usuario nuevo y emite una sesión (RF-01, RF-06)", async () => {
    const { casoDeUso } = crearCasoDeUso();

    const resultado = await casoDeUso.ejecutar({
      nombre: "Ana Torres",
      correo: "ana.torres@unmsm.pe",
      password: "clave-segura-123",
    });

    expect(resultado.usuario.correo).toBe("ana.torres@unmsm.pe");
    expect(resultado.usuario.rol).toBe("estudiante");
    expect(resultado.token).toContain(resultado.usuario.id);
  });

  it("nunca almacena la contraseña en texto plano (RF-04, D-02)", async () => {
    const { casoDeUso } = crearCasoDeUso();

    const { usuario } = await casoDeUso.ejecutar({
      nombre: "Ana Torres",
      correo: "ana.torres@unmsm.pe",
      password: "clave-segura-123",
    });

    expect(usuario.passwordHash).not.toBe("clave-segura-123");
  });

  it("rechaza el registro si el correo ya existe (RF-02)", async () => {
    const { casoDeUso } = crearCasoDeUso();
    const datos = {
      nombre: "Ana Torres",
      correo: "ana.torres@unmsm.pe",
      password: "clave-segura-123",
    };

    await casoDeUso.ejecutar(datos);

    await expect(casoDeUso.ejecutar(datos)).rejects.toThrow(CorreoYaRegistradoError);
  });
});
