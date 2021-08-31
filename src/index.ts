import { assetEngine, initializeAssetEngine } from "./core/asset-engine-instance";
import { controls, initializeControls } from "./core/controls";
import { createGameStateMachine, gameStateMachine } from "./game-state-machine";
import { inLevel } from "./game-states/in-level";
import { startScreen } from "./game-states/start-screen.state";
import { menu } from "./game-states/menu.state";
import { gameOver } from "./game-states/game-over.state";
import { whiteNoiseLoading } from "./from-asset-engine/audio-initializer";
import { endOfLevel } from "./game-states/end-of-level.state";
import { initializeHud } from "./hud";
import { initializePlayer } from "./player/player";
import { levelTransition } from "./game-states/level-transition.state";


window.onload = async () => {
  const canvas = document.querySelector<HTMLCanvasElement>('#c')!;
  await initializeAssetEngine(canvas);
  await whiteNoiseLoading;
  initializeHud();
  initializeControls();
  initializePlayer();
  assetEngine.drawEngine.loadSpritesToSpriteCanvas();
  createGameStateMachine([
    {
      stateName: 'start-screen',
      onEnter: () => startScreen.onEnter(),
      onLeave: () => startScreen.onLeave(),
      onUpdate: () => startScreen.onUpdate(),
    },
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
      onEnter: (levelNumber: number, levelTime: number) => endOfLevel.onEnter(levelNumber, levelTime),
      onLeave: () => endOfLevel.onLeave(),
      onUpdate: () => endOfLevel.onUpdate(),
    },
    {
      stateName: 'game-over',
      onEnter: () => gameOver.onEnter(),
      onLeave: () => gameOver.onLeave(),
      onUpdate: () => gameOver.onUpdate(),
    },
    {
      stateName: 'level-transition',
      onEnter: (levelNumber: number) => levelTransition.onEnter(levelNumber),
      onLeave: () => levelTransition.onLeave(),
      onUpdate: () => levelTransition.onUpdate(),
    }
  ]);

  gameStateMachine.setState('start-screen', 0, 19000);

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
    controls.queryButtons();
  }
  requestAnimationFrame(update);
}
