import {SfxPitchInstruction} from "./sfx-pitch-instruction.model";
import {SfxWidthInstruction} from "./sfx-width-instruction.model";
import {SfxGainInstruction} from "./sfx-gain-instruction.model";


export class SoundEffect {
  pitchInstructions: SfxPitchInstruction[];
  widthInstructions: SfxWidthInstruction[];
  gainInstructions: SfxGainInstruction[];

  constructor(pitchInstructions: SfxPitchInstruction[], widthInstructions: SfxWidthInstruction[], gainInstructions: SfxGainInstruction[]) {
    this.pitchInstructions = pitchInstructions;
    this.widthInstructions = widthInstructions;
    this.gainInstructions = gainInstructions;
  }
}