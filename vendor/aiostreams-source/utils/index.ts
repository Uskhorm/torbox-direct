// Runtime adapter for the vendored parser and sorter, not the server barrel.
// Schema/context imports are type-only and erased by esbuild.
export * as constants from './constants.js';
const silent={debug(){},info(){},warn(){},error(){},trace(){}};
export const createLogger=()=>silent;
