import { assetEngine, initializeAssetEngine } from "./core/asset-engine-instance";
import { menu } from "./menu";
import { controls, initializeControls } from "./core/controls";
import { createGameStateMachine, gameStateMachine } from "./game-state-machine";
import { Game } from "./game";
import {startScreen} from "./start-screen";


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
    }
  ], 'start-screen');

  requestAnimationFrame(update);
}

function update(timeElapsed: number) {
  gameStateMachine.getState().onUpdate(timeElapsed);
  controls.queryButtons();
  requestAnimationFrame(update);
}

