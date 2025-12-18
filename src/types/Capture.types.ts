export interface Capture {
  id: number;
  title: string;
  image: string;
  status?: string;
}

export interface CaptureCardProps {
  id: number;
  title: string;
  image: string;
  status?: string;
}

export interface CaptureGridProps {
  captures: Capture[];
}
