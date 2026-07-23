# Guía de Entorno de Desarrollo — MiFi

> Objetivo: dejar tu entorno **listo para desarrollar y probar** la app en **Android e iOS** y el backend, usando tus tres equipos (PC Windows, MacBook, iPhone). El despliegue (stores / servidor) se aborda en una fase posterior.

---

## 0. Regla de oro de plataformas

| Tarea | Windows PC | MacBook | iPhone |
|:--|:--:|:--:|:--:|
| Backend (Node + Prisma + Postgres) | ✅ | ✅ | — |
| Desarrollo del código de la app (JS) | ✅ | ✅ | — |
| Compilar / emular **Android** | ✅ | ✅ | — |
| Compilar / simular **iOS** | ❌ *(imposible en Windows)* | ✅ | — |
| Probar la app en **dispositivo real** | ✅ (Android físico) | ✅ | ✅ (Android e iOS vía Expo) |

**Conclusión:** desarrollas indistintamente en cualquiera de las dos máquinas (el repo se sincroniza por Git). El **MacBook es obligatorio** para el simulador de iOS y, más adelante, para publicar en la App Store. Tu **iPhone** sirve como dispositivo de prueba real durante todo el desarrollo.

---

## 1. Stack tecnológico consolidado

Refleja las decisiones ya tomadas en la documentación (auth propia, cifrado, etc.).

### App móvil
| Pieza | Elección | Por qué |
|:--|:--|:--|
| Framework | **React Native con Expo** (workflow con *dev client*) | Un solo código para Android + iOS; reduce la dependencia de Xcode; cámara y OAuth listos |
| Lenguaje | JavaScript (TypeScript opcional recomendado) | Coherente con la documentación |
| Estado | Zustand | Ligero, simple |
| Cliente HTTP | Axios + React Query | Peticiones + caché/estado servidor |
| Cámara / imagen | `expo-camera`, `expo-image-picker` | Captura de boletas (OCR se procesa en el backend) |
| OAuth Gmail | `expo-auth-session` | Flujo OAuth 2.0 desde la app |

### Backend
| Pieza | Elección |
|:--|:--|
| Runtime | Node.js 20 LTS |
| Framework | Express |
| ORM | Prisma |
| Base de datos | PostgreSQL (Supabase) |
| Auth | `jsonwebtoken` (JWT propio) + `bcryptjs` (hash de contraseña) |
| Cifrado tokens Gmail | módulo `crypto` nativo de Node (AES-256-GCM) |
| Servicios Google | `@google-cloud/vision` (OCR) + `googleapis` (Gmail) |
| Tareas programadas | `node-cron` *(provisional, ver decisión D-12)* |
| Validación / seguridad | `zod`, `helmet`, `cors`, `dotenv` |

> **Nota práctica:** usa **`bcryptjs`** (JavaScript puro) en vez de `bcrypt` nativo. Evita tener que compilar con node-gyp / Visual Studio Build Tools en Windows y funciona igual en Mac. Rendimiento suficiente para 40 usuarios.

### Servicios en la nube
| Servicio | Uso | Costo en desarrollo |
|:--|:--|:--|
| Supabase | Postgres + Storage | Free tier |
| Google Cloud — Vision API | OCR de boletas | Free tier (cuota mensual) |
| Google Cloud — Gmail API | Lectura de correos bancarios | Gratis (modo Testing) |
| Expo EAS | Builds en la nube (Android/iOS) — fase de despliegue | Free tier limitado |

---

## 2. Requisitos base (instalar en AMBAS máquinas)

Esto es idéntico en Windows y macOS.

### 2.1 Node.js 20 LTS (mediante gestor de versiones)

**Windows** (PowerShell) — usa [nvm-windows](https://github.com/coreybutler/nvm-windows):
```bash
# Instala nvm-windows desde su instalador (nvm-setup.exe) y luego:
nvm install 20
nvm use 20
node -v   # v20.x
npm -v
```

**macOS** (zsh) — usa nvm:
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
# reinicia la terminal y:
nvm install 20
nvm use 20
node -v   # v20.x
```

### 2.2 Git
- **Windows:** instala Git for Windows (incluye Git Bash).
- **macOS:** viene con las Command Line Tools (paso 4.2); o `brew install git`.
```bash
git --version
```

### 2.3 Editor
- **VS Code** + extensiones: *ESLint*, *Prettier*, *Prisma*, *React Native Tools*.

### 2.4 Herramientas de Expo (no requieren instalación global)
Se usan con `npx`. Verás su uso en el paso 6.
```bash
npx create-expo-app@latest --help
```

---

## 3. Windows PC — configuración para **Android + Backend**

### 3.1 Java Development Kit (JDK 17)
Android moderno requiere **JDK 17**. Android Studio ya incluye uno (JBR), pero conviene tenerlo claro.

### 3.2 Android Studio (incluye el SDK de Android)
1. Instala **Android Studio**.
2. En *More Actions → SDK Manager*, instala:
   - **Android SDK Platform 34** (o la más reciente estable)
   - **Android SDK Build-Tools**
   - **Android SDK Platform-Tools**
   - **Android Emulator**
3. En *Virtual Device Manager*, crea un **AVD** (ej. Pixel 7, Android 14).

### 3.3 Variables de entorno (PowerShell, usuario actual)
```powershell
setx ANDROID_HOME "$env:LOCALAPPDATA\Android\Sdk"
setx PATH "$env:PATH;$env:LOCALAPPDATA\Android\Sdk\platform-tools"
```
Cierra y reabre la terminal para que tomen efecto.

### 3.4 Verificación Android
```bash
adb --version          # muestra versión de Android Debug Bridge
emulator -list-avds    # lista tu AVD creado
```

> Con esto tu Windows ya puede correr la app en **emulador Android** o en un **teléfono Android físico** (activando *Depuración USB*).

---

## 4. MacBook — configuración para **iOS**

### 4.1 Homebrew (gestor de paquetes de macOS)
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 4.2 Xcode + Command Line Tools
1. Instala **Xcode** desde la App Store (es grande, tómate tu tiempo).
2. Instala las herramientas de línea de comandos y acepta la licencia:
```bash
xcode-select --install
sudo xcodebuild -license accept
```

### 4.3 Watchman y CocoaPods
```bash
brew install watchman
brew install cocoapods       # o: sudo gem install cocoapods
```

### 4.4 Verificación iOS
```bash
xcodebuild -version          # Xcode 15.x
pod --version                # CocoaPods instalado
xcrun simctl list devices    # lista los simuladores de iPhone disponibles
```

> Con esto tu MacBook ya puede correr la app en el **Simulador de iOS**. Para probar en tu **iPhone físico** basta con Expo (paso 6); firmar con tu Apple ID gratuito permite instalar builds de desarrollo. La **cuenta de Apple Developer ($99/año)** solo se necesita para publicar en la App Store — eso es fase de despliegue.

---

## 5. iPhone — dispositivo de prueba real

1. Instala **Expo Go** desde la App Store (para iterar el código JS al instante).
2. Asegúrate de que el iPhone y la máquina de desarrollo estén en la **misma red Wi-Fi**.
3. Cuando levantes el proyecto (paso 6), escaneas el QR y la app carga en tu iPhone.
4. Para funciones nativas avanzadas se usa un *development build* con `expo-dev-client` (Expo te guía). Para MiFi, la cámara y el OAuth funcionan con este esquema sin problema.

> Lo mismo aplica si consigues un Android físico: **Expo Go** desde Play Store.

---

## 6. Crear y levantar el proyecto de la app

Desde cualquiera de las dos máquinas:
```bash
npx create-expo-app@latest MiFiApp
cd MiFiApp
npx expo install expo-camera expo-image-picker expo-auth-session zustand axios @tanstack/react-query
npx expo start
```
- Pulsa **`a`** → abre en emulador/dispositivo **Android**.
- Pulsa **`i`** → abre en **Simulador iOS** (solo en MacBook).
- Escanea el **QR** con **Expo Go** → abre en tu **iPhone**.

---

## 7. Backend y base de datos

Recomendado correrlo en la **PC Windows** (será tu estación principal), pero funciona igual en Mac.

### 7.1 Crear el proyecto backend
```bash
mkdir MiFiBackend-api && cd MiFiBackend-api
npm init -y
npm install express cors helmet dotenv zod jsonwebtoken bcryptjs @prisma/client @google-cloud/vision googleapis node-cron
npm install -D prisma nodemon
npx prisma init
```

### 7.2 Prisma + Supabase
1. Crea un proyecto en **Supabase** (free tier) → copia el *connection string* de Postgres.
2. Pégalo en `.env` como `DATABASE_URL`.
3. Modela el esquema en `prisma/schema.prisma` según [DiagramaEntidadRelacion.md](DiagramaEntidadRelacion.md) y aplica:
```bash
npx prisma migrate dev --name init
npx prisma studio     # inspector visual de la BD (verificación)
```

### 7.3 Variables de entorno (`.env`) — nunca subir a Git
```
DATABASE_URL=postgresql://...        # Supabase
JWT_SECRET=<cadena-larga-aleatoria>  # firma del JWT (RF-06)
ENCRYPTION_KEY=<clave-32-bytes-hex>  # AES-256-GCM tokens Gmail (RF-24, D-06)
GOOGLE_APPLICATION_CREDENTIALS=./gcloud-vision.json
GMAIL_CLIENT_ID=...
GMAIL_CLIENT_SECRET=...
```
> Añade `.env` y los `*.json` de credenciales al `.gitignore`.

### 7.4 Verificación backend
```bash
node -e "console.log('node ok')"
npx prisma -v
```

---

## 8. Servicios en la nube (una sola vez)

### 8.1 Supabase
1. Cuenta gratuita → nuevo proyecto.
2. Toma el connection string (Settings → Database) para `DATABASE_URL`.
3. Crea un *bucket* en Storage para las imágenes de boletas.

### 8.2 Google Cloud
1. Crea un proyecto en Google Cloud Console.
2. **Habilita APIs:** *Cloud Vision API* y *Gmail API*.
3. **Vision:** crea una *Service Account* → descarga el JSON de credenciales → apúntalo en `GOOGLE_APPLICATION_CREDENTIALS`.
4. **Gmail:** configura la *OAuth consent screen* en **modo Testing** (decisión D-11), crea credenciales OAuth 2.0, y agrega tu correo como **usuario de prueba**. Recuerda: el refresh token expira cada 7 días en este modo.

---

## 9. Checklist de verificación "OK"

Marca cada línea cuando el comando responda sin error.

**Ambas máquinas**
- [ ] `node -v` → v20.x
- [ ] `npm -v` → responde
- [ ] `git --version` → responde
- [ ] `npx expo --version` → responde

**Windows (Android + backend)**
- [ ] `adb --version` → responde
- [ ] `emulator -list-avds` → muestra tu AVD
- [ ] `npx prisma -v` → responde

**MacBook (iOS)**
- [ ] `xcodebuild -version` → Xcode 15.x
- [ ] `pod --version` → responde
- [ ] `xcrun simctl list devices` → lista simuladores
- [ ] `watchman --version` → responde

**Prueba integral (el verdadero "ok")**
- [ ] `npx expo start` en el proyecto → abre en **emulador Android** (tecla `a`)
- [ ] `npx expo start` → abre en **Simulador iOS** en el MacBook (tecla `i`)
- [ ] Escaneo del QR → la app carga en el **iPhone** con Expo Go
- [ ] Backend arranca (`npm run dev`) y responde en `http://localhost:PORT`
- [ ] `npx prisma studio` muestra las tablas creadas en Supabase

Si las cinco últimas dan "ok", tu entorno multiplataforma está **operativo**.

---

## 10. Versiones recomendadas (resumen)

| Herramienta | Versión |
|:--|:--|
| Node.js | 20 LTS |
| npm | 10.x (viene con Node 20) |
| Expo SDK | Última estable |
| JDK (Android) | 17 |
| Android SDK Platform | 34+ |
| Xcode (macOS) | 15.x |
| CocoaPods | 1.14+ |
| PostgreSQL (Supabase) | 15+ |
| Prisma | 5.x |

---

## 11. Flujo de trabajo diario

1. **Un solo repositorio en Git** compartido entre ambas máquinas (`git pull` al empezar, `git push` al terminar).
2. En tu **PC Windows** (estación principal): levantas el **backend** y pruebas en **Android**.
3. Cuando necesites validar **iOS**: haces `git pull` en el **MacBook**, `npx expo start`, y abres el **Simulador iOS** o tu **iPhone**.
4. El **iPhone con Expo Go** te sirve para revisar rápido en cualquier momento, apuntando a la máquina que tenga el backend corriendo (misma Wi-Fi).

> **Despliegue (fase posterior):** con **EAS Build** podrás generar el **APK de Android** e incluso builds de **iOS desde la nube** sin depender del MacBook para compilar. Se detallará en la fase de despliegue del plan de trabajo.
