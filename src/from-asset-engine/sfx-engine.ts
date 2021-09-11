import {SoundEffect} from "./sound-effect.model";
import { audioContext, masterGainNode } from "./audio-initializer";
import {SfxPitchInstruction} from "./sfx-pitch-instruction.model";
import {SfxGainInstruction} from "./sfx-gain-instruction.model";
import { SfxWidthInstruction } from "./sfx-width-instruction.model";

class EffectPlayer {
  oscillator: OscillatorNode;
  whiteNoise: AudioWorkletNode;
  gainNodes: GainNode[];
  soundEffect: SoundEffect;
  private isPlaying = false;

  constructor(sfxGain: GainNode, soundEffect: SoundEffect) {
    this.gainNodes = [new GainNode(audioContext, { gain: 0 }), new GainNode(audioContext, { gain: 0 })];
    this.oscillator = new OscillatorNode(audioContext, { type: 'square' });
    this.whiteNoise = new AudioWorkletNode(audioContext, 'wn');
    this.soundEffect = soundEffect;

    this.oscillator
      .connect(this.gainNodes[0])
      .connect(sfxGain)

    this.whiteNoise
      .connect(this.gainNodes[1])
      .connect(sfxGain);

    this.oscillator.start();
  }

  play() {
    if (this.isPlaying) return;

    this.isPlaying = true;
    const whiteNoiseFrequency = this.whiteNoise.parameters.get('freq')!;
    const whiteNoiseWidth = this.whiteNoise.parameters.get('width')!;

    whiteNoiseWidth.value = 15;

    this.gainNodes.forEach(gainNode => {
      gainNode.gain.value = 1;
    });

    const frequencies = [this.oscillator.frequency, whiteNoiseFrequency];
    const linearRampString = 'linearRampToValueAtTime';
    let pitchDurationInSeconds = 0;

    frequencies.forEach((freq, frequencyIndex) => {
      pitchDurationInSeconds = 0;
      this.soundEffect.pitchInstructions.forEach((instruction: SfxPitchInstruction, index: number) => {
        const pitch = frequencyIndex === 0 ? instruction.pitch : (instruction.pitch / .3)
        pitchDurationInSeconds += instruction.durationInSeconds;
        if (index === 0){
          freq.setValueAtTime(pitch, audioContext.currentTime);
        }
        freq[instruction.isLinearRampTo ? linearRampString : 'exponentialRampToValueAtTime'](pitch, audioContext.currentTime + pitchDurationInSeconds)
      });
    });

    let secondsSinceWidthChange = 0;
    let isSeven = false;

    this.soundEffect.widthInstructions.forEach((instruction: SfxWidthInstruction) => {
      secondsSinceWidthChange += instruction.timeFromLastInstruction;
      whiteNoiseWidth.setValueAtTime(isSeven ? 15 : 7,audioContext.currentTime + secondsSinceWidthChange);
      isSeven = !isSeven;
    });

    const totalGainTimePerChanel = [0, 0];

    this.soundEffect.gainInstructions.forEach((instruction: SfxGainInstruction) => {
      const index = instruction.isWhiteNoise ? 1 : 0;
      this.gainNodes[index].gain[linearRampString](instruction.gain, audioContext.currentTime + totalGainTimePerChanel[index] + instruction.timeFromLastInstruction);
      totalGainTimePerChanel[index] += instruction.timeFromLastInstruction;
    });

    this.gainNodes.forEach(gain=> gain.gain.setValueAtTime(0, audioContext.currentTime + pitchDurationInSeconds));
    setTimeout(() => this.isPlaying = false, pitchDurationInSeconds / 1000);
  }
}

export class SfxEngine {
  soundEffects: SoundEffect[];
  effectPlayers: EffectPlayer[];

  constructor(soundEffects: SoundEffect[]) {
    this.soundEffects = soundEffects;
    const sfxGain = new GainNode(audioContext, { gain: 0.7 });
    sfxGain.connect(masterGainNode);
    this.effectPlayers = soundEffects.map(soundEffect => new EffectPlayer(sfxGain, soundEffect));
  }

  async playEffect(effectIndex: number) {
    this.effectPlayers[effectIndex].play();
  }
}
