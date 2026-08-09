import request from "supertest";
import { createApp } from "./app";

describe("GET /health", () => {
  it("responde 200 con status ok", async () => {
    const res = await request(createApp()).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});

// E2E de los caminos que no requieren base de datos real: validación de
// entrada y autenticación fallan antes de que el caso de uso toque Prisma.
// El resto (camino feliz de registro/login) se cubre con pruebas unitarias
// de los casos de uso (mocks) hasta que Supabase esté conectado (Fase 2.2).
describe("POST /api/auth/registro — validación (RF-01 a RF-03)", () => {
  it("responde 400 con codigo VALIDACION si el correo no es válido", async () => {
    const res = await request(createApp())
      .post("/api/auth/registro")
      .send({ nombre: "Ana", correo: "no-es-un-correo", password: "clave-segura-123" });

    expect(res.status).toBe(400);
    expect(res.body.codigo).toBe("VALIDACION");
  });

  it("responde 400 si la contraseña tiene menos de 8 caracteres (RF-03)", async () => {
    const res = await request(createApp())
      .post("/api/auth/registro")
      .send({ nombre: "Ana", correo: "ana@unmsm.pe", password: "corta" });

    expect(res.status).toBe(400);
    expect(res.body.codigo).toBe("VALIDACION");
  });
});

describe("Endpoints protegidos — sin token (RF-51)", () => {
  it("GET /api/usuarios/me responde 401 sin Authorization", async () => {
    const res = await request(createApp()).get("/api/usuarios/me");
    expect(res.status).toBe(401);
    expect(res.body.codigo).toBe("NO_AUTENTICADO");
  });

  it("POST /api/consentimiento responde 401 sin Authorization", async () => {
    const res = await request(createApp())
      .post("/api/consentimiento")
      .send({ versionTexto: "v1.0" });
    expect(res.status).toBe(401);
    expect(res.body.codigo).toBe("NO_AUTENTICADO");
  });

  it("POST /api/auth/logout responde 401 con un token inválido", async () => {
    const res = await request(createApp())
      .post("/api/auth/logout")
      .set("Authorization", "Bearer token-que-no-existe");
    expect(res.status).toBe(401);
    expect(res.body.codigo).toBe("NO_AUTENTICADO");
  });
});
