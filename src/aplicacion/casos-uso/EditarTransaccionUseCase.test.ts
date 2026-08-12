import {
  CategoriaNoEncontradaError,
  MetaAhorroInactivaError,
  MetaAhorroNoEncontradaError,
  TransaccionNoEncontradaError,
} from "../errores/ErroresAplicacion";
import { Categoria } from "../../dominio/entidades/Categoria";
import { MetaAhorro } from "../../dominio/entidades/MetaAhorro";
import {
  CategoriaRepositoryFalso,
  MetaAhorroRepositoryFalso,
  TransaccionRepositoryFalso,
} from "../../test-utils/fakes";
import { EditarTransaccionUseCase } from "./EditarTransaccionUseCase";
import { RegistrarTransaccionUseCase } from "./RegistrarTransaccionUseCase";

const UMBRAL = 15;

async function crearEscenario() {
  const transaccionRepository = new TransaccionRepositoryFalso();
  const categoriaRepository = new CategoriaRepositoryFalso();
  const metaAhorroRepository = new MetaAhorroRepositoryFalso();
  categoriaRepository.agregar(
    new Categoria({ id: "comida", usuarioId: null, nombre: "Comida", esPredefinida: true }),
  );
  categoriaRepository.agregar(
    new Categoria({ id: "transporte", usuarioId: null, nombre: "Transporte", esPredefinida: true }),
  );
  const registrar = new RegistrarTransaccionUseCase(
    transaccionRepository,
    categoriaRepository,
    metaAhorroRepository,
    UMBRAL,
  );
  const editar = new EditarTransaccionUseCase(
    transaccionRepository,
    categoriaRepository,
    metaAhorroRepository,
    UMBRAL,
  );

  const transaccion = await registrar.ejecutar({
    usuarioId: "usuario-1",
    categoriaId: "comida",
    monto: 8,
    tipo: "egreso",
    fecha: new Date("2026-08-01"),
  });

  return {
    editar,
    registrar,
    transaccionRepository,
    categoriaRepository,
    metaAhorroRepository,
    transaccion,
  };
}

describe("EditarTransaccionUseCase (RF-13, RF-15)", () => {
  it("edita monto, categoría y fecha correctamente", async () => {
    const { editar, transaccion } = await crearEscenario();

    const editada = await editar.ejecutar({
      transaccionId: transaccion.id,
      usuarioId: "usuario-1",
      categoriaId: "transporte",
      monto: 3,
      tipo: "egreso",
      fecha: new Date("2026-08-05"),
    });

    expect(editada.categoriaId).toBe("transporte");
    expect(editada.monto).toBe(3);
    expect(editada.fecha).toEqual(new Date("2026-08-05"));
  });

  it("rechaza editar una transacción que no existe (RF-50, D-05)", async () => {
    const { editar } = await crearEscenario();

    await expect(
      editar.ejecutar({
        transaccionId: "no-existe",
        usuarioId: "usuario-1",
        categoriaId: "comida",
        monto: 8,
        tipo: "egreso",
        fecha: new Date(),
      }),
    ).rejects.toThrow(TransaccionNoEncontradaError);
  });

  it("rechaza editar la transacción de OTRO usuario, mismo error que si no existiera (anti-IDOR)", async () => {
    const { editar, transaccion } = await crearEscenario();

    await expect(
      editar.ejecutar({
        transaccionId: transaccion.id,
        usuarioId: "usuario-atacante",
        categoriaId: "comida",
        monto: 8,
        tipo: "egreso",
        fecha: new Date(),
      }),
    ).rejects.toThrow(TransaccionNoEncontradaError);
  });

  it("rechaza cambiar a una categoría que no le pertenece", async () => {
    const { editar, transaccion, categoriaRepository } = await crearEscenario();
    categoriaRepository.agregar(
      new Categoria({
        id: "categoria-de-otro",
        usuarioId: "usuario-2",
        nombre: "Secreta",
        esPredefinida: false,
      }),
    );

    await expect(
      editar.ejecutar({
        transaccionId: transaccion.id,
        usuarioId: "usuario-1",
        categoriaId: "categoria-de-otro",
        monto: 8,
        tipo: "egreso",
        fecha: new Date(),
      }),
    ).rejects.toThrow(CategoriaNoEncontradaError);
  });

  it("recalcula la marca de gasto hormiga si el monto cambia (RF-38)", async () => {
    const { editar, transaccion } = await crearEscenario();
    expect(transaccion.esGastoHormiga).toBe(true); // creada con monto 8, <= 15

    const editada = await editar.ejecutar({
      transaccionId: transaccion.id,
      usuarioId: "usuario-1",
      categoriaId: "comida",
      monto: 100,
      tipo: "egreso",
      fecha: transaccion.fecha,
    });

    expect(editada.esGastoHormiga).toBe(false);
  });

  it("borra la marca de gasto hormiga si el tipo cambia de egreso a ingreso por error del usuario (RF-13, RF-38)", async () => {
    const { editar, transaccion } = await crearEscenario();
    expect(transaccion.esGastoHormiga).toBe(true);

    const editada = await editar.ejecutar({
      transaccionId: transaccion.id,
      usuarioId: "usuario-1",
      categoriaId: "comida",
      monto: 8,
      tipo: "ingreso", // el usuario se dio cuenta de que lo puso al revés
      fecha: transaccion.fecha,
    });

    expect(editada.tipo).toBe("ingreso");
    expect(editada.esGastoHormiga).toBe(false);
    expect(editada.umbralHormigaAplicado).toBeNull();
  });

  it("registra el criterio del estudiante cuando se envía (RF-55)", async () => {
    const { editar, transaccion } = await crearEscenario();

    const editada = await editar.ejecutar({
      transaccionId: transaccion.id,
      usuarioId: "usuario-1",
      categoriaId: "comida",
      monto: 8,
      tipo: "egreso",
      fecha: transaccion.fecha,
      esGastoHormigaUsuario: false,
    });

    expect(editada.esGastoHormigaUsuario).toBe(false);
  });

  it("no toca el criterio del estudiante si no se envía en la edición", async () => {
    const { editar, transaccion } = await crearEscenario();
    await editar.ejecutar({
      transaccionId: transaccion.id,
      usuarioId: "usuario-1",
      categoriaId: "comida",
      monto: 8,
      tipo: "egreso",
      fecha: transaccion.fecha,
      esGastoHormigaUsuario: true,
    });

    const editada = await editar.ejecutar({
      transaccionId: transaccion.id,
      usuarioId: "usuario-1",
      categoriaId: "transporte",
      monto: 8,
      tipo: "egreso",
      fecha: transaccion.fecha,
      // sin esGastoHormigaUsuario esta vez
    });

    expect(editada.esGastoHormigaUsuario).toBe(true); // se conserva
  });

  it("permite volver el criterio a 'sin opinión' enviando null explícito", async () => {
    const { editar, transaccion } = await crearEscenario();
    await editar.ejecutar({
      transaccionId: transaccion.id,
      usuarioId: "usuario-1",
      categoriaId: "comida",
      monto: 8,
      tipo: "egreso",
      fecha: transaccion.fecha,
      esGastoHormigaUsuario: true,
    });

    const editada = await editar.ejecutar({
      transaccionId: transaccion.id,
      usuarioId: "usuario-1",
      categoriaId: "comida",
      monto: 8,
      tipo: "egreso",
      fecha: transaccion.fecha,
      esGastoHormigaUsuario: null,
    });

    expect(editada.esGastoHormigaUsuario).toBeNull();
  });

  describe("vinculación con meta de ahorro (RF-33, RF-50)", () => {
    it("vincula la transacción a una meta propia", async () => {
      const { editar, transaccion, metaAhorroRepository } = await crearEscenario();
      metaAhorroRepository.agregar(
        new MetaAhorro({
          id: "meta-1",
          usuarioId: "usuario-1",
          nombre: "Celular",
          montoObjetivo: 2000,
          fechaLimite: null,
          estado: "activa",
          fechaCreacion: new Date("2026-01-01"),
        }),
      );

      const editada = await editar.ejecutar({
        transaccionId: transaccion.id,
        usuarioId: "usuario-1",
        categoriaId: "comida",
        metaAhorroId: "meta-1",
        monto: 8,
        tipo: "egreso",
        fecha: transaccion.fecha,
      });

      expect(editada.metaAhorroId).toBe("meta-1");
    });

    it("desvincula la meta si no se envía metaAhorroId (reemplazo completo)", async () => {
      const { editar, transaccion, metaAhorroRepository } = await crearEscenario();
      metaAhorroRepository.agregar(
        new MetaAhorro({
          id: "meta-1",
          usuarioId: "usuario-1",
          nombre: "Celular",
          montoObjetivo: 2000,
          fechaLimite: null,
          estado: "activa",
          fechaCreacion: new Date("2026-01-01"),
        }),
      );
      await editar.ejecutar({
        transaccionId: transaccion.id,
        usuarioId: "usuario-1",
        categoriaId: "comida",
        metaAhorroId: "meta-1",
        monto: 8,
        tipo: "egreso",
        fecha: transaccion.fecha,
      });

      const editada = await editar.ejecutar({
        transaccionId: transaccion.id,
        usuarioId: "usuario-1",
        categoriaId: "comida",
        monto: 8,
        tipo: "egreso",
        fecha: transaccion.fecha,
        // sin metaAhorroId esta vez
      });

      expect(editada.metaAhorroId).toBeNull();
    });

    it("rechaza vincular a la meta de OTRO usuario (anti-IDOR)", async () => {
      const { editar, transaccion, metaAhorroRepository } = await crearEscenario();
      metaAhorroRepository.agregar(
        new MetaAhorro({
          id: "meta-de-otro",
          usuarioId: "usuario-2",
          nombre: "Secreta",
          montoObjetivo: 2000,
          fechaLimite: null,
          estado: "activa",
          fechaCreacion: new Date("2026-01-01"),
        }),
      );

      await expect(
        editar.ejecutar({
          transaccionId: transaccion.id,
          usuarioId: "usuario-1",
          categoriaId: "comida",
          metaAhorroId: "meta-de-otro",
          monto: 8,
          tipo: "egreso",
          fecha: transaccion.fecha,
        }),
      ).rejects.toThrow(MetaAhorroNoEncontradaError);
    });

    it("rechaza vincular a una meta inactiva (RF-32/AHO-01)", async () => {
      const { editar, transaccion, metaAhorroRepository } = await crearEscenario();
      metaAhorroRepository.agregar(
        new MetaAhorro({
          id: "meta-inactiva",
          usuarioId: "usuario-1",
          nombre: "Vieja",
          montoObjetivo: 2000,
          fechaLimite: null,
          estado: "inactiva",
          fechaCreacion: new Date("2026-01-01"),
        }),
      );

      await expect(
        editar.ejecutar({
          transaccionId: transaccion.id,
          usuarioId: "usuario-1",
          categoriaId: "comida",
          metaAhorroId: "meta-inactiva",
          monto: 8,
          tipo: "egreso",
          fecha: transaccion.fecha,
        }),
      ).rejects.toThrow(MetaAhorroInactivaError);
    });
  });
});
