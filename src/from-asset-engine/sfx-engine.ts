import {SoundEffect} from "./sound-effect.model";
import {audioContext, whiteNoiseLoading} from "./audio-initializer";
import {SfxPitchInstruction} from "./sfx-pitch-instruction.model";
import {SfxGainInstruction} from "./sfx-gain-instruction.model";
import {SfxWidthInstruction} from "./sfx-width-instruction.model";

export class SfxEngine {
  ctx = audioContext;
  soundEffects: SoundEffect[];

  constructor(soundEffects: SoundEffect[]) {
    this.soundEffects = soundEffects;
  }

  async playEffect(effectIndex: number) {
    const soundEffect = this.soundEffects.find((effect, index) => index === effectIndex);
    if (!soundEffect || !this.ctx) {
      return;
    }

    await this.ctx.resume();
    const gainNode = new GainNode(this.ctx);
    gainNode.gain.value = 1;
    await whiteNoiseLoading;
    const whiteNoiseGainNode = new AudioWorkletNode(audioContext, 'white-noise-gain-processor');
    const whiteNoiseFrequency = whiteNoiseGainNode.parameters.get('changesPerSecond')!;
    const whiteNoiseCounterWidth = whiteNoiseGainNode.parameters.get('counterWidth')!;
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

    frequencies.forEach(freq => {
      pitchDurationInSeconds = 0;
      soundEffect.pitchInstructions.forEach((instruction: SfxPitchInstruction, index: number) => {
        pitchDurationInSeconds += instruction.durationInSeconds;
        if (index === 0){
          freq.setValueAtTime(instruction.pitch, audioContext.currentTime);
          freq.setValueAtTime(instruction.pitch, audioContext.currentTime + pitchDurationInSeconds);
          return;
        }
        if (instruction.isLinearRampTo) {
          freq.linearRampToValueAtTime(instruction.pitch, audioContext.currentTime + pitchDurationInSeconds);
        } else {
          freq.exponentialRampToValueAtTime(instruction.pitch, audioContext.currentTime + pitchDurationInSeconds);
        }
      });
    });

    oscillator.start();

    let totalGainTimePerChanel = [0, 0];
    let isSeven = true;

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
      return;
    });

    gainNodes.forEach(gain=> gain.gain.setValueAtTime(0, audioContext.currentTime + pitchDurationInSeconds));
  }
}



