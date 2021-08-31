import { StateMachine } from "./core/state-machine";

export let gameStateMachine: StateMachine;

export function createGameStateMachine(states: { stateName: string, onEnter: Function, onUpdate: Function, onLeave: Function }[]) {
  gameStateMachine = new StateMachine(states);
}