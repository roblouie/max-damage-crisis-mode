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
    const getScaledPosition = (x: number, y: number) => {
      const zoom = (canvas.offsetWidth / canvas.width) * assetEngine.drawEngine.getRenderMultiplier();
      return new Point(x/zoom, y/zoom);
    }

    canvas.onclick = (event: any) => {
      if (this._onClick) {
        this._onClick(getScaledPosition(event.offsetX, event.offsetY));
      }
    }

    canvas.ontouchstart = (event: any) => {
      if (this._onClick) {
        this._onClick(getScaledPosition(event.touches[0].clientX - canvas.offsetLeft, event.touches[0].clientY - canvas.offsetTop));
      }
      event.preventDefault();
    }

    canvas.onmousemove = (event: any) => {
      if (this._onHover) {
        this._onHover(getScaledPosition(event.offsetX, event.offsetY));
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
    }

    const { buttons } = gamepad;
    this.isJumpPressed = buttons[0].pressed || buttons[1].pressed || buttons[2].pressed || buttons[3].pressed;
  }
}

export let controls: Controls;
export function initializeControls() {
  controls = new Controls();
}
