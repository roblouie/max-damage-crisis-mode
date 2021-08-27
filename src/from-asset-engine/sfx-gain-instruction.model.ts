export interface SfxGainInstruction {
  gain: number;
  isWhiteNoise: boolean;
  timeFromLastInstruction: number;
}