import * as PIXI from 'pixi.js';
import { AbstractPrimitive, IText, PrmitiveMap } from './abstract-primitive';

type ITextConfig = Partial<IText>;

export class Text extends AbstractPrimitive<IText> implements IText {
  readonly type = PrmitiveMap.Text;
  text: string = 'helloworld';
  textGraphics = new PIXI.Text();
  label: string = 'Text';
  constructor(config: ITextConfig) {
    super();
    Object.assign(this, config);
    this.addChild(this.textGraphics);
    this.fills = [{ type: 'SOLID', color: 'lightblue' }];
    this.w = 200;
    this.h = 30;
    this.render();
  }

  render(): void {
    this.graphics.clear();
    this.graphics.rect(0, 0, this.w, this.h);
    this.applyFillsAndStrokes();
    this.textGraphics.text = this.text;
  }
}
