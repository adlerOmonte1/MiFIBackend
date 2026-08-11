import { TransaccionRepositoryFalso } from "../../test-utils/fakes";
import { RegistrarTransaccionUseCase } from "./RegistrarTransaccionUseCase";

const UMBRAL = 15;

function crearCasoDeUso() {
  const transaccionRepository = new TransaccionRepositoryFalso();
  const casoDeUso = new RegistrarTransaccionUseCase(transaccionRepository, UMBRAL);
  return { casoDeUso, transaccionRepository };
}

describe("RegistrarTransaccionUseCase (RF-09 a RF-11, RF-38)", () => {
  it("registra un egreso y lo marca como gasto hormiga si no supera el umbral", async () => {
    const { casoDeUso } = crearCasoDeUso();

    const transaccion = await casoDeUso.ejecutar({
      usuarioId: "usuario-1",
      categoriaId: "categoria-1",
      monto: 8,
      tipo: "egreso",
      fecha: new Date("2026-08-01"),
    });

    expect(transaccion.esGastoHormiga).toBe(true);
    expect(transaccion.umbralHormigaAplicado).toBe(UMBRAL);
  });

  it("registra un egreso que no es hormiga, pero igual guarda el umbral evaluado (D-08)", async () => {
    const { casoDeUso } = crearCasoDeUso();

    const transaccion = await casoDeUso.ejecutar({
      usuarioId: "usuario-1",
      categoriaId: "categoria-1",
      monto: 100,
      tipo: "egreso",
      fecha: new Date("2026-08-01"),
    });

    expect(transaccion.esGastoHormiga).toBe(false);
    expect(transaccion.umbralHormigaAplicado).toBe(UMBRAL);
  });

  it("nunca marca un ingreso como gasto hormiga, sin importar el monto", async () => {
    const { casoDeUso } = crearCasoDeUso();

    const transaccion = await casoDeUso.ejecutar({
      usuarioId: "usuario-1",
      categoriaId: "categoria-1",
      monto: 5,
      tipo: "ingreso",
      fecha: new Date("2026-08-01"),
    });

    expect(transaccion.esGastoHormiga).toBe(false);
    expect(transaccion.umbralHormigaAplicado).toBeNull();
  });

  it("el origen siempre es 'manual' y metaAhorroId siempre null (Sprint 3 todavía no existe)", async () => {
    const { casoDeUso } = crearCasoDeUso();

    const transaccion = await casoDeUso.ejecutar({
      usuarioId: "usuario-1",
      categoriaId: "categoria-1",
      monto: 20,
      tipo: "egreso",
      fecha: new Date("2026-08-01"),
    });

    expect(transaccion.origen).toBe("manual");
    expect(transaccion.metaAhorroId).toBeNull();
  });

  it("nunca opina por el estudiante: esGastoHormigaUsuario nace en null (RF-55, D-15)", async () => {
    const { casoDeUso } = crearCasoDeUso();

    const transaccion = await casoDeUso.ejecutar({
      usuarioId: "usuario-1",
      categoriaId: "categoria-1",
      monto: 8,
      tipo: "egreso",
      fecha: new Date("2026-08-01"),
    });

    expect(transaccion.esGastoHormigaUsuario).toBeNull();
  });

  it("persiste la transacción con el usuarioId recibido (queda disponible para listar después)", async () => {
    const { casoDeUso, transaccionRepository } = crearCasoDeUso();

    const creada = await casoDeUso.ejecutar({
      usuarioId: "usuario-1",
      categoriaId: "categoria-1",
      monto: 8,
      tipo: "egreso",
      fecha: new Date("2026-08-01"),
    });

    const encontrada = await transaccionRepository.buscarPorId(creada.id);
    expect(encontrada?.usuarioId).toBe("usuario-1");
  });
});
