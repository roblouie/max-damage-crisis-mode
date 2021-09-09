import { assetEngine } from "./asset-engine-instance";
import { Point } from "./point";

class Controls {
  _onClick?: (position: Point) => void;
  _onHover?: (position: Point) => void;

  constructor() {
    const canvas = assetEngine.drawEngine.canvas;
    const getScaledPosition = (x: number, y: number) => {
      const zoom = (canvas.offsetWidth / canvas.width) * assetEngine.drawEngine.getRenderMultiplier();
      return new Point(x/zoom, y/zoom);
    }

    canvas.onclick = event => {
      if (this._onClick) {
        this._onClick(getScaledPosition(event.offsetX, event.offsetY));
      }
    }

    canvas.ontouchstart = event => {
      if (this._onClick) {
        this._onClick(getScaledPosition(event.touches[0].clientX - canvas.offsetLeft, event.touches[0].clientY - canvas.offsetTop));
      }
      event.preventDefault();
    }

    canvas.onmousemove = event => {
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
}

export let controls: Controls;
export function initializeControls() {
  controls = new Controls();
}
