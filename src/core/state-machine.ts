export let stateMachine: StateMachine;

export function createStateMachine(states: { stateName: string, onEnter: Function, onUpdate: Function, onLeave: Function }[], initalState: string) {
  stateMachine = new StateMachine(states, initalState);
}

class StateMachine {
  private currentState: { stateName: string, onEnter: Function, onUpdate: Function, onLeave: Function };
  private states: { stateName: string, onEnter: Function, onUpdate: Function, onLeave: Function }[];

  constructor(states: { stateName: string, onEnter: Function, onUpdate: Function, onLeave: Function }[], initalState: string) {
    this.states = states;
    this.currentState = states.find(state => state.stateName === initalState)!;
    this.currentState.onEnter();
  }

  setState(newState: string) {
    this.currentState.onLeave();
    this.currentState = this.states.find(state => state.stateName === newState)!;
    this.currentState.onEnter();
  }

  getState() {
    return this.currentState;
  }
}
