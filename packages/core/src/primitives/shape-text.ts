import * as PIXI from 'pixi.js';
import { AbstractPrimitive, IText, PrmitiveMap } from './abstract-primitive';

type ITextConfig = Partial<IText>;

export class Text extends AbstractPrimitive<IText> implements IText {
  readonly type = PrmitiveMap.Text;
  text: string = 'helloworld';
  textGraphics = new PIXI.Text();
  label: string = 'Text';
  fontSize: number = 16;
  fontFamily: string = 'Arial';
  fontWeight: PIXI.TextStyle['fontWeight'] = '400';
  constructor(config: ITextConfig) {
    super();
    Object.assign(this, config);
    this.addChild(this.textGraphics);
    this.fills = [];
    this.render();
  }

  render(): void {
    this.textGraphics.text = this.text;
    this.textGraphics.style.fontSize = this.fontSize;
    this.textGraphics.style.fontFamily = this.fontFamily;
    this.textGraphics.style.fontWeight = this.fontWeight;
    this.textGraphics.style.fill = 0x000000;
    this.textGraphics.style.lineHeight = 1.2 * this.fontSize;
    // 强制 PixiJS 重新计算文字布局
    this.textGraphics.updateCacheTexture();

    // 现在获取的宽高是正确的
    this.w = this.textGraphics.width;
    this.h = this.textGraphics.height;
  }
}
