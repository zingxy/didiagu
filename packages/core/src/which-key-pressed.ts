/**
 * @file which-key-pressing.ts
 * @description 检测键盘哪些按键被按下
 * @author HongQing Zeng
 * @date 2025-11-17
 * @version 1.0.0
 */

class KeyPressed {
  private pressedKeys: Set<string> = new Set();

  constructor() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  private onKeyDown = (e: KeyboardEvent) => {
    /**
     *@link https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key
     */
    this.pressedKeys.add(e.key);
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.pressedKeys.delete(e.key);
  };

  /** 检测指定的按键是否被按下 */
  public isPressed(key: string): boolean {
    return this.pressedKeys.has(key);
  }
  public get space() {
    return this.isPressed(' ');
  }
  public get shift() {
    return this.isPressed('Shift');
  }
  public get ctrl() {
    return this.isPressed('Control');
  }
  public get alt() {
    return this.isPressed('Alt');
  }
  public get meta() {
    return this.isPressed('Meta');
  }
}

export const keyPressed = new KeyPressed();
