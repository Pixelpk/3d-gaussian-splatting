export interface Capture {
  _id?: string;
  id?: string;
  title: string;
  thumbnail?: string;
  status: number; // 0 = processing, 1 = completed, 2 = failed
  folderPath?: string;
  serialize?: string;
  createdAt?: string;
}

export interface CaptureCardProps {
  id: string;
  title: string;
  thumbnail?: string;
  status: number;
  folderPath?: string;
}

export interface CaptureGridProps {
  captures: Capture[];
}
