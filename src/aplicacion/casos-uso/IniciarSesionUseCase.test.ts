import { CredencialesInvalidasError, CuentaBloqueadaError } from "../errores/ErroresAplicacion";
import {
  HashServiceFalso,
  SesionRepositoryFalso,
  TokenServiceFalso,
  UsuarioRepositoryFalso,
} from "../../test-utils/fakes";
import { IniciarSesionUseCase, MAX_INTENTOS_FALLIDOS } from "./IniciarSesionUseCase";

const CORREO = "ana.torres@unmsm.pe";
const PASSWORD = "clave-segura-123";

async function crearCasoDeUso() {
  const usuarioRepository = new UsuarioRepositoryFalso();
  const sesionRepository = new SesionRepositoryFalso();
  const hashService = new HashServiceFalso();
  const tokenService = new TokenServiceFalso();

  await usuarioRepository.crear({
    nombre: "Ana Torres",
    correo: CORREO,
    passwordHash: await hashService.hashear(PASSWORD),
    rol: "estudiante",
  });

  const casoDeUso = new IniciarSesionUseCase(
    usuarioRepository,
    sesionRepository,
    hashService,
    tokenService,
  );
  return { casoDeUso, usuarioRepository };
}

describe("IniciarSesionUseCase", () => {
  it("autentica con credenciales correctas y emite una sesión (RF-05, RF-06)", async () => {
    const { casoDeUso } = await crearCasoDeUso();

    const resultado = await casoDeUso.ejecutar({ correo: CORREO, password: PASSWORD });

    expect(resultado.usuario.correo).toBe(CORREO);
    expect(resultado.token).toBeTruthy();
  });

  it("rechaza un correo inexistente con mensaje genérico (AUT-02/CA02)", async () => {
    const { casoDeUso } = await crearCasoDeUso();

    await expect(
      casoDeUso.ejecutar({ correo: "nadie@unmsm.pe", password: PASSWORD }),
    ).rejects.toThrow(CredencialesInvalidasError);
  });

  it("rechaza una contraseña incorrecta e incrementa el contador de intentos (RF-07)", async () => {
    const { casoDeUso, usuarioRepository } = await crearCasoDeUso();

    await expect(casoDeUso.ejecutar({ correo: CORREO, password: "incorrecta" })).rejects.toThrow(
      CredencialesInvalidasError,
    );

    const usuario = await usuarioRepository.buscarPorCorreo(CORREO);
    expect(usuario?.intentosFallidos).toBe(1);
  });

  it("bloquea la cuenta tras 5 intentos fallidos, incluso con la contraseña correcta después (RF-07, D-04)", async () => {
    const { casoDeUso } = await crearCasoDeUso();

    for (let i = 0; i < MAX_INTENTOS_FALLIDOS; i++) {
      await expect(casoDeUso.ejecutar({ correo: CORREO, password: "incorrecta" })).rejects.toThrow(
        CredencialesInvalidasError,
      );
    }

    await expect(casoDeUso.ejecutar({ correo: CORREO, password: PASSWORD })).rejects.toThrow(
      CuentaBloqueadaError,
    );
  });

  it("resetea el contador de intentos fallidos tras un login exitoso", async () => {
    const { casoDeUso, usuarioRepository } = await crearCasoDeUso();

    await expect(casoDeUso.ejecutar({ correo: CORREO, password: "incorrecta" })).rejects.toThrow(
      CredencialesInvalidasError,
    );

    await casoDeUso.ejecutar({ correo: CORREO, password: PASSWORD });

    const usuario = await usuarioRepository.buscarPorCorreo(CORREO);
    expect(usuario?.intentosFallidos).toBe(0);
  });
});
