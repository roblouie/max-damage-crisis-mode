import { assetEngine } from "../core/asset-engine-instance";
import { StateMachine } from "../core/state-machine";
import { controls } from "../core/controls";
import { Point } from "../core/point";
import { Enemy } from "../enemies/enemy";

export class Player {
  position = { x: 120, y: 280 };
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

  onJumpingEnter() {
    controls.onMouseMove(undefined);
    controls.onClick(undefined);
    this.isOnEnemy = false;
  }

  onLandedUpdate() {
    this.drawAtAngle(this.angle);
    if (this.isOnEnemy && this.enemyAttachedTo) {
      this.position.x = this.enemyAttachedTo?.position.x;
      this.position.y = this.enemyAttachedTo?.position.y;
    }
  }

  onJumpingUpdate() {
    this.drawAtAngle(this.jumpAngle);

    this.position.x -= this.speed * Math.cos((this.angle) * Math.PI / 180);
    this.position.y -= this.speed * Math.sin((this.angle) * Math.PI / 180);
  }

  drawAtAngle(angle: number) {
    const context = assetEngine.drawEngine.getContext();
    context.save();
    const center = this.getCenter();
    context.translate(center.x, center.y);
    context.rotate((angle - 90) * Math.PI / 180);
    assetEngine.drawEngine.drawSprite(12, -this.width / 2, -this.height / 2);
    context.restore();
  }
}