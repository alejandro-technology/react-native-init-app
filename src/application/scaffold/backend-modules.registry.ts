export const FIREBASE_MODULES = {
  auth: {
    dep: "@react-native-firebase/auth",
    diServiceFile: "src/modules/authentication/infrastructure/auth.service.ts",
    diImportRegex: /import authFirebaseService from '\.\/auth\.firebase\.service';\n/,
    diCaseRegex: / {4}case 'firebase':\n {6}return authFirebaseService;\n/,
    files: ["src/modules/authentication/infrastructure/auth.firebase.service.ts"],
    firebaseIndexExport:
      /export \{ default as authenticationService \} from '\.\/infrastructure\/authentication\.service';\n/,
  },
  firestore: {
    dep: "@react-native-firebase/firestore",
    diServiceFiles: [
      "src/modules/products/infrastructure/product.service.ts",
      "src/modules/users/infrastructure/user.service.ts",
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

export const LOCAL_MODULES = {
  auth: {
    diServiceFile: "src/modules/authentication/infrastructure/auth.service.ts",
    diImportRegex: /import authLocalService from '\.\/auth\.local\.service';\n/,
    diCaseRegex: / {4}case 'local':\n {6}return authLocalService;\n/,
    files: ["src/modules/authentication/infrastructure/auth.local.service.ts"],
  },
  products: {
    diServiceFile: "src/modules/products/infrastructure/product.service.ts",
    diImportRegex: /import productLocalService from '\.\/product\.local\.service';\n/,
    diCaseRegex: / {4}case 'local':\n {6}return productLocalService;\n/,
    files: ["src/modules/products/infrastructure/product.local.service.ts"],
  },
  users: {
    diServiceFile: "src/modules/users/infrastructure/user.service.ts",
    diImportRegex: /import userLocalService from '\.\/user\.local\.service';\n/,
    diCaseRegex: / {4}case 'local':\n {6}return userLocalService;\n/,
    files: ["src/modules/users/infrastructure/user.local.service.ts"],
  },
};

export const SUPABASE_MODULES = {
  auth: {
    diServiceFile: "src/modules/authentication/infrastructure/auth.service.ts",
    diImportRegex: /import authSupabaseService from '\.\/auth\.supabase\.service';\n/,
    diCaseRegex: / {4}case 'supabase':\n {6}return authSupabaseService;\n/,
    files: ["src/modules/authentication/infrastructure/auth.supabase.service.ts"],
  },
  products: {
    diServiceFile: "src/modules/products/infrastructure/product.service.ts",
    diImportRegex: /import productSupabaseService from '\.\/product\.supabase\.service';\n/,
    diCaseRegex: / {4}case 'supabase':\n {6}return productSupabaseService;\n/,
    files: ["src/modules/products/infrastructure/product.supabase.service.ts"],
  },
  users: {
    diServiceFile: "src/modules/users/infrastructure/user.service.ts",
    diImportRegex: /import userSupabaseService from '\.\/user\.supabase\.service';\n/,
    diCaseRegex: / {4}case 'supabase':\n {6}return userSupabaseService;\n/,
    files: ["src/modules/users/infrastructure/user.supabase.service.ts"],
  },
};

export const HTTP_MODULES = {
  auth: {
    diServiceFile: "src/modules/authentication/infrastructure/auth.service.ts",
    diImportRegex: /import authHttpService from '\.\/auth\.http\.service';\n/,
    diCaseRegex: / {4}case 'http':\n {6}return authHttpService;\n/,
    files: ["src/modules/authentication/infrastructure/auth.http.service.ts"],
  },
  products: {
    diServiceFile: "src/modules/products/infrastructure/product.service.ts",
    diImportRegex: /import productHttpService from '\.\/product\.http\.service';\n/,
    diCaseRegex: / {4}case 'http':\n {6}return productHttpService;\n/,
    files: ["src/modules/products/infrastructure/product.http.service.ts"],
  },
  users: {
    diServiceFile: "src/modules/users/infrastructure/user.service.ts",
    diImportRegex: /import userHttpService from '\.\/user\.http\.service';\n/,
    diCaseRegex: / {4}case 'http':\n {6}return userHttpService;\n/,
    files: ["src/modules/users/infrastructure/user.http.service.ts"],
  },
};

export const MOCK_MODULES = {
  auth: {
    diServiceFile: "src/modules/authentication/infrastructure/auth.service.ts",
    diImportRegex: /import authMockService from '\.\/auth\.mock\.service';\n/,
    diCaseRegex: / {4}case 'mock':\n {6}return authMockService;\n/,
    files: ["src/modules/authentication/infrastructure/auth.mock.service.ts"],
  },
  products: {
    diServiceFile: "src/modules/products/infrastructure/product.service.ts",
    diImportRegex: /import productMockService from '\.\/product\.mock\.service';\n/,
    diCaseRegex: / {4}case 'mock':\n {6}return productMockService;\n/,
    files: ["src/modules/products/infrastructure/product.mock.service.ts"],
  },
  users: {
    diServiceFile: "src/modules/users/infrastructure/user.service.ts",
    diImportRegex: /import userMockService from '\.\/user\.mock\.service';\n/,
    diCaseRegex: / {4}case 'mock':\n {6}return userMockService;\n/,
    files: ["src/modules/users/infrastructure/user.mock.service.ts"],
  },
};

export const NAVIGATION_MODULE = {
  navigation: {
    diServiceFiles: [
      "src/navigation/hooks/useNavigation.ts",
      "src/navigation/routes/index.ts",
      "src/navigation/stacks/PrivateStackNavigator.tsx",
      "src/navigation/routes/private.routes.ts",
      "src/navigation/routes/private.routes.ts",
    ],
    diImportRegexes: [
      /import type { ExamplesStackParamList } from '\.\.\/routes\/examples\.routes';\s*/,
      /export \* from '\.\/examples\.routes';\s*/,
      /import AuthExampleView from '@modules\/examples\/ui\/AuthExampleView';\s*/,
      /\s*Example = 'Example',\s*/,
      [/\s*,\s*}/, "\n}"],
    ],
    diCaseRegexes: [
      /export const useNavigationExamples = useNavigation<\s*NativeStackNavigationProp<ExamplesStackParamList>\s*>;\s*/,
      "",
      /<Stack\.Screen name={PrivateRoutes\.Example} component={AuthExampleView}\s*\/>/,
      /\s*\[PrivateRoutes\.Example\]: undefined;\s*/,
      [/\s*;\s*}/, "\n};"],
    ],
    files: [
      "src/navigation/routes/examples.routes.ts",
      "src/navigation/stacks/ExampleStackNavigator.tsx",
    ],
  },
};
