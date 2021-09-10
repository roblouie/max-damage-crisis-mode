import {SoundEffect} from "./sound-effect.model";
import {audioContext, masterGainNode} from "./audio-initializer";
import {SfxPitchInstruction} from "./sfx-pitch-instruction.model";
import {SfxGainInstruction} from "./sfx-gain-instruction.model";
import { SfxWidthInstruction } from "./sfx-width-instruction.model";

class EffectPlayer {
  gainNode: GainNode;
  oscillator: OscillatorNode;
  whiteNoise: AudioWorkletNode;
  whiteNoiseGain: GainNode;

  constructor(sfxGain: GainNode) {
    this.gainNode = new GainNode(audioContext, { gain: 0 });
    this.whiteNoiseGain = new GainNode(audioContext, { gain: 0 });

    this.oscillator = new OscillatorNode(audioContext, { type: 'square' });
    this.whiteNoise = new AudioWorkletNode(audioContext, 'wn');

    this.oscillator
      .connect(this.gainNode)
      .connect(sfxGain);

    this.whiteNoise
      .connect(this.whiteNoiseGain)
      .connect(sfxGain);

    this.oscillator.start();
  }

  play(soundEffect: SoundEffect) {
    this.gainNode.gain.value = 1;
    this.whiteNoiseGain.gain.value = 1;

    const frequencies = [this.oscillator.frequency, this.whiteNoise.parameters.get('freq')!];
    let pitchDurationInSeconds = 0;

    frequencies.forEach((freq, frequencyIndex) => {
      pitchDurationInSeconds = 0;
      soundEffect.pitchInstructions.forEach((instruction: SfxPitchInstruction, index: number) => {
        const pitch = frequencyIndex === 0 ? instruction.pitch : (instruction.pitch / .3)
        pitchDurationInSeconds += instruction.durationInSeconds;
        if (index === 0){
          freq.setValueAtTime(pitch, audioContext.currentTime);
        }
        freq[instruction.isLinearRampTo ? 'linearRampToValueAtTime' : 'exponentialRampToValueAtTime'](pitch, audioContext.currentTime + pitchDurationInSeconds)
      });
    });

    let secondsSinceWidthChange = 0;
    let isSeven = false;

    soundEffect.widthInstructions.forEach((instruction: SfxWidthInstruction) => {
      secondsSinceWidthChange += instruction.timeFromLastInstruction;
      this.whiteNoise.parameters.get('width')!.setValueAtTime(isSeven ? 15 : 7,audioContext.currentTime + secondsSinceWidthChange);
      isSeven = !isSeven;
    });

    const totalGainTimePerChanel = [0, 0];

    soundEffect.gainInstructions.forEach((instruction: SfxGainInstruction) => {
      if (instruction.isWhiteNoise) {
        this.whiteNoiseGain.gain.linearRampToValueAtTime(instruction.gain, audioContext.currentTime + totalGainTimePerChanel[0] + instruction.timeFromLastInstruction);
        totalGainTimePerChanel[0] += instruction.timeFromLastInstruction;
      } else {
        this.gainNode.gain.linearRampToValueAtTime(instruction.gain, audioContext.currentTime + totalGainTimePerChanel[1] + instruction.timeFromLastInstruction);
        totalGainTimePerChanel[1] += instruction.timeFromLastInstruction;

      }
    });

    this.gainNode.gain.setValueAtTime(0, audioContext.currentTime + pitchDurationInSeconds);
    this.whiteNoiseGain.gain.setValueAtTime(0, audioContext.currentTime + pitchDurationInSeconds);
  }
}

export class SfxEngine {
  soundEffects: SoundEffect[];
  private sfxGain = new GainNode(audioContext, { gain: 0.8 })
  gainNode: GainNode;
  oscillator: OscillatorNode;
  whiteNoise: AudioWorkletNode;
  whiteNoiseGain: GainNode;
  effectPlayers: EffectPlayer[];

  constructor(soundEffects: SoundEffect[]) {
    this.soundEffects = soundEffects;
    this.sfxGain.connect(masterGainNode);
    this.gainNode = new GainNode(audioContext, { gain: 0 });
    this.whiteNoiseGain = new GainNode(audioContext, { gain: 0 });

    this.oscillator = new OscillatorNode(audioContext, { type: 'square' });
    this.whiteNoise = new AudioWorkletNode(audioContext, 'wn');

    this.oscillator
      .connect(this.gainNode)
      .connect(this.sfxGain);

    this.whiteNoise
      .connect(this.whiteNoiseGain)
      .connect(this.sfxGain);

    this.oscillator.start();
  }

  async playEffect(effectIndex: number) {
    const soundEffect = this.soundEffects[effectIndex];
    this.gainNode.gain.value = 1;
    this.whiteNoiseGain.gain.value = 1;

    const frequencies = [this.oscillator.frequency, this.whiteNoise.parameters.get('freq')!];
    let pitchDurationInSeconds = 0;

    frequencies.forEach((freq, frequencyIndex) => {
      pitchDurationInSeconds = 0;
      soundEffect.pitchInstructions.forEach((instruction: SfxPitchInstruction, index: number) => {
        const pitch = frequencyIndex === 0 ? instruction.pitch : (instruction.pitch / .3)
        pitchDurationInSeconds += instruction.durationInSeconds;
        if (index === 0){
          freq.setValueAtTime(pitch, audioContext.currentTime);
        }
        freq[instruction.isLinearRampTo ? 'linearRampToValueAtTime' : 'exponentialRampToValueAtTime'](pitch, audioContext.currentTime + pitchDurationInSeconds)
      });
    });

    let secondsSinceWidthChange = 0;
    let isSeven = false;

    soundEffect.widthInstructions.forEach((instruction: SfxWidthInstruction) => {
      secondsSinceWidthChange += instruction.timeFromLastInstruction;
      this.whiteNoise.parameters.get('width')!.setValueAtTime(isSeven ? 15 : 7,audioContext.currentTime + secondsSinceWidthChange);
      isSeven = !isSeven;
    });

    const totalGainTimePerChanel = [0, 0];

    soundEffect.gainInstructions.forEach((instruction: SfxGainInstruction) => {
      if (instruction.isWhiteNoise) {
        this.whiteNoiseGain.gain.linearRampToValueAtTime(instruction.gain, audioContext.currentTime + totalGainTimePerChanel[0] + instruction.timeFromLastInstruction);
        totalGainTimePerChanel[0] += instruction.timeFromLastInstruction;
      } else {
        this.gainNode.gain.linearRampToValueAtTime(instruction.gain, audioContext.currentTime + totalGainTimePerChanel[1] + instruction.timeFromLastInstruction);
        totalGainTimePerChanel[1] += instruction.timeFromLastInstruction;

      }
    });

    this.gainNode.gain.setValueAtTime(0, audioContext.currentTime + pitchDurationInSeconds);
    this.whiteNoiseGain.gain.setValueAtTime(0, audioContext.currentTime + pitchDurationInSeconds);
  }
}
