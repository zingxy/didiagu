import * as PIXI from 'pixi.js';
interface ISolidPaint {
  type: 'SOLID';
  color: string;
}
interface IImagePaint {
  type: 'IMAGE';
  src: PIXI.Texture;
  _ref?: PIXI.Sprite;
}

export type IPaint = ISolidPaint;
