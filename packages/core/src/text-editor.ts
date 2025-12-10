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
    this.textArea.style.resize = 'none';
    this.textArea.style.border = 'none';
    this.textArea.style.outline = 'none';
    this.textArea.style.padding = '0';
    this.textArea.style.margin = '0';
    this.textArea.style.overflow = 'hidden';
    this.textArea.style.color = '#000000';
    this.textArea.style.background = 'transparent';
    this.textArea.style.opacity = '0.8';
    this.textArea.style.whiteSpace = 'pre'; // 保留空格和换行，但不自动换行
    this.textArea.style.lineHeight = '1.2';

    document.body.appendChild(this.textArea);
  }
  activate(primitive: Text) {
    const viewportTransform = primitive.worldTransform;
    // 设置 textarea 的尺寸匹配 Text 对象
    this.textArea.style.display = 'block';
    function fitAll(el: HTMLTextAreaElement) {
      el.style.height = 'auto';
      el.style.width = 'auto';

      el.style.height = el.scrollHeight + 'px';
      el.style.width = el.scrollWidth + 'px';
    }

    this.textArea.addEventListener('input', () => fitAll(this.textArea));
    fitAll(this.textArea);

    // 同步字体样式
    this.textArea.style.fontSize = `${primitive.fontSize}px`;
    this.textArea.style.fontFamily = primitive.fontFamily;
    this.textArea.style.fontWeight = primitive.fontWeight;

    // 直接使用矩阵变换，避免分解后重组导致的精度问题
    const m = viewportTransform;
    this.textArea.style.transform = `matrix(${m.a}, ${m.b}, ${m.c}, ${m.d}, ${m.tx}, ${m.ty})`;
    this.textArea.style.transformOrigin = 'top left';
    this.textArea.value = primitive.text;
    this.textArea.focus();
    this.textArea.select();
    this.textArea.onblur = () => {
      primitive.text = this.textArea.value;
      primitive.updateAttr({
        text: this.textArea.value,
      });
      this.textArea.style.display = 'none';
      primitive.visible = true;
    };
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
