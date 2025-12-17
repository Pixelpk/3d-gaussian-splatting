// TypeScript type definitions for Gaussian Splat viewer

export interface Camera {
  id: number;
  img_name: string;
  width: number;
  height: number;
  position: [number, number, number];
  rotation: [[number, number, number], [number, number, number], [number, number, number]];
  fy: number;
  fx: number;
}

export interface GaussianSplatViewerProps {
  /** URL to the .splat file to load */
  splatUrl?: string;
  /** Array of camera presets */
  cameras?: Camera[];
  /** Callback for load progress updates (0-100) */
  onLoadProgress?: (progress: number) => void;
  /** CSS classes for the container */
  className?: string;
  /** Default view matrix */
  defaultViewMatrix?: number[];
  /** Callback when loading starts */
  onLoadStart?: () => void;
  /** Callback when loading completes */
  onLoadComplete?: () => void;
  /** Callback when an error occurs */
  onError?: (error: string) => void;
}

export interface WorkerMessage {
  // Buffer data
  buffer?: ArrayBuffer;
  vertexCount?: number;
  save?: boolean;
  
  // PLY data
  ply?: ArrayBuffer;
  
  // View matrix
  view?: number[];
  
  // Texture data
  texdata?: Uint32Array;
  texwidth?: number;
  texheight?: number;
  
  // Depth index
  depthIndex?: Uint32Array;
  viewProj?: number[];
}

export interface SplatData {
  buffer: ArrayBuffer;
  vertexCount: number;
  rowLength: number;
}

export interface MouseState {
  down: boolean;
  startX: number;
  startY: number;
  button: number;
}

export interface TouchState {
  down: boolean;
  startX: number;
  startY: number;
  altX: number;
  altY: number;
}

export interface ViewerStats {
  fps: number;
  vertexCount: number;
  loadProgress: number;
  isLoading: boolean;
}

// Matrix operation type aliases
export type Matrix4 = number[]; // 16 elements
export type Matrix3 = number[]; // 9 elements
export type Vector3 = [number, number, number];
export type Vector4 = [number, number, number, number];

// WebGL related types
export interface WebGLResources {
  gl: WebGL2RenderingContext;
  program: WebGLProgram;
  texture: WebGLTexture;
  vertexBuffer: WebGLBuffer;
  indexBuffer: WebGLBuffer;
}

export interface UniformLocations {
  u_projection: WebGLUniformLocation | null;
  u_view: WebGLUniformLocation | null;
  u_viewport: WebGLUniformLocation | null;
  u_focal: WebGLUniformLocation | null;
  u_texture: WebGLUniformLocation | null;
}

export interface AttributeLocations {
  a_position: number;
  a_index: number;
}

// Event handler types
export interface InputHandlers {
  handleKeyDown: (e: KeyboardEvent) => void;
  handleKeyUp: (e: KeyboardEvent) => void;
  handleMouseDown: (e: MouseEvent) => void;
  handleMouseMove: (e: MouseEvent) => void;
  handleMouseUp: (e: MouseEvent) => void;
  handleWheel: (e: WheelEvent) => void;
  handleTouchStart: (e: TouchEvent) => void;
  handleTouchMove: (e: TouchEvent) => void;
  handleTouchEnd: (e: TouchEvent) => void;
}

// Configuration types
export interface ViewerConfig {
  /** Enable progressive loading */
  progressiveLoading?: boolean;
  /** Downsample factor for performance */
  downsampleFactor?: number;
  /** Maximum vertex count before downsampling */
  maxVertexCount?: number;
  /** Enable debug information */
  debug?: boolean;
  /** Custom worker URL */
  workerUrl?: string;
  /** Default camera settings */
  defaultCamera?: Partial<Camera>;
}

// Error types
export type SplatError = 
  | 'WEBGL_NOT_SUPPORTED'
  | 'SHADER_COMPILATION_FAILED'
  | 'PROGRAM_LINKING_FAILED'
  | 'NETWORK_ERROR'
  | 'INVALID_SPLAT_DATA'
  | 'WORKER_ERROR';

export interface SplatErrorInfo {
  type: SplatError;
  message: string;
  details?: string;
}