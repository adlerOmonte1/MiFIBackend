import { UsuarioNoEncontradoError } from "../errores/ErroresAplicacion";
import { UsuarioRepositoryFalso } from "../../test-utils/fakes";
import { ObtenerPerfilUseCase } from "./ObtenerPerfilUseCase";

describe("ObtenerPerfilUseCase", () => {
  it("devuelve el perfil del usuario autenticado", async () => {
    const usuarioRepository = new UsuarioRepositoryFalso();
    const creado = await usuarioRepository.crear({
      nombre: "Ana Torres",
      correo: "ana.torres@unmsm.pe",
      passwordHash: "hash",
      rol: "estudiante",
    });

    const casoDeUso = new ObtenerPerfilUseCase(usuarioRepository);
    const usuario = await casoDeUso.ejecutar(creado.id);

    expect(usuario.correo).toBe("ana.torres@unmsm.pe");
  });

  it("lanza error si el usuario no existe", async () => {
    const usuarioRepository = new UsuarioRepositoryFalso();
    const casoDeUso = new ObtenerPerfilUseCase(usuarioRepository);

    await expect(casoDeUso.ejecutar("no-existe")).rejects.toThrow(UsuarioNoEncontradoError);
  });
});
