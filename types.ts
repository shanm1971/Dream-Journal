
export enum AppState {
  IDLE,
  REQUESTING_PERMISSION,
  PERMISSION_DENIED,
  READY_TO_RECORD,
  RECORDING,
  PROCESSING,
  DISPLAYING_RESULTS,
  ERROR,
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface DreamData {
  transcription: string;
  interpretation: string;
  imageUrl: string;
}
