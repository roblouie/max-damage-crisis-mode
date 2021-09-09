import {Song} from "./song.model";
import {Track} from "./track.model";
import {audioContext, masterGainNode} from "./audio-initializer";

export class MusicEngine {
  private currentTempo = 0;
  private musicGain = new GainNode(audioContext, { gain: .2 });
  private isSongPlaying = false;

  private oscillators: OscillatorNode[] = [];
  private gainNodes: GainNode[] = [];
  private repeatTimer?: any;

  constructor(private songs: Song[]) {
    this.musicGain.connect(masterGainNode);
  }

  startSong(songIndex: number, isRepeat = true): void {
    const song = this.songs[songIndex];
    this.stopSong();
    this.isSongPlaying = true;
    this.createOscillators(song);
    this.currentTempo = song.tempo;
    song.tracks.forEach((track, index) => this.scheduleTrackNotes(track, index));

    if (isRepeat) {
      let totalNotePositionsUsed = 0;
      song.tracks.forEach(track => {
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
      this.repeatTimer = setTimeout(() => this.startSong(songIndex), songEndInSeconds * 1000);
    }
  }

  stopSong() {
    this.isSongPlaying = false;
    clearTimeout(this.repeatTimer);
    this.oscillators.forEach((osc, index) => {
      osc.disconnect();
      this.gainNodes[index].disconnect();
    });
    this.oscillators = [];
    this.gainNodes = [];
  }

  private createOscillators(song: Song) {
    song.tracks.forEach((track, index) => {
      this.oscillators[index] = new OscillatorNode(audioContext, { type: track.wave });
      this.gainNodes.push(audioContext.createGain());
      this.oscillators[index]
        .connect(this.gainNodes[index])
        .connect(this.musicGain);
      this.gainNodes[index].gain.value = 0;
      this.oscillators[index].start();
    })
  }

  private scheduleTrackNotes(track: Track, index: number) {
    track.notes.forEach((note) => {
      const startTimeInSeconds = this.getDurationInSeconds(note.startPosition);
      const endTimeInSeconds = this.getDurationInSeconds(note.startPosition + note.duration);
      this.oscillators[index].frequency.setValueAtTime(note.frequency, audioContext.currentTime + startTimeInSeconds);
      this.gainNodes[index].gain.setValueAtTime(track.wave === 'sine' ? .5 : 1, audioContext.currentTime + startTimeInSeconds);
      this.gainNodes[index].gain.setValueAtTime(0, audioContext.currentTime + endTimeInSeconds);
    });
  }

  private getDurationInSeconds(numberOfSixteenths: number): number {
    const timePerSixteenth = 60 / this.currentTempo / 4;
    return numberOfSixteenths * timePerSixteenth;
  }
}
