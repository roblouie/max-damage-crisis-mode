export class StateMachine {
  private currentState: { stateName: string, onEnter?: Function, onUpdate: Function, onLeave?: Function };
  private states: { stateName: string, onEnter?: Function, onUpdate: Function, onLeave?: Function }[];

  constructor(states: { stateName: string, onEnter?: Function, onUpdate: Function, onLeave?: Function }[]) {
    this.states = states;
    this.currentState = states[0];
  }

  setState(newState: string, ...enterArgs: any) {
    this.currentState.onLeave ? this.currentState.onLeave() : null;
    this.currentState = this.states.aFind(state => state.stateName === newState)!;
    this.currentState.onEnter ? this.currentState.onEnter(...enterArgs) : null;
  }

  getState() {
    return this.currentState;
  }
}
