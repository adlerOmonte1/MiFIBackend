import { TransaccionRepositoryFalso } from "../../test-utils/fakes";
import { TransaccionNoEncontradaError } from "../errores/ErroresAplicacion";
import { ObtenerTransaccionUseCase } from "./ObtenerTransaccionUseCase";

describe("ObtenerTransaccionUseCase", () => {
  it("devuelve la transacción cuando pertenece al usuario", async () => {
    const transaccionRepository = new TransaccionRepositoryFalso();
    const creada = await transaccionRepository.crear({
      usuarioId: "usuario-a",
      categoriaId: "cat-1",
      metaAhorroId: null,
      monto: 10,
      tipo: "egreso",
      fecha: new Date("2026-08-01"),
      origen: "manual",
      esGastoHormiga: false,
      umbralHormigaAplicado: null,
      imagenUrl: null,
    });

    const casoDeUso = new ObtenerTransaccionUseCase(transaccionRepository);
    const transaccion = await casoDeUso.ejecutar({
      transaccionId: creada.id,
      usuarioId: "usuario-a",
    });

    expect(transaccion.id).toBe(creada.id);
  });

  it("lanza TransaccionNoEncontradaError si no existe", async () => {
    const transaccionRepository = new TransaccionRepositoryFalso();
    const casoDeUso = new ObtenerTransaccionUseCase(transaccionRepository);

    await expect(
      casoDeUso.ejecutar({ transaccionId: "no-existe", usuarioId: "usuario-a" }),
    ).rejects.toThrow(TransaccionNoEncontradaError);
  });

  it("lanza TransaccionNoEncontradaError si es de otro usuario (RF-50, D-05)", async () => {
    const transaccionRepository = new TransaccionRepositoryFalso();
    const creada = await transaccionRepository.crear({
      usuarioId: "usuario-a",
      categoriaId: "cat-1",
      metaAhorroId: null,
      monto: 10,
      tipo: "egreso",
      fecha: new Date("2026-08-01"),
      origen: "manual",
      esGastoHormiga: false,
      umbralHormigaAplicado: null,
      imagenUrl: null,
    });

    const casoDeUso = new ObtenerTransaccionUseCase(transaccionRepository);

    await expect(
      casoDeUso.ejecutar({ transaccionId: creada.id, usuarioId: "usuario-b" }),
    ).rejects.toThrow(TransaccionNoEncontradaError);
  });
});
