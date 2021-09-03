import {SoundEffect} from "./sound-effect.model";
import {audioContext} from "./audio-initializer";
import {SfxPitchInstruction} from "./sfx-pitch-instruction.model";
import {SfxGainInstruction} from "./sfx-gain-instruction.model";
import {SfxWidthInstruction} from "./sfx-width-instruction.model";

export class SfxEngine {
  soundEffects: SoundEffect[];
  private masterGain= audioContext.createGain();
  isMuted = true;

  constructor(soundEffects: SoundEffect[]) {
    this.soundEffects = soundEffects;
    this.masterGain.connect(audioContext.destination);
    this.masterGain.gain.value = 0;
  }

  async playEffect(effectIndex: number) {
    const soundEffect = this.soundEffects.find((effect, index) => index === effectIndex);
    if (!soundEffect || !audioContext) {
      return;
    }
    const whiteNoiseGain = new GainNode(audioContext);
    whiteNoiseGain.gain.value = 1;
    const whiteNoiseGainNode = new AudioWorkletNode(audioContext, 'white-noise-gain-processor');
    const whiteNoiseFrequency = whiteNoiseGainNode.parameters.get('changesPerSecond')!;
    const whiteNoiseCounterWidth = whiteNoiseGainNode.parameters.get('counterWidth')!;
    whiteNoiseGainNode
      .connect(whiteNoiseGain)
      .connect(this.masterGain);

    const oscillator = new OscillatorNode(audioContext, { type: 'square' });
    const oscillatorGain = new GainNode(audioContext);
    oscillator
      .connect(oscillatorGain)
      .connect(this.masterGain);
    oscillatorGain.gain.value = 1;

    let pitchDurationInSeconds = 0;


    const frequencies = [oscillator.frequency, whiteNoiseFrequency];
    const gainNodes = [oscillatorGain, whiteNoiseGain];

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
    oscillator.start();
  }

  toggleMute() {
    if (this.isMuted) {
      this.masterGain.gain.value = .5;
      this.isMuted = false;
    } else {
      this.masterGain.gain.value = 0;
      this.isMuted = true;
    }
  }
}



