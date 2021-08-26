import { assetEngine } from "../core/asset-engine-instance";
import { StateMachine } from "../core/state-machine";
import { controls } from "../core/controls";
import { Point } from "../core/point";
import { Enemy } from "../enemies/enemy";

export class Player {
  private startX = 480;
  private startY = 1080;
  position = { x: this.startX, y: this.startY };
  width = 16;
  height = 16;
  isOnSatelite = true;
  isOnEnemy = false;
  enemyAttachedTo?: Enemy;
  angle = 90;
  stateMachine: StateMachine;
  speed = 10.5;
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

  update() {
    this.stateMachine.getState().onUpdate();
  }

  getRadius() {
    return this.width / 2;
  }

  getCenter() {
    return { x: this.position.x + (this.width / 2), y: this.position.y + (this.height / 2)};
  }

  isJumping() {
    return this.stateMachine.getState().stateName === 'jumping';
  }

  isRespawning() {
    return this.stateMachine.getState().stateName === 'respawning';
  }

  private isPlayerOffScreen() {
    const pixelBuffer = this.getRadius() + 100;
    const center = this.getCenter();
    const isOffVertical = center.y - pixelBuffer > assetEngine.drawEngine.getHeight()
      || center.y + this.height + pixelBuffer < 0;
    const isOffHorizontal = center.x - pixelBuffer > assetEngine.drawEngine.getScreenWidth()
      || center.x + this.width + pixelBuffer < 0;
    return isOffVertical || isOffHorizontal;
  }


  landOnEnemy(enemy: Enemy) {
    this.isOnEnemy = true;
    this.enemyAttachedTo = enemy;
    this.stateMachine.setState('landed');
  }

  landOnSatellite() {
    this.isOnSatelite = true;
    this.stateMachine.setState('landed');
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

    if (controls.isAnalogStickPressed) {
      this.angle = controls.analogStickAngle;
    }

    if (controls.isJumpPressed) {
      this.jumpAngle = this.angle;
      this.stateMachine.setState('jumping');
    }

    // if (this.isOnSatelite) {
    //   this.position.x = this.startX;
    //   this.position.y = this.startY;
    // }

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
    this.position = { x: this.startX, y: this.startY + 60}
    this.isOnEnemy = false;
    this.enemyAttachedTo = undefined;
    controls.onClick(undefined)
    controls.onMouseMove(undefined);
  }

  onRespawningUpdate() {
    if (this.position.y > this.startY) {
      this.position.y -= 0.5;
      this.angle = 90;
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
    assetEngine.drawEngine.drawSprite(12, -this.width / 2, -this.height / 2);
    context.restore();
  }
}
