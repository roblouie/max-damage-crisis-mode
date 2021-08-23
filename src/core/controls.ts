import { assetEngine } from "./asset-engine-instance";
import { Point } from "./point";

class Controls {
  _onClick?: (position: Point) => void;
  _onHover?: (position: Point) => void;

  constructor() {
    const canvas = assetEngine.drawEngine.getCanvas();
    //TODO: cleanup duplicate logic
    canvas.onclick = event => {
      const zoom = canvas.offsetWidth / canvas.width;
      const posX = event.offsetX / zoom;
      const posY = event.offsetY / zoom;
      if (this._onClick) {
        this._onClick({ x: posX, y: posY });
      }
    }
    canvas.onmousemove = event => {
      const zoom = canvas.offsetWidth / canvas.width;
      const posX = event.offsetX / zoom;
      const posY = event.offsetY / zoom;
      if (this._onHover) {
        this._onHover({ x: posX, y: posY });
      }
    }
  }

  onClick(clickCallback?: (position: Point) => void) {
    this._onClick = clickCallback;
  }

  onMouseMove(mouseOverCallback?: (position: Point) => void) {
    this._onHover = mouseOverCallback;
  }

  queryButtons() {
    const gamepad = navigator.getGamepads()[0];

    if (!gamepad) {
      return;
    }

    if (Math.abs(gamepad.axes[0]) >= 0.1 || Math.abs(gamepad.axes[1]) >= 0.1) {
      console.log(`X: ${gamepad.axes[0]}, Y: ${gamepad.axes[1]}`);
    }

    for (let i = 0; i < 4; i++) {
      if (gamepad.buttons[i].pressed) {
        console.log('Jump here');
      }
    }
  }
}

export let controls: Controls;
export function initializeControls() {
  controls = new Controls();
}
