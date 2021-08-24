import { assetEngine } from "../core/asset-engine-instance";
import { StateMachine } from "../core/state-machine";
import { controls } from "../core/controls";
import { Point } from "../core/point";
import { Enemy } from "../enemies/enemy";

export class Player {
  private startX = 120;
  private startY = 280
  position = { x: this.startX, y: this.startY };
  width = 16;
  height = 16;
  isOnEnemy = false;
  enemyAttachedTo?: Enemy;
  angle = 90;
  stateMachine: StateMachine;
  speed = 1;
  jumpAngle = 0;

  constructor() {
    this.stateMachine = new StateMachine([
      {
        stateName: 'landed',
        onEnter: () => this.onLandedEnter(),
        onUpdate: () => this.onLandedUpdate(),
      },
      {
        stateName: 'jumping',
        onEnter: () => this.onJumpingEnter(),
        onUpdate: () => this.onJumpingUpdate(),
      },
      {
        stateName: 'respawning',
        onEnter: () => this.onRespawningEnter(),
        onUpdate: () => this.onRespawningUpdate(),
      }
    ], 'landed');
  }

  landOnEnemy(enemy: Enemy) {
    this.isOnEnemy = true;
    this.enemyAttachedTo = enemy;
    this.stateMachine.setState('landed');
  }

  isJumping() {
    return this.stateMachine.getState().stateName === 'jumping';
  }

  getRadius() {
    return this.width / 2;
  }

  getCenter() {
    return { x: this.position.x + (this.width / 2), y: this.position.y + (this.height / 2)};
  }

  update() {
    this.stateMachine.getState().onUpdate();
  }

  onLandedEnter() {
    controls.onClick(position => {
      this.jumpAngle = Point.AngleBetweenTwo(this.getCenter(), position);
      this.stateMachine.setState('jumping');
    });

    controls.onMouseMove(position => {
      this.angle = Point.AngleBetweenTwo(this.getCenter(), position);
    });
  }

  onLandedUpdate() {
    this.drawAtAngle(this.angle);
    if (this.isOnEnemy && this.enemyAttachedTo) {
      this.position.x = this.enemyAttachedTo?.position.x - this.getRadius();
      this.position.y = this.enemyAttachedTo?.position.y - this.getRadius();
    }
    if (this.isPlayerOffScreen()) {
      this.stateMachine.setState('respawning');
    }
  }


  onJumpingEnter() {
    controls.onMouseMove(undefined);
    controls.onClick(undefined);
    this.isOnEnemy = false;
  }

  onJumpingUpdate() {
    this.drawAtAngle(this.jumpAngle);

    this.position.x -= this.speed * Math.cos((this.jumpAngle) * Math.PI / 180);
    this.position.y -= this.speed * Math.sin((this.jumpAngle) * Math.PI / 180);
    if (this.isPlayerOffScreen()) {
      this.stateMachine.setState('respawning');
    }
  }

  onRespawningEnter() {
    // TODO: disable controls
    this.position = { x: this.startX, y: this.startY + 60}
  }

  onRespawningUpdate() {
    if (this.position.y > this.startY) {
      this.position.y -= 0.5;
      this.angle = 90
      this.drawAtAngle(this.angle);
    } else {
      this.stateMachine.setState('landed');
    }
  }

  drawAtAngle(angle: number) {
    const context = assetEngine.drawEngine.getContext();
    context.save();
    if (this.stateMachine.getState().stateName === 'respawning') {
      context.globalAlpha = 0.5;
    }
    const center = this.getCenter();
    context.translate(center.x, center.y);
    context.rotate((angle - 90) * Math.PI / 180);
    assetEngine.drawEngine.drawSprite(13, -this.width / 2, -this.height / 2);
    context.restore();
  }

  isPlayerOffScreen() {
    const pixelBuffer = 5
    const isOffVertical = this.position.y - pixelBuffer > assetEngine.drawEngine.getHeight()
      || this.position.y + this.height + pixelBuffer < 0;
    const isOffHorizontal = this.position.x - pixelBuffer > assetEngine.drawEngine.getScreenWidth()
      || this.position.x + this.width + pixelBuffer < 0;
    return isOffVertical || isOffHorizontal;
  }
}
