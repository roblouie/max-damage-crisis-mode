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
  isOnSatelite = true;
  isLeavingSatellite = true;
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
    return { x: this.position.x + 8, y: this.position.y + 12};
  }

  isJumping() {
    return this.stateMachine.getState().stateName === 'jumping';
  }

  isRespawning() {
    return this.stateMachine.getState().stateName === 'respawning';
  }

  private isOffScreen() {
    const center = this.getCenter();
    const isOffVertical = center.y < -56 || center.y > 376;
    const isOffHorizontal = center.x < -56 || center.x > 296;
    return isOffVertical || isOffHorizontal;
  }

  landOnEnemy(enemy: Enemy) {
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
    this.angle = 90;
  }

  onLandedEnter() {
    assetEngine.sfxEngine.playEffect(3);
    controls.onClick(position => {
      const angle = Point.AngleBetweenTwo(this.getCenter(), position);
      this.angle = angle
      this.jumpAngle = angle;
      this.stateMachine.setState('jumping');
    });

    controls.onMouseMove(position => {
      this.angle = Point.AngleBetweenTwo(this.getCenter(), position);
    });

    if (this.isOnSatelite) {
      this.frameSequencer = animationFrameSequencer([this.crouchFrame, this.standingFrame], 8);
    } else if (this.enemyAttachedTo) {
      this.frameSequencer = animationFrameSequencer([this.crouchFrame, this.plantFrame, this.crouchFrame], 7);
    }
  }

  onLandedUpdate() {
    this.enemyJumpingFrom = undefined;
    this.currentFrame = this.frameSequencer?.next().value;
    this.drawAtAngle();
    if (this.enemyAttachedTo) {
      this.position.x = this.enemyAttachedTo?.getCenter().x - 8;
      this.position.y = this.enemyAttachedTo?.getCenter().y - 15;
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
    this.position = { x: this.startX, y: this.startY + 40};
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
    } else {
      this.respawnScale = 1;
      this.stateMachine.setState('landed');
    }
    this.drawAtAngle();
  }

  onRespawningLeave() {
    this.isOnSatelite = true;
    this.isLeavingSatellite = true;
  }

  drawAtAngle() {
    assetEngine.drawEngine.drawSprite(this.currentFrame, this.getCenter(), this.respawnScale, this.angle, 16, 44, (this.angle > -90 && this.angle < 90) ? -1 : 1);
  }
}

export let player: Player;
export function initializePlayer() {
  player = new Player();
}
