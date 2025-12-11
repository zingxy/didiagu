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
  private baseResolution: number = 3; // 基础分辨率，提高清晰度

  constructor(config: ITextConfig) {
    super();
    Object.assign(this, config);
    this.addChild(this.textGraphics);
    this.fills = [];
    this.draw();
  }

  draw(): void {
    this.textGraphics.text = this.text;
    this.textGraphics.style.fontSize = this.fontSize;
    this.textGraphics.style.fontFamily = this.fontFamily;
    this.textGraphics.style.fontWeight = this.fontWeight;
    this.textGraphics.style.fill = 0x000000;
    this.textGraphics.style.lineHeight = 1.2 * this.fontSize;

    // 设置更高的 resolution 以保持缩放时的清晰度
    this.textGraphics.resolution = this.baseResolution;

    // 强制 PixiJS 重新计算文字布局
    this.textGraphics.updateCacheTexture();

    // 现在获取的宽高是正确的
    this.w = this.textGraphics.width;
    this.h = this.textGraphics.height;
  }

  /**
   * 根据缩放比例更新文字分辨率，保持清晰度
   * @param zoomScale 当前缩放比例
   */
  updateResolution(zoomScale: number): void {
    // 根据缩放比例动态调整 resolution
    // 放大时增加 resolution，缩小时保持最小分辨率
    const targetResolution = this.baseResolution * Math.max(1, zoomScale);

    // 限制最大 resolution 避免性能问题，但允许更高的清晰度
    const clampedResolution = Math.min(targetResolution, 8);

    // 更敏感的阈值，确保及时更新
    if (Math.abs(this.textGraphics.resolution - clampedResolution) > 0.05) {
      this.textGraphics.resolution = clampedResolution;
      this.textGraphics.updateCacheTexture();
    }
    this.draw();
  }
}
