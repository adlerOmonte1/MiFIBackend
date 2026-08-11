/**
 * Errores de la capa de aplicación. Llevan un `codigo` estable (contrato con
 * el cliente, ver docs/openapi.yaml -> ErrorResponse) pero NO conocen el
 * status HTTP — ese mapeo es responsabilidad de la capa de presentación
 * (ver presentacion/middleware/manejadorErrores.ts), para no filtrar
 * detalles de transporte hacia el dominio/aplicación.
 */
export class ErrorAplicacion extends Error {
  constructor(
    public readonly codigo: string,
    mensaje: string,
  ) {
    super(mensaje);
    this.name = "ErrorAplicacion";
  }
}

/** RF-02 */
export class CorreoYaRegistradoError extends ErrorAplicacion {
  constructor() {
    super("CORREO_YA_REGISTRADO", "El correo ya está registrado.");
  }
}

/** RF-05/AUT-02 CA02 — mensaje genérico a propósito, no revela cuál dato falló. */
export class CredencialesInvalidasError extends ErrorAplicacion {
  constructor() {
    super("CREDENCIALES_INVALIDAS", "Correo o contraseña incorrectos.");
  }
}

/** RF-07, D-04 */
export class CuentaBloqueadaError extends ErrorAplicacion {
  constructor() {
    super("CUENTA_BLOQUEADA", "Cuenta bloqueada temporalmente por intentos fallidos.");
  }
}

/** RF-44 (mismo patrón para consentimiento único, CON-01) */
export class ConsentimientoYaAceptadoError extends ErrorAplicacion {
  constructor() {
    super("CONSENTIMIENTO_YA_ACEPTADO", "Ya aceptaste el consentimiento informado.");
  }
}

/**
 * RF-49, CON-01 — el estudiante está autenticado, pero todavía no aceptó el
 * consentimiento informado, así que las funcionalidades financieras siguen
 * bloqueadas. Es distinto de NO_AUTENTICADO: acá sabemos quién es.
 */
export class ConsentimientoRequeridoError extends ErrorAplicacion {
  constructor() {
    super(
      "CONSENTIMIENTO_REQUERIDO",
      "Debes aceptar el consentimiento informado para usar esta funcionalidad.",
    );
  }
}

/** D-05 — anti-IDOR: se usa también cuando el recurso pertenece a otro usuario. */
export class UsuarioNoEncontradoError extends ErrorAplicacion {
  constructor() {
    super("USUARIO_NO_ENCONTRADO", "Usuario no encontrado.");
  }
}

/** RF-51 */
export class NoAutenticadoError extends ErrorAplicacion {
  constructor(mensaje = "Token inválido, expirado o sesión revocada.") {
    super("NO_AUTENTICADO", mensaje);
  }
}

/** RF-50, D-05 — anti-IDOR: mismo error si no existe o si es de otro usuario (nunca se distingue). */
export class TransaccionNoEncontradaError extends ErrorAplicacion {
  constructor() {
    super("TRANSACCION_NO_ENCONTRADA", "Transacción no encontrada.");
  }
}
