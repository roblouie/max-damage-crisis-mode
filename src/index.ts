import { assetEngine, initializeAssetEngine } from "./core/asset-engine-instance";
import { menu } from "./menu";
import { controls, initializeControls } from "./core/controls";
import { createGameStateMachine, gameStateMachine } from "./game-state-machine";
import { Game } from "./game";
import {startScreen} from "./start-screen";
import {gameOver} from "./game-over";


window.onload = async () => {
  const canvas = document.querySelector<HTMLCanvasElement>('#c')!;
  await initializeAssetEngine(canvas);
  initializeControls();
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
  ], 'game');

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

