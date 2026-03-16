# Create React Native Init App ⚡

![npm](https://img.shields.io/npm/v/create-react-native-init-app)
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
npm init react-native-init-app
```

### Using npx or bunx

```bash
bunx create-react-native-init-app
# or
npx create-react-native-init-app
```

### Global Installation

If you prefer to have the commands available everywhere:

```bash
npm install -g create-react-native-init-app

# Now you can use the following commands:
rnia
react-native-init-app
```

## ✨ Features

- **🚀** Scaffold new projects from a production-ready template
- **🧱** Clean Architecture structure
- **📦** Automatic template download from GitHub
- **🧹** Clean caches (Android, iOS, Node Modules, Watchman)
- **🍏** Install CocoaPods
- **🤖** Run Android emulator
- **⚡** Works with npm, npx, and bunx

## Usage

```bash
# Interactive mode
npx create-react-native-init-app

# Short alias (after global install)
rnia
```

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

# 🤝 Contributing
Contributions are welcome.
Fork the repository
Create your feature branch
Commit changes
Open a Pull Request

# 📄 License

MIT
