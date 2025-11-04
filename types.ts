
export interface ImageFile {
  id: string;
  file: File;
  base64: string;
}

export interface MatchResult {
  image: ImageFile;
  score: number;
  reason: string;
}
