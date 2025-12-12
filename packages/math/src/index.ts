import { Matrix } from 'pixi.js';
import * as PIXI from 'pixi.js';

/**
 * 参考Konvajs的实现
 * @param matrix
 * @returns
 */
export function decompose(matrix: Matrix) {
  const { a, b, c, d, tx: e, ty: f } = matrix;

  const delta = a * d - b * c;

  const result = {
    x: e,
    y: f,
    rotation: 0,
    scaleX: 0,
    scaleY: 0,
    skewX: 0,
    skewY: 0,
  };

  // Apply the QR-like decomposition.
  if (a != 0 || b != 0) {
    const r = Math.sqrt(a * a + b * b);
    result.rotation = b > 0 ? Math.acos(a / r) : -Math.acos(a / r);
    result.scaleX = r;
    result.scaleY = delta / r;
    result.skewX = (a * c + b * d) / delta;
    result.skewY = 0;
  } else if (c != 0 || d != 0) {
    const s = Math.sqrt(c * c + d * d);
    result.rotation =
      Math.PI / 2 - (d > 0 ? Math.acos(-c / s) : -Math.acos(c / s));
    result.scaleX = delta / s;
    result.scaleY = s;
    result.skewX = 0;
    result.skewY = (a * c + b * d) / delta;
  } else {
    // a = b = c = d = 0
  }
  return result;
}

export function isIntersect(bound1: PIXI.Bounds, bound2: PIXI.Bounds): boolean {
  return !(
    bound2.left > bound1.right ||
    bound2.right < bound1.left ||
    bound2.top > bound1.bottom ||
    bound2.bottom < bound1.top
  );
}
export { Matrix };
