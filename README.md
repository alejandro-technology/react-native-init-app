# React Native TUI ⚡

![npm](https://img.shields.io/npm/v/create-react-native-tui)
![license](https://img.shields.io/badge/license-MIT-green)
![react-native](https://img.shields.io/badge/react--native-cli-blue)

Interactive CLI tool to **scaffold production-ready React Native projects** using **Clean Architecture**.

This CLI downloads a preconfigured template and helps you quickly bootstrap scalable mobile applications with best practices already in place.

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

| Command     | Description                                              |
| ----------- | -------------------------------------------------------- |
| scaffold    | Create new project from template                         |
| clean       | Clean caches (Android, iOS, Node Modules, Watchman, All) |
| pod-install | Install CocoaPods dependencies                           |
| run-android | Run app on Android                                       |
| version     | Show CLI version                                         |
| help        | Show help                                                |

## 🤖 Headless CLI Mode (For CI & AI Agents)

If you invoke the tool without arguments, it opens the interactive TUI.
By passing a command and flags, the tool runs in non-interactive headless mode:

```bash
# Scaffold a project skipping prompts
react-native-tui scaffold --name MyApp --bundle-id com.myapp --pm bun --ai claude,opencode --backend firebase --firebase-modules auth,firestore

# Clean caches headless
react-native-tui clean --target android
react-native-tui clean --target all
```

### JSON Output

For programmatic consumption, append `--json`. All intermediate progress logs will be redirected to `stderr`, and a strictly typed JSON object will be printed to `stdout` upon completion:

```bash
react-native-tui scaffold --name MyApp --json
```

**JSON Success Output:**

```json
{
  "success": true,
  "output": "✅ Setup complete!\n..."
}
```

**JSON Error Output:**

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
