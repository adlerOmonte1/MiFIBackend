---
name: mifi-arquitectura-solid
description: Arquitectura en capas y aplicación concreta de los principios SOLID en el backend de MiFi (Node.js + Express + TypeScript + Prisma). Úsalo al escribir o revisar entidades de dominio, casos de uso, repositorios, servicios de infraestructura, controllers o middleware. Se activa con tareas como "crea el caso de uso X", "implementa el repositorio Y", "escribe el controller Z", "en qué carpeta va esto", o cualquier código nuevo del backend de MiFi.
metadata:
  version: "1.0.0"
  proyecto: MiFi
---

# Arquitectura y SOLID en MiFi

Backend en 4 capas, dependencias siempre apuntando hacia el dominio
(Dependency Inversion) — ver `docs/DiagramaComponentes.md §3`:

```
Controllers (Presentación)
   └─ Middleware Auth + Autorización   ← valida JWT/sesión (RF-51) y propiedad del recurso (RF-50)
        └─ Casos de Uso (Aplicación)
             └─ Entidades + Interfaces de Repositorio (Dominio)   ← reglas puras, sin dependencias externas
                  └─ Infraestructura   ← Repositorios (Prisma), servicios (bcrypt, JWT, cifrado,
                                          Google Vision, Gmail, parsers de banco)
```

## Estructura de carpetas

```
src/
  dominio/
    entidades/       Reglas puras del negocio (ej. Usuario.estaBloqueado())
    repositorios/     Interfaces de acceso a datos (ej. IUsuarioRepository)
    servicios/         Interfaces de servicios externos (ej. IHashService, ITokenService)
  aplicacion/
    casos-uso/        Orquestación: qué hacer, en qué orden, con qué reglas
  infraestructura/
    repositorios/       Implementaciones Prisma de las interfaces de dominio
    servicios/            Implementaciones reales (bcrypt, jsonwebtoken, AES-256-GCM, Vision, Gmail)
  presentacion/
    controllers/          Traducen HTTP <-> caso de uso, sin lógica de negocio
    middleware/             Autenticación, autorización, manejo de errores
    rutas/                    Definición de endpoints Express
```

**Regla de dependencia:** un archivo en `dominio/` no importa nada de
`infraestructura/` ni de `presentacion/`. Un caso de uso en `aplicacion/`
importa interfaces de `dominio/`, nunca una clase concreta de
`infraestructura/` (eso se inyecta desde donde se ensambla la app).

## Los 5 principios, aplicados con ejemplos reales del proyecto

| Principio | Qué significa aquí | Ejemplo concreto en MiFi |
|:--|:--|:--|
| **S — Responsabilidad única** | Cada clase hace una sola cosa. Nada de un `AuthService` que hashea, firma tokens Y accede a la base de datos. | `BcryptHashService` solo hashea/compara contraseñas; `JwtTokenService` solo firma/valida JWT; `PrismaUsuarioRepository` solo persiste. `SugerenciaTransaccion` solo sabe confirmarse/descartarse/expirar (Diagrama de Clases). `MetaAhorro` calcula su propio progreso. |
| **O — Abierto/cerrado** | Agregar comportamiento no debería requerir modificar código existente. | `IBankEmailParser` (interfaz) + `BcpParser`/`InterbankParser`/`BbvaParser`. Agregar un banco nuevo = una clase nueva, cero cambios en las existentes. Igual con `IReceiptOcrService` → `GoogleVisionOcrService`: cambiar de proveedor de OCR es agregar una clase. |
| **L — Sustitución de Liskov** | Cualquier implementación de una interfaz debe poder reemplazar a otra sin romper al que la usa. | Un `IUsuarioRepository` implementado con Prisma o con un fake en memoria (para tests) deben comportarse igual desde la perspectiva del caso de uso que lo consume. |
| **I — Segregación de interfaces** | Interfaces pequeñas y específicas, no una gigante que mezcle responsabilidades. | `IUsuarioRepository` (CRUD de usuario) separado de `ISesionRepository` (gestión de sesiones) — nunca una `IAuthRepository` que mezcle ambas. |
| **D — Inversión de dependencias** | Las capas superiores dependen de abstracciones, nunca de detalles concretos. | Los casos de uso dependen de `IUsuarioRepository`/`IHashService`/`ITokenService` (interfaces), nunca de `@prisma/client`, `bcryptjs` o `jsonwebtoken` directamente. Esto es lo que permite testear la lógica de negocio con mocks, sin base de datos real. |

## Seguridad por defecto (aplica a todo endpoint/caso de uso sobre un recurso de usuario)

- **Anti-IDOR (D-05, RF-50):** todo caso de uso que lea/edite/elimine un
  recurso verifica que pertenezca al usuario del token. Si no le
  pertenece, responde **404** (nunca 403 — el 404 no revela que el
  recurso existe).
- **Nunca confíes en un `usuarioId` que venga del body/params del
  cliente.** El `usuarioId` siempre sale del JWT validado por el
  middleware, nunca del payload de la petición.
- **Consentimiento (RF-49):** los endpoints financieros verifican
  `consentimientoAceptado` antes de ejecutar el caso de uso.

## Antes de escribir código

Carga también la skill `mifi-contexto-diseno` para saber qué documento
consultar y qué RF/HU/UC origina lo que vas a construir. No dupliques la
documentación de diseño en el código; referénciala por su código
(`RF-XX`, `UC-YYY-NN`).
