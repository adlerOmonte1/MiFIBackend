import { TransaccionNoEncontradaError } from "../errores/ErroresAplicacion";
import { Categoria } from "../../dominio/entidades/Categoria";
import {
  CategoriaRepositoryFalso,
  MetaAhorroRepositoryFalso,
  TransaccionRepositoryFalso,
} from "../../test-utils/fakes";
import { EliminarTransaccionUseCase } from "./EliminarTransaccionUseCase";
import { RegistrarTransaccionUseCase } from "./RegistrarTransaccionUseCase";

async function crearEscenario() {
  const transaccionRepository = new TransaccionRepositoryFalso();
  const categoriaRepository = new CategoriaRepositoryFalso();
  const metaAhorroRepository = new MetaAhorroRepositoryFalso();
  categoriaRepository.agregar(
    new Categoria({ id: "comida", usuarioId: null, nombre: "Comida", esPredefinida: true }),
  );
  const registrar = new RegistrarTransaccionUseCase(
    transaccionRepository,
    categoriaRepository,
    metaAhorroRepository,
    15,
  );
  const eliminar = new EliminarTransaccionUseCase(transaccionRepository);

  const transaccion = await registrar.ejecutar({
    usuarioId: "usuario-1",
    categoriaId: "comida",
    monto: 8,
    tipo: "egreso",
    fecha: new Date(),
  });

  return { eliminar, transaccionRepository, transaccion };
}

describe("EliminarTransaccionUseCase (RF-14, RF-15)", () => {
  it("elimina la transacción del dueño", async () => {
    const { eliminar, transaccionRepository, transaccion } = await crearEscenario();

    await eliminar.ejecutar({ transaccionId: transaccion.id, usuarioId: "usuario-1" });

    expect(await transaccionRepository.buscarPorId(transaccion.id)).toBeNull();
  });

  it("rechaza eliminar una transacción que no existe (RF-50, D-05)", async () => {
    const { eliminar } = await crearEscenario();

    await expect(
      eliminar.ejecutar({ transaccionId: "no-existe", usuarioId: "usuario-1" }),
    ).rejects.toThrow(TransaccionNoEncontradaError);
  });

  it("rechaza eliminar la transacción de OTRO usuario, y no la borra (anti-IDOR)", async () => {
    const { eliminar, transaccionRepository, transaccion } = await crearEscenario();

    await expect(
      eliminar.ejecutar({ transaccionId: transaccion.id, usuarioId: "usuario-atacante" }),
    ).rejects.toThrow(TransaccionNoEncontradaError);

    // La transacción real de usuario-1 debe seguir intacta.
    expect(await transaccionRepository.buscarPorId(transaccion.id)).not.toBeNull();
  });
});
