import {Song} from "./song.model";
import {Track} from "./track.model";
import {audioContext} from "./audio-initializer";

export class MusicEngine {
  private currentTempo = 0;
  private ctx = audioContext;
  private masterGain?: GainNode;

// will be regular variable
  private isSongPlaying = false;
  private isCtxStarted = false;

  private oscillators: OscillatorNode[] = [];
  private gainNodes: GainNode[] = [];
  private repeatTimer?: any;

  constructor(private songs: Song[]) {
  }

  startSong(songIndex: number, isRepeat = true): void {
    if (!this.isCtxStarted) {
      this.createContext();
      this.createOscillators();
      this.isCtxStarted = true;
    }
    if (this.isSongPlaying) {
      this.stopSong();
    }
    this.isSongPlaying = true;
    this.currentTempo = this.songs[songIndex].tempo;
    this.masterGain!.gain.value = .2;
    this.songs[songIndex].tracks.forEach(track => this.scheduleTrackNotes(track));
    let totalNotePositionsUsed = 0;
    this.songs[songIndex].tracks.forEach(track => {
      const lastNote = track.notes[track.notes.length - 1] || null;
      if (!lastNote) {
        return;
      }
      const currentTrackLastUsedPos = lastNote.startPosition + lastNote.duration;
      if (currentTrackLastUsedPos > totalNotePositionsUsed) {
        totalNotePositionsUsed = currentTrackLastUsedPos;
      }
    });
    const songLengthInMeasures = Math.ceil(totalNotePositionsUsed / 16);
    const songEndInSeconds = this.getDurationInSeconds(songLengthInMeasures * 16);
    if (isRepeat) {
      this.repeatTimer = setTimeout(() => this.startSong(songIndex), songEndInSeconds * 1000);
    }

  }

  stopSong() {
    this.isSongPlaying = false;
    this.masterGain!.gain.value = 0;
    clearTimeout(this.repeatTimer);
    this.oscillators.forEach(osc => osc.frequency.cancelScheduledValues(this.ctx.currentTime));
    this.gainNodes.forEach(gain => {
      gain.gain.cancelScheduledValues(this.ctx.currentTime);
      gain.gain.value = 0;
    });
  }


  private createContext() {
    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = .2;
    this.masterGain.connect(this.ctx.destination);
  }

  private createOscillators() {
    this.oscillators[0] = new OscillatorNode(this.ctx, { type: 'sawtooth' });
    this.oscillators[1] = new OscillatorNode(this.ctx, { type: 'square' });
    this.oscillators[2] = new OscillatorNode(this.ctx, { type: 'sawtooth' });
    this.oscillators[3] = new OscillatorNode(this.ctx, { type: 'sine' });
    this.oscillators.forEach((osc: OscillatorNode, index: number) => {
      this.gainNodes.push(this.ctx.createGain());
      osc.connect(this.gainNodes[index]);
      osc.start();
    });
    this.gainNodes.forEach((gain: GainNode) => {
      gain.gain.value = 0;
      gain.connect(this.masterGain!);
    });
  }

  private scheduleTrackNotes(track: Track) {
    track.notes.forEach((note) => {
      const startTimeInSeconds = this.getDurationInSeconds(note.startPosition);
      const endTimeInSeconds = this.getDurationInSeconds(note.startPosition + note.duration);
      this.oscillators[track.trackId].frequency.setValueAtTime(note.frequency, this.ctx.currentTime + startTimeInSeconds);
      this.gainNodes[track.trackId].gain.setValueAtTime(track.trackId === 2 ? .5 : 1, this.ctx.currentTime + startTimeInSeconds);
      this.gainNodes[track.trackId].gain.setValueAtTime(0, this.ctx.currentTime + endTimeInSeconds);
    });
  }

  private getDurationInSeconds(numberOfSixteenths: number): number {
    const timePerSixteenth = 60 / this.currentTempo / 4;
    return numberOfSixteenths * timePerSixteenth;
  }
}
