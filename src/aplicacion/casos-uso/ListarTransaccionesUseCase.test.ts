import { Categoria } from "../../dominio/entidades/Categoria";
import { CategoriaRepositoryFalso, TransaccionRepositoryFalso } from "../../test-utils/fakes";
import { ListarTransaccionesUseCase } from "./ListarTransaccionesUseCase";
import { RegistrarTransaccionUseCase } from "./RegistrarTransaccionUseCase";

const UMBRAL = 15;

async function crearEscenario() {
  const transaccionRepository = new TransaccionRepositoryFalso();
  const categoriaRepository = new CategoriaRepositoryFalso();
  categoriaRepository.agregar(
    new Categoria({ id: "comida", usuarioId: null, nombre: "Comida", esPredefinida: true }),
  );
  categoriaRepository.agregar(
    new Categoria({ id: "transporte", usuarioId: null, nombre: "Transporte", esPredefinida: true }),
  );
  const registrar = new RegistrarTransaccionUseCase(
    transaccionRepository,
    categoriaRepository,
    UMBRAL,
  );
  const listar = new ListarTransaccionesUseCase(transaccionRepository);

  return { listar, registrar };
}

describe("ListarTransaccionesUseCase (RF-09, RF-41)", () => {
  it("solo devuelve transacciones del usuario que pide el listado (RF-50, D-05)", async () => {
    const { listar, registrar } = await crearEscenario();
    await registrar.ejecutar({
      usuarioId: "usuario-1",
      categoriaId: "comida",
      monto: 8,
      tipo: "egreso",
      fecha: new Date(),
    });
    await registrar.ejecutar({
      usuarioId: "usuario-2",
      categoriaId: "comida",
      monto: 8,
      tipo: "egreso",
      fecha: new Date(),
    });

    const resultado = await listar.ejecutar({ usuarioId: "usuario-1" });

    expect(resultado.total).toBe(1);
    expect(resultado.datos[0]?.usuarioId).toBe("usuario-1");
  });

  it("filtra por tipo cuando se pide", async () => {
    const { listar, registrar } = await crearEscenario();
    await registrar.ejecutar({
      usuarioId: "usuario-1",
      categoriaId: "comida",
      monto: 8,
      tipo: "egreso",
      fecha: new Date(),
    });
    await registrar.ejecutar({
      usuarioId: "usuario-1",
      categoriaId: "comida",
      monto: 500,
      tipo: "ingreso",
      fecha: new Date(),
    });

    const resultado = await listar.ejecutar({ usuarioId: "usuario-1", tipo: "ingreso" });

    expect(resultado.total).toBe(1);
    expect(resultado.datos[0]?.tipo).toBe("ingreso");
  });

  it("filtra por categoría cuando se pide", async () => {
    const { listar, registrar } = await crearEscenario();
    await registrar.ejecutar({
      usuarioId: "usuario-1",
      categoriaId: "comida",
      monto: 8,
      tipo: "egreso",
      fecha: new Date(),
    });
    await registrar.ejecutar({
      usuarioId: "usuario-1",
      categoriaId: "transporte",
      monto: 3,
      tipo: "egreso",
      fecha: new Date(),
    });

    const resultado = await listar.ejecutar({ usuarioId: "usuario-1", categoriaId: "transporte" });

    expect(resultado.total).toBe(1);
    expect(resultado.datos[0]?.categoriaId).toBe("transporte");
  });

  it("excluye transacciones fuera del periodo por defecto (mes actual)", async () => {
    const { listar, registrar } = await crearEscenario();
    await registrar.ejecutar({
      usuarioId: "usuario-1",
      categoriaId: "comida",
      monto: 8,
      tipo: "egreso",
      fecha: new Date(), // hoy, dentro del mes actual
    });
    const haceUnAño = new Date();
    haceUnAño.setFullYear(haceUnAño.getFullYear() - 1);
    await registrar.ejecutar({
      usuarioId: "usuario-1",
      categoriaId: "comida",
      monto: 8,
      tipo: "egreso",
      fecha: haceUnAño,
    });

    const resultado = await listar.ejecutar({ usuarioId: "usuario-1" });

    expect(resultado.total).toBe(1);
  });

  it("pagina los resultados con los valores por defecto (pagina 1, 20 por página)", async () => {
    const { listar, registrar } = await crearEscenario();
    for (let i = 0; i < 3; i++) {
      await registrar.ejecutar({
        usuarioId: "usuario-1",
        categoriaId: "comida",
        monto: 8,
        tipo: "egreso",
        fecha: new Date(),
      });
    }

    const resultado = await listar.ejecutar({ usuarioId: "usuario-1" });

    expect(resultado.total).toBe(3);
    expect(resultado.datos).toHaveLength(3);
  });

  it("respeta un tamaño de página menor al total, informando el total real", async () => {
    const { listar, registrar } = await crearEscenario();
    for (let i = 0; i < 5; i++) {
      await registrar.ejecutar({
        usuarioId: "usuario-1",
        categoriaId: "comida",
        monto: 8,
        tipo: "egreso",
        fecha: new Date(),
      });
    }

    const resultado = await listar.ejecutar({ usuarioId: "usuario-1", tamanoPagina: 2 });

    expect(resultado.datos).toHaveLength(2);
    expect(resultado.total).toBe(5);
  });
});
