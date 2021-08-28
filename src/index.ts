import { assetEngine, initializeAssetEngine } from "./core/asset-engine-instance";
import { controls, initializeControls } from "./core/controls";
import { createGameStateMachine, gameStateMachine } from "./game-state-machine";
import { Game } from "./game-states/game";
import { startScreen } from "./game-states/start-screen";
import { menu } from "./game-states/menu";
import { gameOver } from "./game-states/game-over";
import { whiteNoiseLoading } from "./from-asset-engine/audio-initializer";


window.onload = async () => {
  const canvas = document.querySelector<HTMLCanvasElement>('#c')!;
  await initializeAssetEngine(canvas);
  initializeControls();
  await whiteNoiseLoading;
  assetEngine.drawEngine.loadSpritesToSpriteCanvas();
  const game = new Game();
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
      stateName: 'game',
      onEnter: () => game.onEnter(),
      onLeave: () => game.onLeave(),
      onUpdate: () => game.onUpdate(),
    },
    {
      stateName: 'game-over',
      onEnter: () => gameOver.onEnter(),
      onLeave: () => gameOver.onLeave(),
      onUpdate: () => gameOver.onUpdate(),
    }
  ], 'start-screen');

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
