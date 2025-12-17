'use client';

export default function IframeViewerPage() {
  return (
    <div className="h-screen w-screen bg-black">
      <div className="absolute top-4 left-4 z-10 text-white bg-black bg-opacity-50 p-4 rounded">
        <h1 className="text-2xl font-bold mb-2">3D Gaussian Splatting Viewer</h1>
        <p className="text-sm opacity-80">Powered by antimatter15/splat</p>
      </div>
      
      <iframe 
        src="/splat/index.html"
        className="w-full h-full border-none"
        style={{ border: 'none' }}
        allow="accelerometer; gyroscope; magnetometer"
        title="Gaussian Splat Viewer"
      />
    </div>
  );
}