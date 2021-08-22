import { NotePosition } from "./note-position.model";

export interface Track {
  trackId: number;
  notes: NotePosition[];
}
