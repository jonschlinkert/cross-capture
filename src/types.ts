export interface CaptureOptions {
  tempFile?: string;
  interactive?: boolean;
  cursor?: boolean;
  delay?: number;
  format?: 'png' | 'jpg';
  quality?: number;
  region?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  window?: {
    title?: string;
    id?: string;
    interactive?: boolean;
  };
  display?: string | number;
  retina?: boolean;
}
