import { assetEngine } from "../core/asset-engine-instance";
import { StateMachine } from "../core/state-machine";
import { controls } from "../core/controls";
import { Point } from "../core/point";
import { Enemy } from "../enemies/enemy";
import { animationFrameSequencer } from "../core/animation-frame-sequencer";

class Player {
  readonly startX = 112;
  readonly startY = 272;
  position = { x: this.startX, y: this.startY };
  width = 16;
  radius = 8;
  height = 20;
  isOnSatelite = true;
  isLeavingSatellite = true;
  isOnEnemy = false;
  enemyAttachedTo?: Enemy;
  enemyJumpingFrom?: Enemy;
  angle = 90;
  stateMachine: StateMachine;
  speed = 3.9;
  jumpAngle = 0;
  respawnScale = 1;
  standingFrame = 2;
  jumpingFrame = 3;
  plantFrame = 4;
  crouchFrame = 1;
  currentFrame = this.standingFrame;
  frameSequencer?: Generator<number>;

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
    this.stateMachine.setState('respawning');
  }

  update() {
    this.stateMachine.getState().onUpdate();
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
    const pixelBuffer = this.radius + 40;
    const center = this.getCenter();
    const isOffVertical = center.y - pixelBuffer > (assetEngine.drawEngine.getRenderHeight())
      || center.y + this.height + pixelBuffer < 0;
    const isOffHorizontal = center.x - pixelBuffer > (assetEngine.drawEngine.getRenderWidth())
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
    this.enemyAttachedTo = undefined;
    this.isOnSatelite = true;
    this.isLeavingSatellite = true;
    this.currentFrame = this.standingFrame;
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

    if (this.isOnSatelite) {
      this.frameSequencer = animationFrameSequencer([this.crouchFrame, this.standingFrame], 8);
    } else if (this.isOnEnemy) {
      this.frameSequencer = animationFrameSequencer([this.crouchFrame, this.plantFrame, this.crouchFrame], 7);
    }
  }

  onLandedUpdate() {
    this.enemyJumpingFrom = undefined;
    this.currentFrame = this.frameSequencer?.next().value;
    this.drawAtAngle();
    if (this.isOnEnemy && this.enemyAttachedTo) {
      this.position.x = this.enemyAttachedTo?.getCenter().x - this.radius;
      this.position.y = this.enemyAttachedTo?.getCenter().y - this.radius;
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
    this.currentFrame = this.jumpingFrame;
    assetEngine.sfxEngine.playEffect(2);
    controls.onMouseMove(undefined);
    controls.onClick(undefined);
    this.isOnEnemy = false;
    this.isOnSatelite = false;
    this.enemyJumpingFrom = this.enemyAttachedTo;
  }

  onJumpingUpdate() {
    this.drawAtAngle();

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
      this.position.y -= 0.9;
      this.respawnScale += 0.025;
      this.angle = 90;
      this.drawAtAngle();
    } else {
      this.drawAtAngle();
      this.respawnScale = 1;
      this.stateMachine.setState('landed');
    }
  }

  onRespawningLeave() {
    this.isOnSatelite = true;
    this.isLeavingSatellite = true;
  }

  drawAtAngle() {
    assetEngine.drawEngine.drawSpriteBetter(this.currentFrame, this.getCenter(), this.respawnScale, this.angle, 16, 44);
  }
}

export let player: Player;
export function initializePlayer() {
  player = new Player();
}
