import {SoundEffect} from "./sound-effect.model";
import {audioContext} from "./audio-initializer";
import {SfxPitchInstruction} from "./sfx-pitch-instruction.model";
import {SfxGainInstruction} from "./sfx-gain-instruction.model";
import {SfxWidthInstruction} from "./sfx-width-instruction.model";

export class SfxEngine {
  soundEffects: SoundEffect[];

  constructor(soundEffects: SoundEffect[]) {
    this.soundEffects = soundEffects;
  }

  async playEffect(effectIndex: number) {
    const soundEffect = this.soundEffects.find((effect, index) => index === effectIndex);
    if (!soundEffect || !audioContext) {
      return;
    }
    const gainNode = new GainNode(audioContext);
    gainNode.gain.value = 1;
    const whiteNoiseGainNode = new AudioWorkletNode(audioContext, 'wn');
    const whiteNoiseFrequency = whiteNoiseGainNode.parameters.get('freq')!;
    const whiteNoiseCounterWidth = whiteNoiseGainNode.parameters.get('width')!;
    whiteNoiseGainNode
      .connect(gainNode)
      .connect(audioContext.destination);

    const oscillator = new OscillatorNode(audioContext, { type: 'square' });
    const oscillatorGain = new GainNode(audioContext);
    oscillator.connect(oscillatorGain);
    oscillatorGain.connect(audioContext.destination);
    oscillatorGain.gain.value = 1;

    let pitchDurationInSeconds = 0;


    const frequencies = [oscillator.frequency, whiteNoiseFrequency];
    const gainNodes = [oscillatorGain, gainNode];

    frequencies.forEach((freq, frequencyIndex) => {
      const pitchDivider = frequencyIndex === 0 ? 1 : .3;
      pitchDurationInSeconds = 0;
      soundEffect.pitchInstructions.forEach((instruction: SfxPitchInstruction, index: number) => {
        pitchDurationInSeconds += instruction.durationInSeconds;
        if (index === 0){
          freq.setValueAtTime(instruction.pitch / pitchDivider, audioContext.currentTime);
          freq.setValueAtTime(instruction.pitch / pitchDivider, audioContext.currentTime + pitchDurationInSeconds);
          return;
        }
        if (instruction.isLinearRampTo) {
          freq.linearRampToValueAtTime(instruction.pitch / pitchDivider, audioContext.currentTime + pitchDurationInSeconds);
        } else {
          freq.exponentialRampToValueAtTime(instruction.pitch / pitchDivider, audioContext.currentTime + pitchDurationInSeconds);
        }
      });
    });

    let totalGainTimePerChanel = [0, 0];
    let isSeven = false;

    soundEffect.gainInstructions.forEach((instruction: SfxGainInstruction) => {
      const index = instruction.isWhiteNoise ? 1 : 0;
      gainNodes[index].gain.linearRampToValueAtTime(instruction.gain, audioContext.currentTime + totalGainTimePerChanel[index] + instruction.timeFromLastInstruction);
      totalGainTimePerChanel[index] += instruction.timeFromLastInstruction;
    });

    let secondsSinceWidthChange = 0;

    soundEffect.widthInstructions.forEach((instruction: SfxWidthInstruction) => {
      secondsSinceWidthChange += instruction.timeFromLastInstruction;
      whiteNoiseCounterWidth.setValueAtTime(isSeven ? 15 : 7,audioContext.currentTime + secondsSinceWidthChange);
      isSeven = !isSeven;
    });

    gainNodes.forEach(gain=> gain.gain.setValueAtTime(0, audioContext.currentTime + pitchDurationInSeconds));
    oscillator.start();
  }
}
