import {
  produce,
  produceWithPatches,
  enablePatches,
  applyPatches,
} from 'immer';
enablePatches();

interface IShape {
  id: string;
  type: 'circle' | 'rectangle';
  width: number;
  height: number;
  deleted?: boolean;
}

type ElementMap = Record<string, IShape>;
let elements: ElementMap = {};

const add = (elements: ElementMap, newElement: IShape) => {
  /* 对于add操作， 我们将其分解为两个步骤：
   * 1. 先添加一个deleted状态为true的元素（表示删除）
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

const inverse = [];
let patches, inversePatches;
[elements, patches, inversePatches] = add(elements, {
  id: 'shape-1',
  type: 'rectangle',
  width: 100,
  height: 200,
});

inverse.push(...inversePatches);
console.log('patchers add', patches, inversePatches);
console.log('elements', elements);

[elements, patches, inversePatches] = remove(elements, 'shape-1');
inverse.push(...inversePatches);
console.log('patchers remove', patches, inversePatches);
console.log('elements', elements);

[elements, patches, inversePatches] = add(elements, {
  id: 'shape-2',
  type: 'circle',
  width: 100,
  height: 200,
});

inverse.push(...inversePatches);
console.log('patchers add', patches, inversePatches);
console.log('elements', elements);

elements = applyPatches(elements, inverse.reverse());
console.log('elements after inverse', elements);
