import { Transformer } from './primitives/shape-transformer';
import { Editor } from './editor';
import { AbstractPrimitiveView } from './primitives/abstract-primitive';

export class TransformerManager {
  private editor: Editor;
  private transformer: Transformer;
  constructor(editor: Editor) {
    this.editor = editor;
    this.transformer = new Transformer(editor);
    this.editor.sceneGraph.top.addChild(this.transformer);
    this.editor.on('selection.changed', (arr) => {
      console.log(
        '选区变化:',
        Array.from(this.editor.selectionManager.selected)
      );
      this.updateTransformer(arr);
    });
    this.editor.on('camera.changed', () => {
      this.updateTransformer(Array.from(this.editor.selectionManager.selected));
    });
  }

  updateTransformer = (selected: AbstractPrimitiveView[]) => {
    if (selected.length === 0) {
      this.transformer.visible = false;
    }
    this.transformer.update(selected);
  };
}
