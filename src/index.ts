import { assetEngine, initializeAssetEngine } from "./core/asset-engine-instance";
import { controls, initializeControls } from "./core/controls";
import { createGameStateMachine, gameStateMachine } from "./game-state-machine";
import { inLevel } from "./game-states/in-level";
import { menu } from "./game-states/menu.state";
import { gameOver } from "./game-states/game-over.state";
import { whiteNoiseLoading } from "./from-asset-engine/audio-initializer";
import { endOfLevel } from "./game-states/end-of-level.state";
import { initializeHud } from "./hud";
import { levelTransition } from "./game-states/level-transition.state";


window.onload = async () => {
  const canvas = document.querySelector<HTMLCanvasElement>('#c')!;
  await initializeAssetEngine(canvas);
  await whiteNoiseLoading;
  initializeHud();
  initializeControls();
  assetEngine.drawEngine.loadSpritesToSpriteCanvas();
  createGameStateMachine([
    {
      stateName: 'menu',
      onEnter: () => menu.onEnter(),
      onLeave: () => menu.onLeave(),
      onUpdate: () => menu.onUpdate(),
    },
    {
      stateName: 'in-level',
      onEnter: (levelNumber: number) => inLevel.onEnter(levelNumber),
      onLeave: () => inLevel.onLeave(),
      onUpdate: () => inLevel.onUpdate(),
    },
    {
      stateName: 'end-of-level',
      onEnter: (levelNumber: number) => endOfLevel.onEnter(levelNumber),
      onUpdate: () => endOfLevel.onUpdate(),
    },
    {
      stateName: 'game-over',
      onEnter: () => gameOver.onEnter(),
      onUpdate: () => gameOver.onUpdate(),
    },
    {
      stateName: 'level-transition',
      onEnter: (levelNumber: number) => levelTransition.onEnter(levelNumber),
      onUpdate: () => levelTransition.onUpdate(),
    },
  ]);

  gameStateMachine.setState('menu', 0, 19000);

  requestAnimationFrame(update);
}

let previousTime = 0;
const maxFps = 60;
const interval = 1000 / maxFps;

function update(currentTime: number) {
  const delta = currentTime - previousTime;

  if (delta >= interval || !previousTime) {
    previousTime = currentTime - (delta % interval);

    gameStateMachine.getState().onUpdate(currentTime);
  }
  requestAnimationFrame(update);
}
