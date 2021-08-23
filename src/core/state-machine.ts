export class StateMachine {
  private currentState: { stateName: string, onEnter?: Function, onUpdate: Function, onLeave?: Function };
  private states: { stateName: string, onEnter?: Function, onUpdate: Function, onLeave?: Function }[];

  constructor(states: { stateName: string, onEnter?: Function, onUpdate: Function, onLeave?: Function }[], initalState: string) {
    this.states = states;
    this.currentState = states.find(state => state.stateName === initalState)!;
    this.currentState.onEnter ? this.currentState.onEnter() : null;
  }

  setState(newState: string, enterArgs?: any) {
    this.currentState.onLeave ? this.currentState.onLeave() : null;
    this.currentState = this.states.find(state => state.stateName === newState)!;
    this.currentState.onEnter ? this.currentState.onEnter(enterArgs) : null;
  }

  getState() {
    return this.currentState;
  }
}
