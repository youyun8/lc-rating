import React from "react";

export type Quodra<T> = [T, T, T, T];

export function isTruthy<T>(
  x: T,
): x is Exclude<T, null | undefined | 0 | "" | false> {
  return Boolean(x);
}

export const genericMemo: <T>(component: T) => T = React.memo;
