import { Transform } from 'pixi.js';
import { Editor } from '.';
import { Text } from './primitives/shape-text';
import { IEventHandler } from './dispatcher';

export class TextEditor implements IEventHandler {
  private editor: Editor;
  private textArea: HTMLTextAreaElement;
  constructor(editor: Editor) {
    this.editor = editor;
    this.textArea = document.createElement('textarea');
    this.textArea.style.position = 'fixed';
    this.textArea.style.top = '0';
    this.textArea.style.left = '0';
    this.textArea.style.zIndex = '1000';
    this.textArea.style.background = 'tranparent';
    this.textArea.style.width = '200px';
    this.textArea.style.height = '200px';
    this.textArea.style.resize = 'none';
    this.textArea.style.border = 'none';

    document.body.appendChild(this.textArea);
  }
  activate(primitive: Text) {
    const viewportTransform = primitive.worldTransform;
    const decomposed = viewportTransform.decompose(new Transform());
    const { x: tx, y: ty } = decomposed.position;
    const r = decomposed.rotation;
    const { x: kx, y: ky } = decomposed.skew;
    const { x: sx, y: sy } = decomposed.scale;


    // 设置 textarea 的尺寸匹配 Text 对象
    this.textArea.style.width = `${primitive.w}px`;
    this.textArea.style.height = `auto`;

    // 应用变换，确保变换原点在左上角
    this.textArea.style.transform = `translate(${tx}px, ${ty}px) rotate(${r}rad) skew(${kx}rad, ${ky}rad) scale(${sx}, ${sy})`;
    this.textArea.style.transformOrigin = 'top left';
    this.textArea.value = primitive.text;
  }

  destroy() {}
  onDblClick(): boolean | void {
    console.log('text editor dblclick');
    const size = this.editor.selectionManager.selected.size;
    const [selected] = this.editor.selectionManager.selected.values();
    if (size === 1 && selected instanceof Text) {
      this.activate(selected);
      return true;
    }
    return false;
  }
}
