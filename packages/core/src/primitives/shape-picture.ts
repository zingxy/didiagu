import { AbstractPrimitive, IPicture, PrmitiveMap } from './abstract-primitive';
import * as PIXI from 'pixi.js';

type IPictureConfig = Partial<IPicture>;

export class Picture extends AbstractPrimitive<IPicture> implements IPicture {
  readonly type = PrmitiveMap.Picture;
  src: string = '';
  texture: PIXI.Texture | null = null;
  picture: PIXI.Sprite;
  constructor(config: IPictureConfig) {
    super();
    Object.assign(this, config);
    this.picture = new PIXI.Sprite();
    this.addChild(this.picture);
    if (this.src) {
      this.loadTexture(this.src);
    }
  }

  async loadTexture(src: string) {
    if (src === this.src && this.texture) {
      return;
    }
    const texture = await PIXI.Assets.load(src);
    this.texture = texture;
    this.src = src;
    this.render();
  }

  override updateAttr(attr: Partial<Omit<IPicture, 'uuid' | 'type'>>): void {
    if (attr.src !== undefined) {
      this.loadTexture(attr.src);
    }
    super.updateAttr(attr);
  }

  override render(): void {
    this.graphics.clear();
    this.graphics.rect(0, 0, this.w, this.h);
    if (this.texture) {
      this.picture.texture = this.texture;
      this.picture.width = this.w;
      this.picture.height = this.h;
    }
  }
}
