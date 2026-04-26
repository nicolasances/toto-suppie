# Switching between npm and local toto-react

This guide explains how to switch between using the published `toto-react` npm package
and a local `../toto-react` checkout on the filesystem.

Use the **local mode** when developing toto-react and this app simultaneously — changes
to toto-react source are reflected immediately via webpack HMR. Use the **npm mode** for
normal feature work where you do not need to touch toto-react.

---

## Why webpack is required in local mode

Next.js 16 defaults to Turbopack for both `next dev` and `next build`. Turbopack
resolves symlinks to their real filesystem path and rejects any module whose real path
falls outside the project root. Because `../toto-react` is a sibling directory (outside
the project root), Turbopack cannot load it regardless of alias strategy. Webpack has no
such restriction, so local mode forces webpack via the `--webpack` flag.

---

## Switching to local mode

Assumes `toto-react` is checked out at `../toto-react` (sibling of this project).

### 1. Update `package.json`

Change the `toto-react` dependency and scripts:

```json
"scripts": {
  "dev":       "next dev --webpack",
  "dev:turbo": "next dev --turbopack",
  "build":     "next build --webpack",
  "start":     "next start",
  "lint":      "next lint"
},
"dependencies": {
  "toto-react": "file:../toto-react"
}
```

### 2. Update `next.config.ts`

Add the `turbopack: {}` block (silences the "webpack config without turbopack config"
warning that Next.js 16 emits) and the webpack alias:

```ts
const nextConfig: NextConfig = {
  transpilePackages: ['toto-react'],
  turbopack: {},
  webpack: (config) => {
    const path = require("path");
    config.resolve.alias['toto-react$'] = path.resolve(__dirname, '../toto-react/src/index.ts');
    return config;
  },
  // ... rest of config
};
```

The `toto-react$` alias uses an exact match (`$`) so that sub-path imports like
`toto-react/server/stt` continue to resolve through the package's own `exports` map
(pointing to its compiled `dist/` files).

### 3. Update `tailwind.config.ts`

Replace the `./node_modules/toto-react/dist/**` path with the source path so Tailwind
includes classes used only in toto-react components:

```ts
content: [
  // ... existing paths
  "../toto-react/src/**/*.{js,ts,jsx,tsx}",
],
```

Without this, Tailwind purges toto-react's classes (e.g. `border-lime-200`, `bg-cyan-800`)
and components like `RoundButton` become invisible.

### 4. Update `tsconfig.json`

Add a path mapping so the TypeScript language server resolves toto-react types from
source (IDE support, go-to-definition, etc.):

```json
"paths": {
  "@/*": ["./*"],
  "toto-react": ["../toto-react/src/index.ts"]
}
```

### 5. Symlink peer dependencies in toto-react

toto-react has its own `node_modules/` with `next`, `react`, and `@types/` packages.
These must point to this project's copies so TypeScript sees a single instance and
avoids type conflicts:

```sh
# Run from the toto-react-supermarket directory
cd ../toto-react/node_modules

ln -sf ../../toto-react-supermarket/node_modules/next           next
ln -sf ../../../toto-react-supermarket/node_modules/react       react
ln -sf ../../../toto-react-supermarket/node_modules/react-dom   react-dom
ln -sf ../../../toto-react-supermarket/node_modules/@types/react     @types/react
ln -sf ../../../toto-react-supermarket/node_modules/@types/react-dom @types/react-dom
```

> **Note:** If you run `npm install` inside `../toto-react`, npm will overwrite these
> symlinks. Re-run the commands above after any `npm install` in toto-react.

### 6. Install and run

```sh
npm install      # creates node_modules/toto-react -> ../../toto-react symlink
npm run dev      # next dev --webpack with live toto-react editing
```

---

## Switching to npm mode

Use this when you want to run against the published package and restore Turbopack.

### 1. Update `package.json`

Restore the versioned dependency and revert scripts:

```json
"scripts": {
  "dev":   "next dev --turbopack",
  "build": "next build",
  "start": "next start",
  "lint":  "next lint"
},
"dependencies": {
  "toto-react": "^0.1.0"
}
```

### 2. Update `next.config.ts`

Remove `transpilePackages`, the `turbopack: {}` block, and the entire `webpack` callback.
The npm package ships pre-compiled `dist/` files so transpilation is not needed:

```ts
const nextConfig: NextConfig = {
  // no transpilePackages, no turbopack, no webpack
  // ... rest of config (headers etc.)
};
```

### 3. Update `tailwind.config.ts`

Replace the `../toto-react/src/**` path with the npm package's compiled output so Tailwind
can still find toto-react class names:

```ts
content: [
  // ... existing paths
  "./node_modules/toto-react/dist/**/*.{js,mjs}",
],
```

So you will go from `"../toto-react/src/**/*.{js,ts,jsx,tsx}"` to `"./node_modules/toto-react/dist/**/*.{js,mjs}"`.

### 4. Update `tsconfig.json`

Remove the `toto-react` entry from `paths`:

```json
"paths": {
  "@/*": ["./*"]
}
```

### 5. Force-reinstall the npm package

After `npm install` in local mode, `node_modules/toto-react` is a symlink. When switching
back to npm mode, npm will **not** replace this symlink automatically — it sees the version
already matches. You must delete it first:

```sh
rm -rf node_modules/toto-react
npm install
```

### 6. Clear the Next.js cache and run

Turbopack caches module-alias maps inside `.next/`. Always delete it when switching modes:

```sh
rm -rf .next
npm run dev      # next dev --turbopack
```

---

## Quick-reference summary

| Setting | npm mode | local mode |
|---|---|---|
| `package.json` dependency | `"toto-react": "^0.1.0"` | `"toto-react": "file:../toto-react"` |
| `dev` script | `next dev --turbopack` | `next dev --webpack` |
| `build` script | `next build` | `next build --webpack` |
| `next.config.ts` transpilePackages | not needed | `transpilePackages: ['toto-react']` |
| `next.config.ts` webpack alias | not needed | `toto-react$` → `../toto-react/src/index.ts` |
| `next.config.ts` turbopack block | not needed | `turbopack: {}` |
| `tailwind.config.ts` content | `node_modules/toto-react/dist/**/*.{js,mjs}` | `../toto-react/src/**` |
| `tsconfig.json` paths | no toto-react entry | `"toto-react": ["../toto-react/src/index.ts"]` |
| toto-react node_modules symlinks | not needed | `next`, `react`, `react-dom`, `@types/react`, `@types/react-dom` |
| Before switching | `rm -rf node_modules/toto-react && rm -rf .next` | (symlink is created by npm) |
