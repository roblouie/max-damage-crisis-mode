import {SoundEffect} from "./sound-effect.model";
import {audioContext, masterGainNode} from "./audio-initializer";
import {SfxPitchInstruction} from "./sfx-pitch-instruction.model";
import {SfxGainInstruction} from "./sfx-gain-instruction.model";
import { SfxWidthInstruction } from "./sfx-width-instruction.model";
import { animationFrameSequencer } from "../core/animation-frame-sequencer";

class EffectPlayer {
  oscillator: OscillatorNode;
  whiteNoise: AudioWorkletNode;
  gainNodes: GainNode[];

  constructor(sfxGain: GainNode) {
    this.gainNodes = [new GainNode(audioContext, { gain: 0 }), new GainNode(audioContext, { gain: 0 })];
    this.oscillator = new OscillatorNode(audioContext, { type: 'square' });
    this.whiteNoise = new AudioWorkletNode(audioContext, 'wn');

    this.oscillator
      .connect(this.gainNodes[0])
      .connect(sfxGain)

    this.whiteNoise
      .connect(this.gainNodes[1])
      .connect(sfxGain);

    this.oscillator.start();
  }

  canceller(...toCancel: AudioParam[]) {
    toCancel.forEach(cancelMe => cancelMe.cancelScheduledValues(audioContext.currentTime));
  }

  play(soundEffect: SoundEffect) {
    const whiteNoiseFrequency = this.whiteNoise.parameters.get('freq')!;
    const whiteNoiseWidth = this.whiteNoise.parameters.get('width')!;

    this.canceller(whiteNoiseFrequency, whiteNoiseWidth, this.oscillator.frequency, ...this.gainNodes.map(gainNode => gainNode.gain));

    whiteNoiseWidth.value = 15;

    this.gainNodes.forEach(gainNode => {
      gainNode.gain.value = 1;
    });

    const frequencies = [this.oscillator.frequency, whiteNoiseFrequency];
    const linearRampString = 'linearRampToValueAtTime';
    let pitchDurationInSeconds = 0;

    frequencies.forEach((freq, frequencyIndex) => {
      pitchDurationInSeconds = 0;
      soundEffect.pitchInstructions.forEach((instruction: SfxPitchInstruction, index: number) => {
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

    soundEffect.widthInstructions.forEach((instruction: SfxWidthInstruction) => {
      secondsSinceWidthChange += instruction.timeFromLastInstruction;
      whiteNoiseWidth.setValueAtTime(isSeven ? 15 : 7,audioContext.currentTime + secondsSinceWidthChange);
      isSeven = !isSeven;
    });

    const totalGainTimePerChanel = [0, 0];

    soundEffect.gainInstructions.forEach((instruction: SfxGainInstruction) => {
      const index = instruction.isWhiteNoise ? 1 : 0;
      this.gainNodes[index].gain[linearRampString](instruction.gain, audioContext.currentTime + totalGainTimePerChanel[index] + instruction.timeFromLastInstruction);
      totalGainTimePerChanel[index] += instruction.timeFromLastInstruction;
    });

    this.gainNodes.forEach(gain=> gain.gain.setValueAtTime(0, audioContext.currentTime + pitchDurationInSeconds));
  }
}

export class SfxEngine {
  soundEffects: SoundEffect[];
  effectPlayers: EffectPlayer[];
  currentEffectPlayer = 0;

  constructor(soundEffects: SoundEffect[]) {
    this.soundEffects = soundEffects;
    const sfxGain = new GainNode(audioContext, { gain: 0.7 });
    sfxGain.connect(audioContext.destination);
    this.effectPlayers = [new EffectPlayer(sfxGain), new EffectPlayer(sfxGain), new EffectPlayer(sfxGain)];
  }

  async playEffect(effectIndex: number) {
    const soundEffect = this.soundEffects[effectIndex];
    this.effectPlayers[this.currentEffectPlayer].play(soundEffect);
    this.currentEffectPlayer++;
    if (this.currentEffectPlayer >= this.effectPlayers.length) {
      this.currentEffectPlayer = 0;
    }
  }
}
