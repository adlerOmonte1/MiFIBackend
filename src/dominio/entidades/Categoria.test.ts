import { Categoria } from "./Categoria";

describe("Categoria", () => {
  describe("esPropiaDe (D-13)", () => {
    it("es true si el usuarioId coincide con el dueño", () => {
      const propia = new Categoria({
        id: "c1",
        usuarioId: "usuario-1",
        nombre: "Mi categoría",
        esPredefinida: false,
      });

      expect(propia.esPropiaDe("usuario-1")).toBe(true);
    });

    it("es false para cualquier otro usuario", () => {
      const propia = new Categoria({
        id: "c1",
        usuarioId: "usuario-1",
        nombre: "Mi categoría",
        esPredefinida: false,
      });

      expect(propia.esPropiaDe("usuario-2")).toBe(false);
    });

    it("es false para una predefinida, aunque 'todos la usen' — nadie es su dueño", () => {
      const predefinida = new Categoria({
        id: "c2",
        usuarioId: null,
        nombre: "Comida",
        esPredefinida: true,
      });

      expect(predefinida.esPropiaDe("usuario-1")).toBe(false);
    });
  });

  describe("puedeSerUsadaPor (RF-36, RF-50)", () => {
    it("una predefinida puede usarla cualquier estudiante", () => {
      const predefinida = new Categoria({
        id: "c2",
        usuarioId: null,
        nombre: "Comida",
        esPredefinida: true,
      });

      expect(predefinida.puedeSerUsadaPor("usuario-1")).toBe(true);
      expect(predefinida.puedeSerUsadaPor("usuario-2")).toBe(true);
    });

    it("una propia solo la puede usar su dueño", () => {
      const propia = new Categoria({
        id: "c1",
        usuarioId: "usuario-1",
        nombre: "Mi categoría",
        esPredefinida: false,
      });

      expect(propia.puedeSerUsadaPor("usuario-1")).toBe(true);
      expect(propia.puedeSerUsadaPor("usuario-2")).toBe(false);
    });
  });
});
