import express, { type Request, type RequestHandler, type Response } from "express";
import request from "supertest";
import { createApp } from "../../app";
import { crearCategoriaRoutes } from "./categoriaRoutes";
import { crearDashboardRoutes } from "./dashboardRoutes";
import { crearMetaAhorroRoutes } from "./metaAhorroRoutes";
import { crearTransaccionRoutes } from "./transaccionRoutes";

/**
 * Estas pruebas existen porque la cobertura de `src/presentacion/rutas` es
 * engañosa: los archivos de rutas se ejecutan al importarse, así que
 * marcan 100% aunque nadie verifique que los middlewares estén realmente
 * montados. Se comprobó con pruebas de mutación que, sin este archivo, se
 * podía borrar `authMiddleware` de todas las rutas financieras y la suite
 * seguía en verde.
 *
 * No tocan la base de datos: authMiddleware rechaza la petición sin
 * Authorization antes de llegar a Prisma (mismo criterio que app.test.ts).
 */

const RUTAS_PROTEGIDAS: ReadonlyArray<[metodo: "get" | "post" | "put" | "delete", ruta: string]> = [
  ["post", "/api/transacciones"],
  ["get", "/api/transacciones"],
  ["get", "/api/transacciones/550e8400-e29b-41d4-a716-446655440000"],
  ["put", "/api/transacciones/550e8400-e29b-41d4-a716-446655440000"],
  ["delete", "/api/transacciones/550e8400-e29b-41d4-a716-446655440000"],
  ["get", "/api/categorias"],
  ["get", "/api/dashboard/resumen"],
  ["post", "/api/metas-ahorro"],
  ["get", "/api/metas-ahorro"],
  ["get", "/api/metas-ahorro/550e8400-e29b-41d4-a716-446655440000"],
  ["delete", "/api/metas-ahorro/550e8400-e29b-41d4-a716-446655440000"],
];

describe("Rutas financieras — muro de autenticación (RF-51)", () => {
  it.each(RUTAS_PROTEGIDAS)("%s %s responde 401 sin token", async (metodo, ruta) => {
    const res = await request(createApp())[metodo](ruta).send({});

    expect(res.status).toBe(401);
    expect(res.body.codigo).toBe("NO_AUTENTICADO");
  });
});

/**
 * El muro de 401 de arriba no alcanza para el consentimiento: probarlo de
 * punta a punta exigiría un token válido con sesión en la base. Se verifica
 * acá que cada fábrica de rutas monte AMBOS middlewares en TODAS sus rutas.
 */
function crearControllerFalso(): Record<string, RequestHandler> {
  const responder = (_req: Request, res: Response) => {
    res.status(200).json({ ok: true });
  };
  return {
    crear: responder,
    listar: responder,
    obtener: responder,
    editar: responder,
    eliminar: responder,
    resumen: responder,
  };
}

function montar(
  construir: (
    controller: never,
    auth: RequestHandler,
    consentimiento: RequestHandler,
  ) => express.Router,
) {
  const auth = jest.fn<void, Parameters<RequestHandler>>((_req, _res, next) => {
    next();
  });
  const consentimiento = jest.fn<void, Parameters<RequestHandler>>((_req, _res, next) => {
    next();
  });
  const app = express();
  app.use(express.json());
  app.use("/", construir(crearControllerFalso() as never, auth, consentimiento));
  return { app, auth, consentimiento };
}

describe("Fábricas de rutas — los middlewares están montados en cada ruta", () => {
  const CASOS: ReadonlyArray<
    [
      nombre: string,
      construir: (c: never, a: RequestHandler, k: RequestHandler) => express.Router,
      rutas: ReadonlyArray<[metodo: "get" | "post" | "put" | "delete", ruta: string]>,
      exigeConsentimiento: boolean,
    ]
  > = [
    [
      "transaccionRoutes",
      crearTransaccionRoutes,
      [
        ["post", "/"],
        ["get", "/"],
        ["get", "/abc"],
        ["put", "/abc"],
        ["delete", "/abc"],
      ],
      true,
    ],
    [
      "metaAhorroRoutes",
      crearMetaAhorroRoutes,
      [
        ["post", "/"],
        ["get", "/"],
        ["get", "/abc"],
        ["delete", "/abc"],
      ],
      true,
    ],
    ["dashboardRoutes", crearDashboardRoutes, [["get", "/resumen"]], true],
    // RF-36/CAT-01: el contrato solo declara 401 en GET /categorias (datos de
    // referencia, no financieros), así que no exige consentimiento.
    [
      "categoriaRoutes",
      crearCategoriaRoutes as unknown as (
        c: never,
        a: RequestHandler,
        k: RequestHandler,
      ) => express.Router,
      [["get", "/"]],
      false,
    ],
  ];

  describe.each(CASOS)("%s", (_nombre, construir, rutas, exigeConsentimiento) => {
    it.each(rutas)("%s %s pasa por authMiddleware (RF-51)", async (metodo, ruta) => {
      const { app, auth } = montar(construir);

      await request(app)[metodo](ruta).send({});

      expect(auth).toHaveBeenCalled();
    });

    if (exigeConsentimiento) {
      it.each(rutas)("%s %s pasa por consentimientoMiddleware (RF-49)", async (metodo, ruta) => {
        const { app, consentimiento } = montar(construir);

        await request(app)[metodo](ruta).send({});

        expect(consentimiento).toHaveBeenCalled();
      });
    }
  });
});
