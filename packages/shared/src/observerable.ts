export interface Observer<T> {
  /**
   * @description 数据更新后的回调方法
   * @param data
   */
  _receiveUpdate(data: T): void;
}

/**
 * 创建深度响应式代理对象，支持嵌套属性监听和批量更新
 * @param data 要代理的对象
 * @param observer 观察者对象，包含 _receiveUpdate 回调
 * @returns 深度代理后的对象
 */
export const createObserverable = <T extends object>(
  data: T,
  observer: Observer<T>
) => {
  // let pendingUpdate = false;

  /**
   * 触发更新（默认批量，使用 Promise.resolve 合并同步修改）
   */
  const triggerUpdate = (root: T) => {
    // if (pendingUpdate) return;

    // pendingUpdate = true;
    // Promise.resolve().then(() => {
      // pendingUpdate = false;
      observer._receiveUpdate(root);
    // });
  };

  /**
   * 深度代理函数：递归代理所有嵌套对象
   */
  const createDeepProxy = <V extends object>(
    target: V,
    root: T,
    path: string[] = []
  ): V => {
    // 如果已经是代理对象，直接返回
    if (target && typeof target === 'object' && '__isProxy__' in target) {
      return target;
    }

    return new Proxy(target, {
      get(obj, prop: string | symbol) {
        // 标记为代理对象
        if (prop === '__isProxy__') {
          return true;
        }

        const value = obj[prop as keyof V];

        // 如果值是对象或数组，递归代理
        if (value && typeof value === 'object') {
          return createDeepProxy(value as object as V, root, [
            ...path,
            String(prop),
          ]);
        }

        return value;
      },

      set(obj, prop: string | symbol, value) {
        const oldValue = obj[prop as keyof V];

        // 值没有变化，不触发更新
        if (oldValue === value) {
          return true;
        }

        // 如果新值是对象，需要代理它
        if (value && typeof value === 'object') {
          obj[prop as keyof V] = createDeepProxy(value as object as V, root, [
            ...path,
            String(prop),
          ]) as V[keyof V];
        } else {
          obj[prop as keyof V] = value;
        }

        // 触发更新
        triggerUpdate(root);
        return true;
      },

      deleteProperty(obj, prop: string | symbol) {
        if (prop in obj) {
          delete obj[prop as keyof V];
          triggerUpdate(root);
        }
        return true;
      },
    });
  };

  // 初始化：深度代理初始数据
  const proxiedData = createDeepProxy(data, data);

  return proxiedData;
};
