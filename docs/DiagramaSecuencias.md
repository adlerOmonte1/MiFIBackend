# DIAGRAMAS DE SECUENCIA — CASOS DE USO CRÍTICOS
---

## 1. UC-OCR-01 — Escanear boleta con OCR

```mermaid
sequenceDiagram
    actor Est as Estudiante
    participant App as App Móvil
    participant Ctrl as OcrController
    participant UC as ScanReceiptUseCase
    participant OCR as GoogleVisionOcrService
    participant Vision as Google Vision API
    participant Repo as SugerenciaRepository
    participant DB as Supabase (Postgres)

    Est->>App: Captura foto de la boleta
    App->>Ctrl: POST /transacciones/escanear (imagen)
    Ctrl->>UC: execute(imagen)
    UC->>OCR: extraerMonto(imagen)
    OCR->>Vision: detectText(imagen)
    Vision-->>OCR: texto detectado

    alt Monto detectado correctamente
        OCR-->>UC: monto extraído
        UC->>Repo: guardar(sugerencia OCR)
        Repo->>DB: INSERT sugerencias_transaccion
        DB-->>Repo: OK
        Repo-->>UC: sugerencia creada
        UC-->>Ctrl: sugerencia (monto editable)
        Ctrl-->>App: 200 OK + sugerencia
        App-->>Est: Muestra monto editable (continúa en UC-CNF-01)
    else No se detecta un monto válido
        OCR-->>UC: error de reconocimiento
        UC-->>Ctrl: error "no se pudo leer la boleta"
        Ctrl-->>App: 422 + opciones
        App-->>Est: "Reintentar" o "Registrar manualmente" (UC-TRX-01)
    end
```

**Qué observar:** `OcrController` nunca llama directamente a `Vision`; siempre pasa por `ScanReceiptUseCase`, que a su vez pasa por la interfaz `GoogleVisionOcrService`. Si mañana cambias de proveedor de OCR, este diagrama de secuencia no cambia — solo cambia qué clase concreta implementa la interfaz.

---

## 2. UC-CNF-01 — Confirmar transacción detectada

```mermaid
sequenceDiagram
    actor Est as Estudiante
    participant App as App Móvil
    participant Ctrl as ConfirmSuggestionController
    participant UC as ConfirmSuggestionUseCase
    participant SugRepo as SugerenciaRepository
    participant TrxRepo as TransaccionRepository
    participant MetaRepo as MetaAhorroRepository
    participant DB as Supabase (Postgres)

    Est->>App: Selecciona Guardar / Editar / Descartar
    App->>Ctrl: POST /sugerencias/{id}/confirmar (Bearer JWT)
    Ctrl->>UC: execute(id, accion, datos, usuarioId)
    UC->>SugRepo: obtenerPorId(id)
    SugRepo-->>UC: sugerencia
    Note over UC: Verifica sugerencia.usuario_id == usuarioId<br/>Si no coincide → 404 "recurso no encontrado" (RF-50, anti-IDOR)

    alt accion == Descartar
        UC->>SugRepo: eliminar(id)
        SugRepo->>DB: DELETE sugerencias_transaccion
        DB-->>SugRepo: OK
        UC-->>Ctrl: sugerencia descartada
        Ctrl-->>App: 200 OK
    else accion == Guardar o Editar
        UC->>TrxRepo: crear(transaccion)
        TrxRepo->>DB: INSERT transacciones
        DB-->>TrxRepo: transacción creada
        UC->>SugRepo: marcarComoConfirmada(id)
        SugRepo->>DB: UPDATE sugerencias_transaccion SET estado
        opt La transacción tiene meta_ahorro_id
            UC->>MetaRepo: recalcularProgreso(metaId)
            MetaRepo->>DB: SELECT SUM(monto) WHERE meta_ahorro_id
            DB-->>MetaRepo: monto ahorrado actualizado
        end
        UC-->>Ctrl: transacción confirmada
        Ctrl-->>App: 200 OK + dashboard actualizado
    end
    App-->>Est: Muestra confirmación / dashboard actualizado
```

**Qué observar:** este es el diagrama que conecta CNF-01 con AHO-02 — el bloque `opt` muestra exactamente el momento en que confirmar una transacción dispara, condicionalmente, el recálculo del progreso de ahorro. Es la "cascada" que mencioné cuando cerramos la especificación de casos de uso. La `Note` inicial hace explícita la **verificación de propiedad** (RF-50): el caso de uso nunca opera sobre una sugerencia ajena al usuario del token, y responde 404 en vez de 403 para no revelar que el recurso existe.

---

## 3. UC-GML-02 — Importar transacción desde correo bancario

```mermaid
sequenceDiagram
    participant Cron as Programador (Cron, cada 6h)
    participant UC as ImportBankEmailUseCase
    participant ConnRepo as ConexionGmailRepository
    participant Adapter as GmailApiAdapter
    participant Gmail as Gmail API
    participant Parser as BankEmailParser (Strategy)
    participant SugRepo as SugerenciaRepository
    participant ErrRepo as RegistroErrorRepository
    participant DB as Supabase (Postgres)

    Cron->>UC: ejecutar()
    UC->>ConnRepo: obtenerConexionesActivas()
    ConnRepo->>DB: SELECT conexiones_gmail WHERE estado=activo
    DB-->>ConnRepo: lista de conexiones

    loop Por cada conexión activa
        UC->>Adapter: buscarCorreosNuevos(token)
        Adapter->>Gmail: messages.list(remitentes bancarios)

        alt Token expirado o revocado
            Gmail-->>Adapter: error 401
            Adapter-->>UC: error de autenticación
            UC->>ConnRepo: marcarComoDesconectada()
            ConnRepo->>DB: UPDATE conexiones_gmail SET estado=revocado
        else Token válido
            Gmail-->>Adapter: lista de correos
            Adapter-->>UC: correos crudos

            loop Por cada correo detectado
                UC->>Parser: parse(correo)
                alt Monto extraído correctamente
                    Parser-->>UC: datos de la transacción
                    UC->>SugRepo: guardar(sugerencia Gmail)
                    SugRepo->>DB: INSERT sugerencias_transaccion
                else Formato de correo no reconocido
                    Parser-->>UC: error de formato
                    UC->>ErrRepo: registrar(error)
                    ErrRepo->>DB: INSERT registros_error
                end
            end
        end
    end
    Note over UC,DB: Las sugerencias generadas ingresan luego a UC-CNF-01
```

**Qué observar:** `Parser` aparece como un solo participante genérico ("BankEmailParser (Strategy)") aunque en el código son 3 clases distintas (BcpParser, InterbankParser, BbvaParser) — es intencional: el diagrama de secuencia muestra el *contrato* que usa `ImportBankEmailUseCase`, no cuál implementación concreta se ejecuta en cada caso. Eso es Dependency Inversion en la práctica: la secuencia no cambia sin importar qué banco sea.

---

## 4. UC-AHO-02 — Ver progreso de ahorro

```mermaid
sequenceDiagram
    actor Est as Estudiante
    participant App as App Móvil
    participant Ctrl as SavingsGoalController
    participant UC as GetSavingsProgressUseCase
    participant MetaRepo as MetaAhorroRepository
    participant TrxRepo as TransaccionRepository
    participant DB as Supabase (Postgres)

    Est->>App: Abre "Mis metas de ahorro"
    App->>Ctrl: GET /metas-ahorro
    Ctrl->>UC: execute(usuarioId)
    UC->>MetaRepo: obtenerMetasActivas(usuarioId)
    MetaRepo->>DB: SELECT metas_ahorro WHERE usuario_id AND estado=activa
    DB-->>MetaRepo: lista de metas

    loop Por cada meta activa
        UC->>TrxRepo: sumarTransaccionesPorMeta(metaId)
        TrxRepo->>DB: SELECT SUM(monto) WHERE meta_ahorro_id
        DB-->>TrxRepo: monto ahorrado
        UC->>UC: calcularPorcentaje(montoAhorrado, montoObjetivo)
        alt montoAhorrado >= montoObjetivo
            UC->>UC: marcar meta como "cumplida" (100%)
        end
    end

    UC-->>Ctrl: lista de metas con progreso calculado
    Ctrl-->>App: 200 OK + JSON
    App-->>Est: Muestra barra de progreso por meta
```

**Qué observar:** no hay ningún paso de "guardar el porcentaje" — se recalcula siempre desde `SUM(monto)`, tal como quedó definido como requisito especial en la especificación de este caso de uso. El diagrama confirma que el diseño es consistente con esa decisión. Además, todas las consultas están **acotadas por `usuario_id`** (el del token), de modo que el control de acceso (RF-50) queda garantizado por construcción: un estudiante nunca puede leer metas de otro.

---

## 5. UC-AUT-02 — Iniciar sesión (autenticación propia)

```mermaid
sequenceDiagram
    actor Est as Estudiante
    participant App as App Móvil
    participant Ctrl as AuthController
    participant UC as LoginUseCase
    participant Auth as AuthService (bcrypt + JWT)
    participant UserRepo as UsuarioRepository
    participant SesRepo as SesionRepository
    participant DB as Supabase (Postgres)

    Est->>App: Ingresa correo y contraseña
    App->>Ctrl: POST /auth/login
    Ctrl->>UC: execute(correo, password)
    UC->>UserRepo: buscarPorCorreo(correo)
    UserRepo->>DB: SELECT usuarios WHERE correo
    DB-->>UserRepo: usuario (o vacío)

    alt Cuenta bloqueada (bloqueado_hasta > ahora)
        UC-->>Ctrl: 423 cuenta temporalmente bloqueada
        Ctrl-->>App: 423
    else Credenciales inválidas
        UC->>Auth: verificar(password, passwordHash)
        Auth-->>UC: false
        UC->>UserRepo: incrementarIntentos(usuarioId)
        UserRepo->>DB: UPDATE intentos_fallidos (fija bloqueado_hasta al llegar a 5)
        UC-->>Ctrl: 401 error genérico (no revela cuál dato falló)
        Ctrl-->>App: 401
    else Credenciales válidas
        UC->>Auth: verificar(password, passwordHash)
        Auth-->>UC: true
        UC->>UserRepo: resetearIntentos(usuarioId)
        UC->>Auth: emitirJWT(usuarioId, jti)
        Auth-->>UC: JWT (exp. 7 días)
        UC->>SesRepo: crearSesion(usuarioId, jti, fechaExpiracion)
        SesRepo->>DB: INSERT sesiones
        UC-->>Ctrl: JWT + datos de usuario
        Ctrl-->>App: 200 OK + token
    end
    App-->>Est: Ingresa al dashboard (o muestra error)
```

**Qué observar:** la autenticación es **propia del backend**, no de Supabase Auth. Tres detalles cierran los requisitos de seguridad: (1) el mensaje de error es **genérico** (CA02 de AUT-02) — no dice si falló el correo o la contraseña; (2) el bloqueo por 5 intentos (RF-07) se persiste en `usuarios.intentos_fallidos` / `bloqueado_hasta`; (3) cada login crea una fila en `sesiones` con un `jti`, lo que permite el **logout real** (RF-08): al cerrar sesión se marca `revocada=true`, y en cada petición posterior el middleware rechaza cualquier JWT cuyo `jti` esté revocado o expirado (RF-51), aunque la firma siga siendo válida.

---

## RESUMEN DE TRAZABILIDAD

| Diagrama | Caso de uso | Casos de uso conectados |
|:--|:--|:--|
| 1 | UC-OCR-01 | Termina en UC-CNF-01 |
| 2 | UC-CNF-01 | Recibido desde UC-OCR-01 y UC-GML-02; dispara UC-AHO-02 (condicional); verifica propiedad (RF-50) |
| 3 | UC-GML-02 | Termina en UC-CNF-01; registra fallos en UC-CAL-01 |
| 4 | UC-AHO-02 | Disparado por UC-CNF-01 y por UC-TRX-02 (edición/eliminación); consultas acotadas por usuario (RF-50) |
| 5 | UC-AUT-02 | Base de toda sesión; habilita la validación de token del resto de casos de uso (RF-51) |
