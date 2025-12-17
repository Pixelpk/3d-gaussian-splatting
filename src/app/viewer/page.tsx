'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Camera } from '@/types/gaussian-splat';

// Dynamically import the GaussianSplatViewer to avoid SSR issues
const GaussianSplatViewer = dynamic(
  () => import('@/components/GaussianSplatViewer'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-gray-900">
        <div className="text-white">Loading Gaussian Splat Viewer...</div>
      </div>
    )
  }
);

export default function ViewerPage() {
  const [splatUrl, setSplatUrl] = useState('https://huggingface.co/cakewalk/splat-data/resolve/main/train.splat');
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loadProgress, setLoadProgress] = useState(0);
  const [customUrl, setCustomUrl] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Load cameras on mount
  useEffect(() => {
    fetch('/cameras.json')
      .then(response => response.json())
      .then(setCameras)
      .catch(console.error);
  }, []);

  const handleUrlSubmit = () => {
    if (customUrl.trim()) {
      setSplatUrl(customUrl.trim());
      setLoadProgress(0);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const predefinedUrls = [
    {
      name: 'Train Scene (Default)',
      url: 'https://huggingface.co/cakewalk/splat-data/resolve/main/train.splat',
      description: 'Default training scene from Hugging Face'
    },
    {
      name: 'Nike Shoe',
      url: 'https://huggingface.co/cakewalk/splat-data/resolve/main/nike.splat',
      description: 'Nike shoe model from Hugging Face'
    },
    {
      name: 'Garden Scene',
      url: 'https://huggingface.co/cakewalk/splat-data/resolve/main/garden.splat',
      description: 'Garden scene'
    },
    {
      name: 'Truck Model',
      url: 'https://huggingface.co/cakewalk/splat-data/resolve/main/truck.splat',
      description: 'Truck vehicle model'
    }
  ];

  const ViewerComponent = (
    <GaussianSplatViewer
      splatUrl={splatUrl}
      cameras={cameras}
      onLoadProgress={setLoadProgress}
      className="w-full h-full"
    />
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-black">
        {ViewerComponent}
        <Button
          onClick={toggleFullscreen}
          className="absolute top-4 left-4 z-10"
          variant="outline"
        >
          Exit Fullscreen
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            3D Gaussian Splatting Viewer
          </h1>
          <p className="text-gray-600">
            Real-time WebGL renderer for 3D Gaussian Splats. Use arrow keys to move, WASD to rotate, 
            mouse to orbit, and scroll to zoom.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Controls Panel */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Load Custom Splat</CardTitle>
                <CardDescription>
                  Enter a URL to a .splat file (must be CORS-enabled)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  type="url"
                  placeholder="https://example.com/model.splat"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleUrlSubmit()}
                />
                <Button onClick={handleUrlSubmit} className="w-full">
                  Load Splat
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Predefined Models</CardTitle>
                <CardDescription>
                  Try these example models
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {predefinedUrls.map((item, index) => (
                  <Button
                    key={index}
                    variant={splatUrl === item.url ? "default" : "outline"}
                    className="w-full justify-start text-left"
                    onClick={() => {
                      setSplatUrl(item.url);
                      setLoadProgress(0);
                    }}
                  >
                    <div className="text-left">
                      <div className="font-medium text-sm">{item.name}</div>
                      <div className="text-xs opacity-70">{item.description}</div>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Controls</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div><strong>Movement:</strong></div>
                <div>• Arrow keys: move forward/back/left/right</div>
                <div>• Space: jump up</div>
                
                <div className="pt-2"><strong>Camera:</strong></div>
                <div>• A/D: turn left/right</div>
                <div>• W/S: tilt up/down</div>
                <div>• Q/E: roll</div>
                
                <div className="pt-2"><strong>Mouse:</strong></div>
                <div>• Left drag: orbit</div>
                <div>• Right drag: pan</div>
                <div>• Scroll: zoom</div>
              </CardContent>
            </Card>

            {loadProgress > 0 && loadProgress < 100 && (
              <Card>
                <CardHeader>
                  <CardTitle>Loading Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${loadProgress}%` }}
                    />
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {Math.round(loadProgress)}%
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Viewer Panel */}
          <div className="lg:col-span-3">
            <Card className="h-[600px]">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Gaussian Splat Viewer</CardTitle>
                    <CardDescription className="break-all">
                      {splatUrl.length > 60 ? `${splatUrl.substring(0, 60)}...` : splatUrl}
                    </CardDescription>
                  </div>
                  <Button onClick={toggleFullscreen} variant="outline" size="sm">
                    Fullscreen
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="h-[calc(100%-6rem)]">
                <div className="w-full h-full bg-black rounded-lg overflow-hidden">
                  {ViewerComponent}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Information Section */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>About 3D Gaussian Splatting</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                This is a WebGL implementation of a real-time renderer for{' '}
                <a 
                  href="https://repo-sam.inria.fr/fungraph/3d-gaussian-splatting/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  3D Gaussian Splatting for Real-Time Radiance Field Rendering
                </a>
                , a technique for creating photorealistic navigable 3D scenes from sets of pictures.
              </p>
              
              <h4 className="font-semibold mt-4 mb-2">Features:</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li>Real-time rendering using WebGL 2.0</li>
                <li>Progressive loading with live interaction</li>
                <li>Depth sorting on CPU with Web Workers</li>
                <li>Support for both .splat and .ply formats</li>
                <li>Full camera controls and navigation</li>
                <li>CORS-enabled loading of external models</li>
              </ul>

              <h4 className="font-semibold mt-4 mb-2">Technical Details:</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li>Based on the antimatter15/splat implementation</li>
                <li>Integrated into Next.js with proper SSR handling</li>
                <li>TypeScript support with proper type definitions</li>
                <li>Responsive design with fullscreen mode</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}