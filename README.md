<div align="center">
<img width="1920" height="1080" alt="VectorCode banner" src="assets/Banner.jpg" />
<a href="https://github.com/alejandro-technology/react-native-init-app/actions/workflows/ci.yml"><img src="https://github.com/alejandro-technology/react-native-init-app/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
<h1>React Native TUI ⚡</h1>
<p>Interactive TUI and CLI tool to <strong>scaffold production-ready React Native projects</strong> using <strong>Clean Architecture.</strong></p>

</div>

![npm](https://img.shields.io/npm/v/create-react-native-tui)
![license](https://img.shields.io/badge/license-MIT-green)
![react-native](https://img.shields.io/badge/react--native-cli-blue)

Interactive TUI and CLI tool to **scaffold production-ready React Native projects** using **Clean Architecture**.

This tool downloads a preconfigured template and helps you quickly bootstrap scalable mobile applications with best practices already in place.

Perfect for:

- starting new React Native projects
- teams using Clean Architecture
- rapid prototyping
- AI-assisted development workflows

## 🚀 Quick Start

### The Easiest Way (Automatic)

You can initialize a new project directly without installing the CLI globally:

```bash
npm init react-native-tui
```

### Using npx or bunx

```bash
bunx create-react-native-tui
# or
npx create-react-native-tui
```

### Global Installation

If you prefer to have the commands available everywhere:

```bash
npm install -g create-react-native-tui

# Now you can use the following command:
react-native-tui
```

## ✨ Features

- **🚀** Scaffold new projects from a production-ready template
- **🧱** Clean Architecture structure
- **📦** Automatic template download from GitHub
- **🧹** Clean caches (Android, iOS, Node Modules, Watchman)
- **🍏** Install CocoaPods
- **🤖** Run Android emulator
- **⚡** Works with npm, npx, and bunx

## ⚙️ Requirements

- Node.js >= 18.0.0
- Bun (optional, for faster execution)

## 🧩 Template

The CLI downloads the latest template from:

- GitHub: [alejandro-technology/react-native-template](https://github.com/alejandro-technology/react-native-template)
- Branch: `main`

## 🧰 Commands

### Modos de ejecución

- **TUI Interactivo**: Ejecuta `react-native-tui` sin argumentos para iniciar la interfaz de terminal interactiva
- **CLI Headless**: Usa comandos y flags para ejecutar operaciones sin interacción (ideal para CI/CD y agentes AI)

---

### Comando: `scaffold`

Crea un nuevo proyecto React Native desde la plantilla preconfigurada.

#### Opciones obligatorias

| Flag     | Descripción                       |
| -------- | --------------------------------- |
| `--name` | Nombre del proyecto (ej: `MyApp`) |

#### Opciones opcionales

| Flag                 | Descripción                                                                    | Valor por defecto               | Valores válidos                |
| -------------------- | ------------------------------------------------------------------------------ | ------------------------------- | ------------------------------ |
| `--bundle-id`        | Bundle ID de la aplicación                                                     | `com.company.<nombre-proyecto>` | Cualquier bundle ID válido     |
| `--directory`        | Directorio donde se creará el proyecto                                         | `./<nombre-proyecto>`           | Ruta válida                    |
| `--pm`               | Gestor de paquetes                                                             | `npm`                           | `npm`, `yarn`, `pnpm`, `bun`   |
| `--install-deps`     | Instala dependencias automáticamente                                           | `false`                         | -                              |
| `--pod-install`      | Instala CocoaPods automáticamente (solo iOS)                                   | `false`                         | -                              |
| `--ai`               | Proveedores de IA para configurar (separados por comas)                        | `[]`                            | `claude`, `opencode`, `trae`   |
| `--backend`          | Backend a configurar                                                           | `none`                          | `none`, `firebase`             |
| `--firebase-modules` | Módulos de Firebase a habilitar (si `--backend=firebase`, separados por comas) | `auth,firestore,storage`        | `auth`, `firestore`, `storage` |
| `--json`             | Salida en formato JSON (para consumo programático)                             | `false`                         | -                              |

#### Ejemplos de `scaffold`

```bash
# Básico (solo nombre)
react-native-tui scaffold --name MyApp

# Completo con todas las opciones
react-native-tui scaffold \
  --name MyApp \
  --bundle-id com.empresa.myapp \
  --directory ~/projects/myapp \
  --pm bun \
  --install-deps \
  --pod-install \
  --ai claude,trae \
  --backend firebase \
  --firebase-modules auth,firestore

# Con salida JSON
react-native-tui scaffold --name MyApp --json
```

---

### Comando: `clean`

Limpia cachés y carpetas de compilación.

#### Opciones obligatorias

| Flag       | Descripción        |
| ---------- | ------------------ |
| `--target` | Objetivo a limpiar |

#### Valores válidos para `--target`

| Valor          | Descripción                              |
| -------------- | ---------------------------------------- |
| `android`      | Limpia carpeta de compilación de Android |
| `ios`          | Limpia carpeta de compilación de iOS     |
| `node-modules` | Elimina carpeta `node_modules`           |
| `watchman`     | Limpia caché de Watchman                 |
| `all`          | Limpia todo lo anterior                  |

#### Opciones adicionales

| Flag     | Descripción            |
| -------- | ---------------------- |
| `--json` | Salida en formato JSON |

#### Ejemplos de `clean`

```bash
# Limpiar Android
react-native-tui clean --target android

# Limpiar todo
react-native-tui clean --target all

# Con salida JSON
react-native-tui clean --target ios --json
```

---

### Comando: `version`

Muestra la versión del CLI.

#### Ejemplo de `version`

```bash
react-native-tui version
```

---

### Comando: `help`

Muestra la ayuda del CLI.

#### Ejemplo de `help`

```bash
react-native-tui help
```

---

## 🤖 Salida JSON

Para consumo programático, agrega el flag `--json` a cualquier comando. Los logs intermedios se envían a `stderr`, y el resultado final se imprime en `stdout` como un objeto JSON tipado.

**Salida JSON de éxito:**

```json
{
  "success": true,
  "output": "✅ Setup complete!\n..."
}
```

**Salida JSON de error:**

```json
{
  "success": false,
  "error": "Missing required flag: --name"
}
```

# 🤝 Contributing

Contributions are welcome.
Fork the repository
Create your feature branch
Commit changes
Open a Pull Request

# 📄 License

MIT
