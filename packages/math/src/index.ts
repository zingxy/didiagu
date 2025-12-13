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
  console.log('konva' , result);
  return result;
}

/**
 * @description 执行pixi的矩阵分解 
 * @param matrix 
 * @returns 
 */
export function decomposePixi(matrix: Matrix) {
  const transform = new PIXI.Transform();
  matrix.decompose(transform);
  const result = {
    x: 0,
    y: 0,
    rotation: 0,
    scaleX: 0,
    scaleY: 0,
    skewX: 0,
    skewY: 0,
  };
  result.x = transform.position.x;
  result.y = transform.position.y;
  result.rotation = transform.rotation;
  result.scaleX = transform.scale.x;
  result.scaleY = transform.scale.y;
  result.skewX = transform.skew.x;
  result.skewY = transform.skew.y;
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

export function normalizeRect(x: number, y: number, w: number, h: number) {
  let nx = x;
  let ny = y;
  let nw = w;
  let nh = h;
  if (w < 0) {
    nx = x + w;
    nw = -w;
  }
  if (h < 0) {
    ny = y + h;
    nh = -h;
  }
  return { x: nx, y: ny, w: nw, h: nh };
}
export { Matrix };
