import {Song} from "./song.model";
import {Track} from "./track.model";
import {audioContext, masterGainNode} from "./audio-initializer";

let oscillators: OscillatorNode[] = [],
  gainNodes: GainNode[] = [],
  isSongPlaying = false,
  currentTempo = 0,
  repeatTimer: any,
  musicGain = new GainNode(audioContext, { gain: .2 }),
  songs: Song[] = [];

const getDurationInSeconds = (numberOfSixteenths: number): number => numberOfSixteenths * (60 / currentTempo / 4);

const startSong = (songIndex: number, isRepeat = true): void => {
  const song = songs[songIndex];
  stopSong();
  isSongPlaying = true;
  createOscillators(song);
  currentTempo = song.tempo;
  song.tracks.forEach(scheduleTrackNotes);

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
    const songEndInSeconds = getDurationInSeconds(songLengthInMeasures * 16);
    repeatTimer = setTimeout(() => startSong(songIndex), songEndInSeconds * 1000);
  }
}

const stopSong = () => {
  isSongPlaying = false;
  clearTimeout(repeatTimer);
  oscillators.forEach(osc => osc.stop());
  oscillators = [];
  gainNodes = [];
}

export let initializeMusicEngine = (aSongs: Song[]) => {
  songs = aSongs;
  musicGain.connect(masterGainNode);
  return {
    startSong,
    stopSong
  }
}

const createOscillators = (song: Song) => {
  song.tracks.forEach((track, index) => {
    oscillators[index] = new OscillatorNode(audioContext, { type: track.wave });
    gainNodes.push(audioContext.createGain());
    oscillators[index]
      .connect(gainNodes[index])
      .connect(musicGain);
    gainNodes[index].gain.value = 0;
    oscillators[index].start();
  });
}

const scheduleTrackNotes = (track: Track, index: number) => {
  track.notes.forEach((note) => {
    const startTimeInSeconds = getDurationInSeconds(note.startPosition);
    const endTimeInSeconds = getDurationInSeconds(note.startPosition + note.duration);
    oscillators[index].frequency.setValueAtTime(note.frequency, audioContext.currentTime + startTimeInSeconds);
    gainNodes[index].gain.setValueAtTime(track.wave === 'sine' ? .5 : 1, audioContext.currentTime + startTimeInSeconds);
    gainNodes[index].gain.setValueAtTime(0, audioContext.currentTime + endTimeInSeconds);
  });
}
