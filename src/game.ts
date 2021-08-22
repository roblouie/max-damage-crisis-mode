import { State } from "./core/state";
import { assetEngine } from "./core/asset-engine-instance";
import { backgroundManager } from "./background-manager";

class Game implements State {
  posX = 0;
  posY = 0;

  vram: HTMLCanvasElement;
  vramContext: CanvasRenderingContext2D;

  constructor() {
    const vram = document.createElement('canvas');
    vram.setAttribute('id', 'background-vram');
    vram.setAttribute('width', '128');
    vram.setAttribute('height', '256');
    this.vramContext = vram.getContext('2d')!;
    this.vram = vram;
  }

  onEnter() {
    backgroundManager.loadBackgrounds(0);
    const canvas = assetEngine.drawEngine.getCanvas()
    canvas.onclick = event => {
      const zoom = canvas.offsetWidth / canvas.width;
      console.log(`X: ${event.offsetX / zoom}, Y: ${event.offsetY / zoom}`);
      this.posX = event.offsetX / zoom;
      this.posY = event.offsetY / zoom;
    }
  }

  onLeave() {
  }

  onUpdate(timeElapsed: number): void {
    assetEngine.drawEngine.clearContext();
    backgroundManager.updateBackgrounds(1);
    assetEngine.drawEngine.drawSprite(12, this.posX, this.posY);
  }

}

export const game = new Game();
