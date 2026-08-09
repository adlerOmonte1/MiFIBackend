declare global {
  namespace Express {
    interface Request {
      /** Poblado por authMiddleware tras validar el JWT (RF-51). Nunca confiar en un usuarioId del body/params del cliente (RF-50). */
      usuarioId?: string;
      /** jti de la sesión activa (D-03) — usado por el logout para revocarla. */
      jti?: string;
    }
  }
}

export {};
