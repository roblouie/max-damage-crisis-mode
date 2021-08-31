import { assetEngine } from "../core/asset-engine-instance";
import { StateMachine } from "../core/state-machine";
import { controls } from "../core/controls";
import { Point } from "../core/point";
import { Enemy } from "../enemies/enemy";

class Player {
  readonly startX = 120;
  readonly startY = 260;
  position = { x: this.startX, y: this.startY };
  width = 16;
  height = 20;
  isOnSatelite = true;
  isLeavingSatellite = true;
  isOnEnemy = false;
  enemyAttachedTo?: Enemy;
  angle = 90;
  stateMachine: StateMachine;
  speed = 3.7;
  jumpAngle = 0;
  respawnScale = 1;

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
        onLeave: () => this.onRespawningLeave(),
      }
    ]);
    this.stateMachine.setState('landed');
  }

  update() {
    this.stateMachine.getState().onUpdate();
  }

  getRadius() {
    return this.width / 2;
  }

  getCenter() {
    return { x: this.position.x + (this.width / 2), y: this.position.y + 12};
  }

  isJumping() {
    return this.stateMachine.getState().stateName === 'jumping';
  }

  isRespawning() {
    return this.stateMachine.getState().stateName === 'respawning';
  }

  private isOffScreen() {
    const pixelBuffer = this.getRadius() + 100;
    const center = this.getCenter();
    const renderMultiplier = assetEngine.drawEngine.getRenderMultiplier();
    const isOffVertical = center.y - pixelBuffer > (assetEngine.drawEngine.getScreenHeight() / renderMultiplier)
      || center.y + this.height + pixelBuffer < 0;
    const isOffHorizontal = center.x - pixelBuffer > (assetEngine.drawEngine.getScreenWidth() / renderMultiplier)
      || center.x + this.width + pixelBuffer < 0;
    return isOffVertical || isOffHorizontal;
  }


  landOnEnemy(enemy: Enemy) {
    this.isOnEnemy = true;
    this.enemyAttachedTo = enemy;
    this.stateMachine.setState('landed');
    this.isLeavingSatellite = false;
  }

  landOnSatellite() {
    this.isOnSatelite = true;
    this.isLeavingSatellite = true;
    this.stateMachine.setState('landed');
  }

  onLandedEnter() {
    assetEngine.sfxEngine.playEffect(3);
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
      this.position.x = this.enemyAttachedTo?.getCenter().x - this.getRadius();
      this.position.y = this.enemyAttachedTo?.getCenter().y - this.getRadius();
    }

    if (controls.isAnalogStickPressed) {
      this.angle = controls.analogStickAngle;
    }

    if (controls.isJumpPressed) {
      this.jumpAngle = this.angle;
      this.stateMachine.setState('jumping');
    }

    if (this.isOnSatelite) {
      this.position.x = this.startX;
      this.position.y = this.startY;
    }

    if (this.isOffScreen()) {
      this.stateMachine.setState('respawning');
    }
  }


  onJumpingEnter() {
    assetEngine.sfxEngine.playEffect(2);
    controls.onMouseMove(undefined);
    controls.onClick(undefined);
    this.isOnEnemy = false;
    this.isOnSatelite = false;
  }

  onJumpingUpdate() {
    this.drawAtAngle(this.jumpAngle);

    this.position.x -= this.speed * Math.cos((this.jumpAngle) * Math.PI / 180);
    this.position.y -= this.speed * Math.sin((this.jumpAngle) * Math.PI / 180);
    if (this.isOffScreen()) {
      this.stateMachine.setState('respawning');
    }
  }

  onRespawningEnter() {
    this.position = { x: this.startX, y: this.startY + 40}
    this.isOnEnemy = false;
    this.enemyAttachedTo = undefined;
    this.respawnScale = 0;
    controls.onClick(undefined)
    controls.onMouseMove(undefined);
  }

  onRespawningUpdate() {
    if (this.position.y > this.startY) {
      this.position.y -= 0.6;
      this.respawnScale += 0.015;
      this.angle = 90;
      this.drawAtAngle(this.angle);
    } else {
      this.drawAtAngle(this.angle);
      this.respawnScale = 1;
      this.stateMachine.setState('landed');
    }
  }

  onRespawningLeave() {
    this.isOnSatelite = true;
    this.isLeavingSatellite = true;
  }

  drawAtAngle(angle: number) {
    const context = assetEngine.drawEngine.getContext();
    context.save();
    const center = this.getCenter();
    context.scale(4, 4);
    context.translate(center.x, center.y);
    context.rotate((angle - 90) * Math.PI / 180);
    context.scale(1/4 * this.respawnScale, 1/4 * this.respawnScale);
    assetEngine.drawEngine.drawSprite(3, -this.width / 2, -22);
    context.restore();

    // DEBUG
    // context.save();
    // context.fillStyle = 'blue';
    // context.beginPath();
    // context.scale(4, 4);
    // context.arc(this.getCenter().x, this.getCenter().y, this.getRadius(), 0, 2 * Math.PI);
    // context.stroke();
    // context.fill();
    // context.restore();
  }
}

export let player: Player;
export function initializePlayer() {
  player = new Player();
}
