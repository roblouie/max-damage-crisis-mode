enum Xbox360ControllerButtons {
  A,
  B,
  X,
  Y,
  LeftBumper,
  RightBumper,
  LeftTrigger,
  RightTrigger,
  Select,
  Start,
  L3,
  R3,
  DpadUp,
  DpadDown,
  DpadLeft,
  DpadRight,
}

class Controls {

  private _state = {
    isPressingLeft: false,
    isPressingRight: false,
    isPressingDown: false,
    isPressingUp: false,
    isPressingStart: false,
  }

  get state() {
    return this._state;
  }

  constructor() {
    document.addEventListener('keydown', event => this.handleKeyEvent(event.code, true));
    document.addEventListener('keyup', event => this.handleKeyEvent(event.code, false));
  }

  private handleKeyEvent(keyCode: string, isPressed: boolean) {
    if (keyCode === 'ArrowDown') {
      this._state.isPressingDown = isPressed;
    }

    if (keyCode === 'ArrowUp') {
      this._state.isPressingUp = isPressed;
    }

    if (keyCode === 'ArrowLeft') {
      this._state.isPressingLeft = isPressed;
    }

    if (keyCode === 'ArrowRight') {
      this._state.isPressingRight = isPressed;
    }

    if (keyCode === 'Enter') {
      this._state.isPressingStart = isPressed;
    }

  }

  queryButtons() {
    const gamepad = navigator.getGamepads()[0];

    if (!gamepad) {
      return;
    }

    this._state.isPressingLeft = gamepad.buttons[Xbox360ControllerButtons.DpadLeft].pressed;
    this._state.isPressingRight = gamepad.buttons[Xbox360ControllerButtons.DpadRight].pressed;
    this._state.isPressingUp = gamepad.buttons[Xbox360ControllerButtons.DpadUp].pressed;
    this._state.isPressingDown = gamepad.buttons[Xbox360ControllerButtons.DpadDown].pressed;

    this._state.isPressingStart = gamepad.buttons[Xbox360ControllerButtons.Start].pressed;
  }
}

export const controls = new Controls();