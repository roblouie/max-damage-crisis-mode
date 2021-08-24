import { State } from "./core/state";
import { assetEngine } from "./core/asset-engine-instance";
import { backgroundManager } from "./background-manager";
import { Enemy } from "./enemies/enemy";
import { Player } from "./player/player";
import { controls } from "./core/controls";
import { Point } from "./core/point";

export class Game implements State {
  player = new Player();

  enemies = [new Enemy(40, -40), new Enemy(200,-90), new Enemy(100, -20)];

  onEnter() {
    backgroundManager.loadBackgrounds(0);
    assetEngine.musicEngine.startSong(1);
    this.player = new Player();
  }


  onLeave() {
  }

  onUpdate(): void {
    assetEngine.drawEngine.clearContext();
    backgroundManager.updateBackgrounds();

    this.player.update();
    this.enemies.forEach(enemy => enemy.update());

    if (this.player.isJumping()) {
      this.enemies.forEach(enemy => {
        if (enemy !== this.player.enemyAttachedTo && Point.DistanceBetweenTwo(enemy.position, this.player.position) <= enemy.size) {
          this.player.landOnEnemy(enemy);
        }
      });
    }
  }
}
