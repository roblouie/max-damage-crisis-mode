import { initializeAssetEngine } from "./core/asset-engine-instance";
import { createStateMachine, stateMachine } from "./core/state-machine";
import { menu } from "./menu";
import { game } from "./game";
import { controls } from "./core/controls";

window.onload = async () => {
  const context = document.querySelector('canvas')!.getContext('2d')!;
  await initializeAssetEngine(context);
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
  controls.queryButtons();
  stateMachine.getState().onUpdate(timeElapsed);
  requestAnimationFrame(update);
}

