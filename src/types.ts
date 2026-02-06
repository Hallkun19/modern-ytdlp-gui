
export interface VideoMetadata {
  title: string;
  thumbnail: string;
  uploader: string;
  duration_string: string | null;
}


export interface QuickConfig {
  quality: string;
  format: string;
  codec: string;
  audioCodec: string;
  startTime: string;
  endTime: string;
}

export interface QueueConfig {
  quality: string;
  format: string;
  codec: string;
  audioCodec: string;
}

export interface QueueItem {
  id: string;
  url: string;
  metadata: VideoMetadata | null;
  status: 'pending' | 'fetching' | 'downloading' | 'finished' | 'error';
  progress: string;
  quality: string;
  format: string;
  codec: string;
  audioCodec: string;
  startTime: string;
  endTime: string;
  error?: string;
}


export const QUALITIES = ["Highest", "4320", "2160", "1440", "1080", "720", "480", "360", "144"];
export const FORMATS = ["mp4", "mkv", "mp3", "wav", "m4a"];
export const CODECS = [
  { id: "auto", name: "Auto (Best)" },
  { id: "h264", name: "H.264 (MP4 Compatible)" },
  { id: "vp9", name: "VP9" },
  { id: "av1", name: "AV1" }
];

export const AUDIO_CODECS = [
  { id: "best", name: "Best" },
  { id: "aac", name: "AAC (Most Compatible)" },
  { id: "mp3", name: "MP3" },
  { id: "opus", name: "Opus (High Efficiency)" },
  { id: "vorbis", name: "Vorbis" },
  { id: "flac", name: "FLAC (Lossless)" },
  { id: "m4a", name: "M4A" }
];

export const isAudio = (f: string) => ["mp3", "wav", "m4a"].includes(f);
