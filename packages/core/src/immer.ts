import {
  produce,
  produceWithPatches,
  enablePatches,
  applyPatches,
} from 'immer';
import type { Patch } from 'immer';
import EventEmitter from 'eventemitter3';
interface IShape {
  id: string;
  type: 'circle';
  color: string;
  deleted: boolean;
}

type ElementMap = Record<string, IShape>;
let elements: ElementMap = {};
const ee = new EventEmitter();

enablePatches();
class Delta {
  patches: Patch[];
  inversePatches: Patch[];
  constructor(patches: Patch[], inversePatches: Patch[]) {
    this.patches = patches;
    this.inversePatches = inversePatches;
  }
  public static create(patches: Patch[], inversePatches: Patch[]) {
    return new Delta(patches, inversePatches);
  }
  inverse(): Delta {
    return new Delta(this.inversePatches, this.patches);
  }
}

class History extends EventEmitter {
  undoStack: Delta[] = [];
  redoStack: Delta[] = [];

  public static pop(stack: Delta[]): Delta | undefined {
    return stack.pop();
  }
  public static push(stack: Delta[], delta: Delta) {
    stack.push(delta.inverse());
  }
  record(delta: Delta) {
    History.push(this.undoStack, delta);
    this.redoStack = [];
  }
  undo() {
    const delta = History.pop(this.undoStack);
    if (delta) {
      elements = applyPatches(elements, delta.patches);
      History.push(this.redoStack, delta);
    }
  }
  redo() {
    const delta = History.pop(this.redoStack);
    if (delta) {
      elements = applyPatches(elements, delta.patches);
      History.push(this.undoStack, delta);
    }
  }
}

const add = (elements: ElementMap, newElement: IShape) => {
  /* 对于add操作， 我们将其分解为两个步骤：
   * 1. 先添加一个deleted状态为true的元素（初始状态）
   * 2. 然后再添加一个deleted状态为false的元素（表示添加）,这一步会记录patches和inversePatches
   * 这样做的目的是当撤销时，把deleted设置为true即可，而不需要真正删除元素，从而保留元素的历史状态。
   */
  const nextElements = produce(elements, (draft) => {
    if (draft[newElement.id]) {
      throw new Error(`Element with id ${newElement.id} already exists.`);
    }

    draft[newElement.id] = {
      ...newElement,
      deleted: true,
    };
  });

  return produceWithPatches(nextElements, (draft) => {
    draft[newElement.id].deleted = false;
  });
};

const update = (elements: ElementMap, id: string, attr: Partial<IShape>) => {
  return produceWithPatches(elements, (draft) => {
    if (draft[id]) {
      for (const [key, value] of Object.entries(attr)) {
        (draft[id] as any)[key] = value;
      }
    } else {
      throw new Error(`Element with id ${id} does not exist.`);
    }
  });
};

const remove = (elements: ElementMap, id: string) => {
  return produceWithPatches(elements, (draft) => {
    if (draft[id]) {
      draft[id].deleted = true;
    } else {
      throw new Error(`Element with id ${id} does not exist.`);
    }
  });
};

const addElements = (elements: ElementMap, ...newElements: IShape[]) => {
  let nextElements = elements;
  let allPatches: Patch[] = [];
  let allInversePatches: Patch[] = [];

  for (const newElement of newElements) {
    const [updatedElements, patches, inversePatches] = add(
      nextElements,
      newElement
    );
    nextElements = updatedElements;
    allPatches = allPatches.concat(patches);
    allInversePatches = allInversePatches.concat(inversePatches);
  }

  const delta = new Delta(allPatches, allInversePatches.reverse());
  ee.emit('history', delta);
  return [nextElements, delta] as const;
};

const history = new History();
ee.on('history', (delta: Delta) => {
  history.record(delta);
});

let delta = new Delta([], []);

[elements, delta] = addElements(
  elements,
  {
    id: 'element-1',
    type: 'circle',
    color: 'red',
    deleted: false,
  },
  {
    id: 'element-2',
    type: 'circle',
    color: 'blue',
    deleted: false,
  }
);
console.log('After adding elements:', elements);
console.log('history:', history);

history.undo();
console.log('After undo add:', elements);
console.log('history:', history);

[elements, delta] = addElements(elements, {
  id: 'element-3',
  type: 'circle',
  color: 'red',
  deleted: false,
});

// history.redo();
console.log('After redo add:', elements);
console.log('history:', history);

history.undo();
console.log('After redo add:', elements);
console.log('history:', history);