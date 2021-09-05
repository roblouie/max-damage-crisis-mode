import {SoundEffect} from "./sound-effect.model";
import {audioContext, masterGainNode} from "./audio-initializer";
import {SfxPitchInstruction} from "./sfx-pitch-instruction.model";
import {SfxGainInstruction} from "./sfx-gain-instruction.model";
import {SfxWidthInstruction} from "./sfx-width-instruction.model";

export class SfxEngine {
  soundEffects: SoundEffect[];
  private sfxGain = new GainNode(audioContext, { gain: 0.8 })

  constructor(soundEffects: SoundEffect[]) {
    this.soundEffects = soundEffects;
    this.sfxGain.connect(masterGainNode);
  }

  async playEffect(effectIndex: number) {
    const soundEffect = this.soundEffects[effectIndex];

    const gainNodes = [new GainNode(audioContext, { gain: 1 }), new GainNode(audioContext, { gain: 1 }) ]

    const oscillator = new OscillatorNode(audioContext, { type: 'square' });
    oscillator
      .connect(gainNodes[0])
      .connect(this.sfxGain);

    const whiteNoiseGainNode = new AudioWorkletNode(audioContext, 'wn');
    const whiteNoiseFrequency = whiteNoiseGainNode.parameters.get('freq')!;
    const whiteNoiseCounterWidth = whiteNoiseGainNode.parameters.get('width')!;
    whiteNoiseGainNode
      .connect(gainNodes[1])
      .connect(this.sfxGain);

    const frequencies = [oscillator.frequency, whiteNoiseFrequency];
    let pitchDurationInSeconds = 0;

    frequencies.aForEach((freq, frequencyIndex) => {
      pitchDurationInSeconds = 0;
      soundEffect.pitchInstructions.aForEach((instruction: SfxPitchInstruction, index: number) => {
        const pitch = frequencyIndex === 0 ? instruction.pitch : (instruction.pitch / .3)
        pitchDurationInSeconds += instruction.durationInSeconds;
        if (index === 0){
          freq.setValueAtTime(pitch, audioContext.currentTime);
          freq.setValueAtTime(pitch, audioContext.currentTime + pitchDurationInSeconds);
          return;
        }
        if (instruction.isLinearRampTo) {
          freq.linearRampToValueAtTime(pitch, audioContext.currentTime + pitchDurationInSeconds);
        } else {
          freq.exponentialRampToValueAtTime(pitch, audioContext.currentTime + pitchDurationInSeconds);
        }
      });
    });

    let totalGainTimePerChanel = [0, 0];
    let isSeven = false;

    soundEffect.gainInstructions.aForEach((instruction: SfxGainInstruction) => {
      const index = instruction.isWhiteNoise ? 1 : 0;
      gainNodes[index].gain.linearRampToValueAtTime(instruction.gain, audioContext.currentTime + totalGainTimePerChanel[index] + instruction.timeFromLastInstruction);
      totalGainTimePerChanel[index] += instruction.timeFromLastInstruction;
    });

    let secondsSinceWidthChange = 0;

    soundEffect.widthInstructions.aForEach((instruction: SfxWidthInstruction) => {
      secondsSinceWidthChange += instruction.timeFromLastInstruction;
      whiteNoiseCounterWidth.setValueAtTime(isSeven ? 15 : 7,audioContext.currentTime + secondsSinceWidthChange);
      isSeven = !isSeven;
    });

    gainNodes.aForEach(gain=> gain.gain.setValueAtTime(0, audioContext.currentTime + pitchDurationInSeconds));
    oscillator.start();
  }
}
