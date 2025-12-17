'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { multiply4, invert4, rotate4, translate4, getProjectionMatrix, getViewMatrix } from '@/lib/gaussian-math';
import { vertexShaderSource, fragmentShaderSource } from '@/lib/gaussian-shaders';
import { Camera, GaussianSplatViewerProps } from '@/types/gaussian-splat';

const defaultViewMatrix = [
  0.47, 0.04, 0.88, 0, -0.11, 0.99, 0.02, 0, -0.88, -0.11, 0.47, 0, 0.07,
  0.03, 6.55, 1,
];

export default function GaussianSplatViewer({ 
  splatUrl = 'https://huggingface.co/cakewalk/splat-data/resolve/main/train.splat', 
  cameras = [],
  onLoadProgress,
  className = 'w-full h-full',
  defaultViewMatrix: defaultView = defaultViewMatrix
}: GaussianSplatViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const workerRef = useRef<Worker | null>(null);
  const glRef = useRef<WebGL2RenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const viewMatrixRef = useRef<number[]>(defaultView);
  const projectionMatrixRef = useRef<number[]>([]);
  const vertexCountRef = useRef(0);
  const animationIdRef = useRef<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [fps, setFps] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  
  // Input handling
  const keysRef = useRef(new Set<string>());
  const mouseStateRef = useRef({
    down: false,
    startX: 0,
    startY: 0,
    button: 0
  });
  
  const touchStateRef = useRef({
    down: false,
    startX: 0,
    startY: 0,
    altX: 0,
    altY: 0
  });

  const avgFpsRef = useRef(0);
  const lastFrameRef = useRef(0);

  const isPly = useCallback((splatData: Uint8Array) => {
    return splatData[0] === 112 && splatData[1] === 108 && splatData[2] === 121 && splatData[3] === 10;
  }, []);

  const loadSplatData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      vertexCountRef.current = 0; // Reset vertex count
      
      const url = new URL(splatUrl, window.location.href);
      console.log('Loading splat data from:', url.href);
      const response = await fetch(url, {
        mode: 'cors',
        credentials: 'omit',
      });

      if (!response.ok) {
        throw new Error(`${response.status} Unable to load ${response.url}`);
      }

      const contentLength = response.headers.get('content-length');
      const totalBytes = contentLength ? parseInt(contentLength, 10) : 0;
      const reader = response.body?.getReader();
      
      if (!reader) {
        throw new Error('Unable to read response body');
      }

      let splatData = new Uint8Array(totalBytes);
      let bytesRead = 0;
      const rowLength = 3 * 4 + 3 * 4 + 4 + 4;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        splatData.set(value, bytesRead);
        bytesRead += value.length;

        if (onLoadProgress && totalBytes > 0) {
          onLoadProgress((bytesRead / totalBytes) * 100);
        }

        const vertexCount = Math.floor(bytesRead / rowLength);
        if (vertexCount > vertexCountRef.current) {
          if (!isPly(splatData)) {
            // Only send complete vertex data (aligned to rowLength)
            const alignedBytes = vertexCount * rowLength;
            if (alignedBytes > 0 && alignedBytes <= bytesRead) {
              workerRef.current?.postMessage({
                buffer: splatData.buffer.slice(0, alignedBytes),
                vertexCount: vertexCount
              });
            }
          }
          vertexCountRef.current = vertexCount;
        }
      }

      if (isPly(splatData)) {
        workerRef.current?.postMessage({ ply: splatData.buffer, save: false });
      } else {
        workerRef.current?.postMessage({
          buffer: splatData.buffer,
          vertexCount: Math.floor(bytesRead / rowLength),
        });
      }

      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load splat data');
      setIsLoading(false);
    }
  }, [splatUrl, onLoadProgress, isPly]);

  const initWebGL = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return false;

    const gl = canvas.getContext('webgl2', { antialias: false });
    if (!gl) {
      setError('WebGL2 not supported');
      return false;
    }

    glRef.current = gl;

    // Create shaders
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    if (!vertexShader) return false;
    
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);
    
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
      console.error('Vertex shader compilation error:', gl.getShaderInfoLog(vertexShader));
      return false;
    }

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    if (!fragmentShader) return false;
    
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);
    
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      console.error('Fragment shader compilation error:', gl.getShaderInfoLog(fragmentShader));
      return false;
    }

    // Create program
    const program = gl.createProgram();
    if (!program) return false;
    
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program linking error:', gl.getProgramInfoLog(program));
      return false;
    }

    programRef.current = program;

    // Set up WebGL state
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(
      gl.ONE_MINUS_DST_ALPHA,
      gl.ONE,
      gl.ONE_MINUS_DST_ALPHA,
      gl.ONE,
    );
    gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);

    // Set up vertex data
    const triangleVertices = new Float32Array([-2, -2, 2, -2, 2, 2, -2, 2]);
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, triangleVertices, gl.STATIC_DRAW);
    
    const a_position = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(a_position);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 0, 0);

    // Set up texture
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    const u_textureLocation = gl.getUniformLocation(program, 'u_texture');
    gl.uniform1i(u_textureLocation, 0);

    // Set up index buffer for instanced rendering
    const indexBuffer = gl.createBuffer();
    const a_index = gl.getAttribLocation(program, 'index');
    gl.enableVertexAttribArray(a_index);
    gl.bindBuffer(gl.ARRAY_BUFFER, indexBuffer);
    gl.vertexAttribIPointer(a_index, 1, gl.INT, 0, 0);
    gl.vertexAttribDivisor(a_index, 1);

    return true;
  }, []);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const gl = glRef.current;
    const program = programRef.current;
    
    if (!canvas || !gl || !program) return;

    const rect = canvas.getBoundingClientRect();
    const devicePixelRatio = window.devicePixelRatio || 1;
    const downsample = vertexCountRef.current > 500000 ? 1 : 1 / devicePixelRatio;
    
    canvas.width = Math.round(rect.width / downsample);
    canvas.height = Math.round(rect.height / downsample);
    
    gl.viewport(0, 0, canvas.width, canvas.height);

    // Update uniforms
    const u_viewport = gl.getUniformLocation(program, 'viewport');
    gl.uniform2fv(u_viewport, new Float32Array([canvas.width, canvas.height]));

    const camera = cameras[0] || { fx: 1159, fy: 1164 };
    const u_focal = gl.getUniformLocation(program, 'focal');
    gl.uniform2fv(u_focal, new Float32Array([camera.fx, camera.fy]));

    projectionMatrixRef.current = getProjectionMatrix(
      camera.fx,
      camera.fy,
      canvas.width,
      canvas.height,
    );

    const u_projection = gl.getUniformLocation(program, 'projection');
    gl.uniformMatrix4fv(u_projection, false, projectionMatrixRef.current);
  }, [cameras]);

  const render = useCallback((now: number) => {
    const gl = glRef.current;
    const program = programRef.current;
    
    if (!gl || !program) return;

    // Handle input
    let inv = invert4(viewMatrixRef.current);
    if (!inv) return;

    // Keyboard controls
    if (keysRef.current.has('ArrowUp')) {
      inv = translate4(inv, 0, 0, 0.1);
    }
    if (keysRef.current.has('ArrowDown')) {
      inv = translate4(inv, 0, 0, -0.1);
    }
    if (keysRef.current.has('ArrowLeft')) {
      inv = translate4(inv, -0.03, 0, 0);
    }
    if (keysRef.current.has('ArrowRight')) {
      inv = translate4(inv, 0.03, 0, 0);
    }
    if (keysRef.current.has('KeyA')) {
      inv = rotate4(inv, -0.01, 0, 1, 0);
    }
    if (keysRef.current.has('KeyD')) {
      inv = rotate4(inv, 0.01, 0, 1, 0);
    }
    if (keysRef.current.has('KeyW')) {
      inv = rotate4(inv, 0.005, 1, 0, 0);
    }
    if (keysRef.current.has('KeyS')) {
      inv = rotate4(inv, -0.005, 1, 0, 0);
    }

    viewMatrixRef.current = invert4(inv) || viewMatrixRef.current;

    const viewProj = multiply4(projectionMatrixRef.current, viewMatrixRef.current);
    workerRef.current?.postMessage({ view: viewProj });

    // Calculate FPS
    const currentFps = 1000 / (now - lastFrameRef.current) || 0;
    avgFpsRef.current = avgFpsRef.current * 0.9 + currentFps * 0.1;
    setFps(Math.round(avgFpsRef.current));

    // Render
    gl.clear(gl.COLOR_BUFFER_BIT);
    if (vertexCountRef.current > 0) {
      const u_view = gl.getUniformLocation(program, 'view');
      gl.uniformMatrix4fv(u_view, false, viewMatrixRef.current);
      gl.drawArraysInstanced(gl.TRIANGLE_FAN, 0, 4, vertexCountRef.current);
    }

    lastFrameRef.current = now;
    animationIdRef.current = requestAnimationFrame(render);
  }, []);

  // Event handlers
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    keysRef.current.add(e.code);
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    keysRef.current.delete(e.code);
  }, []);

  const handleMouseDown = useCallback((e: MouseEvent) => {
    const mouseState = mouseStateRef.current;
    mouseState.down = true;
    mouseState.startX = e.clientX;
    mouseState.startY = e.clientY;
    mouseState.button = e.button;
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const mouseState = mouseStateRef.current;
    if (!mouseState.down) return;

    const dx = (5 * (e.clientX - mouseState.startX)) / window.innerWidth;
    const dy = (5 * (e.clientY - mouseState.startY)) / window.innerHeight;

    let inv = invert4(viewMatrixRef.current);
    if (!inv) return;

    const d = 4;
    inv = translate4(inv, 0, 0, d);
    
    if (mouseState.button === 0) {
      // Left click - orbit
      inv = rotate4(inv, dx, 0, 1, 0);
      inv = rotate4(inv, -dy, 1, 0, 0);
    } else if (mouseState.button === 2) {
      // Right click - pan/move
      inv = translate4(inv, dx, 0, 0);
      inv = translate4(inv, 0, dy, 0);
    }
    
    inv = translate4(inv, 0, 0, -d);
    viewMatrixRef.current = invert4(inv) || viewMatrixRef.current;

    mouseState.startX = e.clientX;
    mouseState.startY = e.clientY;
  }, []);

  const handleMouseUp = useCallback(() => {
    mouseStateRef.current.down = false;
  }, []);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    let inv = invert4(viewMatrixRef.current);
    if (!inv) return;

    const factor = e.deltaY > 0 ? 1.1 : 0.9;
    inv = translate4(inv, 0, 0, factor - 1);
    viewMatrixRef.current = invert4(inv) || viewMatrixRef.current;
  }, []);

  // Handle client-side mounting to prevent hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!initWebGL()) return;
    
    // Initialize worker
    try {
      workerRef.current = new Worker('/gaussian-worker.js');
      console.log('Worker created successfully');
    } catch (error) {
      console.error('Failed to create worker:', error);
      setError('Failed to initialize web worker');
      return;
    }
    
    workerRef.current.onerror = (error) => {
      console.error('Worker error:', error);
      setError('Web worker error occurred');
    };
    
    // Test worker connection
    console.log('Testing worker connection...');
    workerRef.current.postMessage({ test: true });
    
    workerRef.current.onmessage = (e) => {
      if (e.data.test) {
        console.log('Worker test response:', e.data.test);
        return;
      }
      
      const gl = glRef.current;
      if (!gl) return;

      if (e.data.buffer) {
        // Handle buffer data
        const rowLength = 3 * 4 + 3 * 4 + 4 + 4;
        vertexCountRef.current = Math.floor(e.data.buffer.byteLength / rowLength);
        console.log('Updated vertex count:', vertexCountRef.current);
      } else if (e.data.texdata) {
        // Handle texture data
        const { texdata, texwidth, texheight } = e.data;
        console.log('Received texture data:', texwidth, 'x', texheight, 'with', texdata.length, 'elements');
        
        gl.bindTexture(gl.TEXTURE_2D, gl.getParameter(gl.TEXTURE_BINDING_2D));
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA32UI,
          texwidth,
          texheight,
          0,
          gl.RGBA_INTEGER,
          gl.UNSIGNED_INT,
          texdata
        );
      } else if (e.data.depthIndex) {
        // Handle depth sorted indices
        console.log('Received depth index with', e.data.depthIndex.length, 'elements');
        const indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, e.data.depthIndex, gl.DYNAMIC_DRAW);
        
        const program = programRef.current;
        if (program) {
          const a_index = gl.getAttribLocation(program, 'index');
          gl.enableVertexAttribArray(a_index);
          gl.vertexAttribIPointer(a_index, 1, gl.INT, 0, 0);
          gl.vertexAttribDivisor(a_index, 1);
        }
        
        if (e.data.vertexCount) {
          vertexCountRef.current = e.data.vertexCount;
        }
      }
    };

    // Set up event listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('resize', resizeCanvas);

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('mousedown', handleMouseDown);
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('mouseup', handleMouseUp);
      canvas.addEventListener('wheel', handleWheel);
      canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    // Initial resize and load
    resizeCanvas();
    loadSplatData();

    // Start render loop
    animationIdRef.current = requestAnimationFrame(render);

    return () => {
      // Cleanup
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      
      workerRef.current?.terminate();
      
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', resizeCanvas);
      
      if (canvas) {
        canvas.removeEventListener('mousedown', handleMouseDown);
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseup', handleMouseUp);
        canvas.removeEventListener('wheel', handleWheel);
      }
    };
  }, [
    initWebGL, 
    resizeCanvas, 
    loadSplatData, 
    render, 
    handleKeyDown, 
    handleKeyUp, 
    handleMouseDown, 
    handleMouseMove, 
    handleMouseUp, 
    handleWheel
  ]);

  // Prevent hydration issues by only rendering on client
  if (!isMounted) {
    return (
      <div className={`relative ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-white">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <canvas 
        ref={canvasRef} 
        className="block w-full h-full touch-none"
        style={{ touchAction: 'none' }}
      />
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <div>Loading Gaussian Splats...</div>
          </div>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-900 bg-opacity-80">
          <div className="text-white text-center p-4">
            <div className="text-xl mb-2">Error</div>
            <div>{error}</div>
          </div>
        </div>
      )}
      
      {/* FPS counter */}
      {!isLoading && !error && (
        <div className="absolute top-4 right-4 text-white bg-black bg-opacity-50 px-2 py-1 rounded">
          {fps} FPS
        </div>
      )}
    </div>
  );
}