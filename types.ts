
export interface VibeAnalysis {
  playlistName: string;
  tastingNotes: string;
  colorPalette: string[];
  genres: string[];
  mood: string;
  intensity: string;
}

export enum AppState {
  IDLE = 'IDLE',
  CAMERA = 'CAMERA',
  LOADING = 'LOADING',
  RESULT = 'RESULT',
  ERROR = 'ERROR'
}
