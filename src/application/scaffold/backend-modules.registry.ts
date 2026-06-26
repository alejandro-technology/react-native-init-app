export const FIREBASE_MODULES = {
  auth: {
    dep: "@react-native-firebase/auth",
    diServiceFile: "authentication/infrastructure/auth.service.ts",
    diImportRegex: /import authFirebaseService from '\.\/firebase-auth\.service';\n/,
    diCaseRegex: / {4}case 'firebase':\n {6}return authFirebaseService;\n/,
    files: ["src/modules/authentication/infrastructure/firebase-auth.service.ts"],
    firebaseIndexExport:
      /export \{ default as authenticationService \} from '\.\/infrastructure\/authentication\.service';\n/,
  },
  firestore: {
    dep: "@react-native-firebase/firestore",
    diServiceFiles: [
      "products/infrastructure/product.service.ts",
      "users/infrastructure/user.service.ts",
    ],
    diImportRegexes: [
      /import productFirebaseService from '\.\/product\.firebase\.service';\n/,
      /import userFirebaseService from '\.\/user\.firebase\.service';\n/,
    ],
    diCaseRegexes: [
      / {4}case 'firebase':\n {6}return productFirebaseService;\n/,
      / {4}case 'firebase':\n {6}return userFirebaseService;\n/,
    ],
    files: [
      "src/modules/products/infrastructure/product.firebase.service.ts",
      "src/modules/users/infrastructure/user.firebase.service.ts",
      "src/modules/firebase/infrastructure/firestore.service.ts",
      "src/modules/firebase/application/firestore.hooks.ts",
      "src/modules/firebase/domain/firestore.model.ts",
      "src/modules/firebase/domain/firestore.repository.ts",
    ],
    firebaseIndexExport:
      /export \{ default as firestoreService \} from '\.\/infrastructure\/firestore\.service';\n/,
  },
  storage: {
    dep: "@react-native-firebase/storage",
    diServiceFile: null,
    files: [
      "src/modules/firebase/infrastructure/storage.service.ts",
      "src/modules/firebase/application/storage.mutations.ts",
      "src/modules/firebase/application/storage.queries.ts",
      "src/modules/firebase/domain/storage.model.ts",
      "src/modules/firebase/domain/storage.repository.ts",
      "src/modules/firebase/domain/storage.adapter.ts",
    ],
    firebaseIndexExport:
      /export \{ default as storageService \} from '\.\/infrastructure\/storage\.service';\n/,
  },
} as const;

export type FirebaseModuleName = keyof typeof FIREBASE_MODULES;

/**
 * Returns a record of Firebase npm dependencies that should be kept
 * based on the active modules. Keys are package names, values are empty
 * strings (used as a set — actual versions come from the template package.json).
 * Always includes @react-native-firebase/app as the base dependency.
 */
export function getFirebaseDeps(activeModules: string[]): Record<string, string> {
  const deps: Record<string, string> = {
    "@react-native-firebase/app": "",
  };
  for (const mod of activeModules) {
    if (mod in FIREBASE_MODULES) {
      deps[FIREBASE_MODULES[mod as FirebaseModuleName].dep] = "";
    }
  }
  return deps;
}
