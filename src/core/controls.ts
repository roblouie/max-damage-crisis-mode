import { assetEngine } from "./asset-engine-instance";
import { Point } from "./point";

class Controls {
  _onClick?: (position: Point) => void;
  _onHover?: (position: Point) => void;
  private touched = false;

  constructor() {
    const documentElement = document.querySelector('body')!;
    const canvas = assetEngine.drawEngine.canvas;
    const getScaledPosition = (x: number, y: number) => {
      const widthDifference = documentElement.offsetWidth - canvas.offsetWidth;
      const heightDifference = documentElement.offsetHeight - canvas.offsetHeight;
      const offsetXBy = widthDifference / 2;
      const offsetYBy = heightDifference / 2;
      const canvasScale = (canvas.offsetWidth / canvas.width) * assetEngine.drawEngine.getRenderMultiplier();
      const newX = (x - offsetXBy) / canvasScale;
      const newY = (y - offsetYBy) / canvasScale;
      return new Point(newX, newY);
    }

    documentElement.onclick = event => {
      if (this._onClick && !this.touched) {
        this._onClick(getScaledPosition(event.clientX, event.clientY));
      }
    }

    documentElement.ontouchstart = event => {
      this.touched = true;
      event.preventDefault();
      if (this._onClick) {
        this._onClick(getScaledPosition(event.touches[0].clientX, event.touches[0].clientY));
      }
    }

    documentElement.ontouchend = () => {
      setTimeout(() => this.touched = false, 10);
    }

    documentElement.onmousemove = event => {
      if (this._onHover) {
        this._onHover(getScaledPosition(event.clientX, event.clientY));
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
