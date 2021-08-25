import {assetEngine} from "../core/asset-engine-instance";
import {StateMachine} from "../core/state-machine";

export class Satellite {
  private startX = 248;
  private startY = 540;
  position = { x: this.startX, y: this.startY };
  width = 16;
  height = 16;
  stateMachine: StateMachine;
  opacity = 1;
  isInvisible = false;

  constructor() {
    this.stateMachine = new StateMachine([
      {
        stateName: 'occupied',
        onUpdate: () => this.draw(),
      },
      {
        stateName: 'abandoned',
        onUpdate: () => this.onAbandonedUpdate(),
      },
    ], 'occupied');
  }

  update() {
    this.stateMachine.getState().onUpdate();
  }


  setPosition(position: { x: number, y: number }) {
    this.position = position;
  }

  private onAbandonedUpdate() {
    this.opacity -= .01;
    if (this.opacity <= 0) {
      this.isInvisible = true;
    }
    this.draw()
  }


  draw() {
    if (this.isInvisible) {
      return;
    }
    const context = assetEngine.drawEngine.getContext();
    context.save();
    if (this.stateMachine.getState().stateName === 'abandoned') {
      context.globalAlpha = this.opacity;
    }
    assetEngine.drawEngine.drawSprite(13, this.position.x, this.position.y);
    context.restore();
  }
}

