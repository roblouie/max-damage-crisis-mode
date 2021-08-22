import { assetEngine, initializeAssetEngine } from "./core/asset-engine-instance";
import { createStateMachine, stateMachine } from "./core/state-machine";
import { menu } from "./menu";
import { game } from "./game";

window.onload = async () => {
  const canvas = document.querySelector<HTMLCanvasElement>('#c')!;
  await initializeAssetEngine(canvas);
  assetEngine.drawEngine.loadSpritesToSpriteCanvas();
  createStateMachine([
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
      onUpdate: (timeElapsed: number) => game.onUpdate(timeElapsed),
    }
  ], 'menu');

  requestAnimationFrame(update);
}

function update(timeElapsed: number) {
  stateMachine.getState().onUpdate(timeElapsed);
  requestAnimationFrame(update);
}

