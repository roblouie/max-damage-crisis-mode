import { assetEngine } from "./asset-engine-instance";
import { Point } from "./point";

class Controls {
  _onClick?: (position: Point) => void;
  _onHover?: (position: Point) => void;

  isAnalogStickPressed = false;
  analogStickAngle = 0;
  isJumpPressed = false;

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

    canvas.ontouchstart = event => {
      const zoom = canvas.offsetWidth / canvas.width;
      const posX = (event.touches[0].clientX - canvas.offsetLeft) / zoom;
      const posY = (event.touches[0].clientY - canvas.offsetTop) / zoom;
      if (this._onClick) {
        this._onClick({ x: posX, y: posY });
      }
      event.preventDefault();
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
      this.isAnalogStickPressed = true;
      this.analogStickAngle = Point.AngleBetweenTwo({x: 0, y: 0}, {x: gamepad.axes[0], y: gamepad.axes[1]});
      console.log(this.analogStickAngle);
    }

    const { buttons } = gamepad;
    this.isJumpPressed = buttons[0].pressed || buttons[1].pressed || buttons[2].pressed || buttons[3].pressed;

  }
}

export let controls: Controls;
export function initializeControls() {
  controls = new Controls();
}
