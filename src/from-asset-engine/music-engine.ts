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
    //TODO: Clean this up to remove the creat context thing since it exists already.
    // We need a master gain with sound fx too though first
    if (!this.isCtxStarted) {
      this.createContext();
      this.isCtxStarted = true;
    }
    if (this.isSongPlaying) {
      this.stopSong();
    }
    this.isSongPlaying = true;
    this.createOscillators(this.songs[songIndex]);
    this.currentTempo = this.songs[songIndex].tempo;
    this.masterGain!.gain.value = .2;
    this.songs[songIndex].tracks.forEach((track, index) => this.scheduleTrackNotes(track, index));
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
    if (!this.isSongPlaying) {
      return;
    }

    this.isSongPlaying = false;
    this.masterGain!.gain.value = 0;
    clearTimeout(this.repeatTimer);
    this.oscillators.forEach(osc => osc.frequency.cancelScheduledValues(this.ctx.currentTime));
    this.oscillators.splice(0, this.oscillators.length);
    this.gainNodes.forEach(gain => {
      gain.gain.cancelScheduledValues(this.ctx.currentTime);
      gain.gain.value = 0;
    });
    this.gainNodes.splice(0, this.gainNodes.length);
  }


  private createContext() {
    this.masterGain = audioContext.createGain();
    this.masterGain.gain.value = .2;
    this.masterGain.connect(audioContext.destination);
  }

  private createOscillators(song: Song) {
    song.tracks.forEach((track, index) => {
      this.oscillators[index] = new OscillatorNode(this.ctx, { type: track.wave });
      this.gainNodes.push(this.ctx.createGain());
      this.oscillators[index].connect(this.gainNodes[index]);
      this.gainNodes[index].gain.value = 0;
      this.gainNodes[index].connect(this.masterGain!)
      this.oscillators[index].start();
    })
  }

  private scheduleTrackNotes(track: Track, index: number) {
    track.notes.forEach((note) => {
      const startTimeInSeconds = this.getDurationInSeconds(note.startPosition);
      const endTimeInSeconds = this.getDurationInSeconds(note.startPosition + note.duration);
      this.oscillators[index].frequency.setValueAtTime(note.frequency, this.ctx.currentTime + startTimeInSeconds);
      this.gainNodes[index].gain.setValueAtTime(track.wave === 'sine' ? .5 : 1, this.ctx.currentTime + startTimeInSeconds);
      this.gainNodes[index].gain.setValueAtTime(0, this.ctx.currentTime + endTimeInSeconds);
    });
  }

  private getDurationInSeconds(numberOfSixteenths: number): number {
    const timePerSixteenth = 60 / this.currentTempo / 4;
    return numberOfSixteenths * timePerSixteenth;
  }
}
