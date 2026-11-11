interface BigInstance {
  abs(): BigInstance;
  add(n: number | string | BigInstance): BigInstance;
  div(n: number | string | BigInstance): BigInstance;
  eq(n: number | string | BigInstance): boolean;
  gt(n: number | string | BigInstance): boolean;
  gte(n: number | string | BigInstance): boolean;
  lt(n: number | string | BigInstance): boolean;
  lte(n: number | string | BigInstance): boolean;
  minus(n: number | string | BigInstance): BigInstance;
  mod(n: number | string | BigInstance): BigInstance;
  times(n: number | string | BigInstance): BigInstance;
  plus(n: number | string | BigInstance): BigInstance;
  toFixed(dp?: number): string;
  toPrecision(sd?: number): string;
  round(dp: number, rm?: number): BigInstance;
}

interface BigConstructor {
  new (value?: number | string | BigInstance): BigInstance;
  (value?: number | string | BigInstance): BigInstance;
  DP: number;
  RM: number;
  RoundHalfUp: number;
}

declare const Big: BigConstructor;

type Big = BigInstance;

declare module "big.js" {
  const _Big: BigConstructor;
  export default _Big;
}
