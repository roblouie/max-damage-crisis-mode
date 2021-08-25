import {NotePosition} from "./note-position.model";

export interface Track {
  wave?: 'sawtooth' | 'sine' | 'square' | 'triangle',
  notes: NotePosition[];
}
