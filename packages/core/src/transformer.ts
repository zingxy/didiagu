import { Transformer } from './primitives/shape-transformer';
import { Editor } from './editor';
import { AbstractPrimitive } from './primitives/abstract-primitive';

export class TransformerManager {
  private editor: Editor;
  private transformer: Transformer;
  constructor(editor: Editor) {
    this.editor = editor;
    this.transformer = new Transformer(editor);
    this.editor.sceneGraph.cameraSpace.addChild(this.transformer);
    this.editor.on('selection.changed', this.updateTransformer);
    this.editor.on('camera.changed', () => {
      this.updateTransformer(Array.from(this.editor.selectionManager.selected));
    });
  }

  updateTransformer = (selected: AbstractPrimitive[]) => {
    if (selected.length === 0) {
      this.transformer.visible = false;
    }
    console.log('update transformer', selected);
    this.transformer.update(selected);
  };
}
