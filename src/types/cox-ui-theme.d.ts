// @cox/ui-theme exposes its provider via the package "exports" subpath
// "@cox/ui-theme/provider". This repo's tsconfig uses classic moduleResolution
// ("node"), which does not read the "exports" field, so TS can't find the types
// for that specifier (webpack honors exports at runtime, so the import works).
// Bridge the subpath to its real declaration file, which classic resolution can
// reach directly.
declare module '@cox/ui-theme/provider' {
  export * from '@cox/ui-theme/dist/provider';
}
