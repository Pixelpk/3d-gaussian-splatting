import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            3D Gaussian Splatting
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Real-time WebGL renderer for 3D Gaussian Splats. Experience photorealistic 
            3D scenes reconstructed from images, rendered in real-time in your browser.
            Built using the original antimatter15/splat implementation.
          </p>
          
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/iframe-viewer">
              <Button size="lg" className="text-lg px-8 py-3">
                Launch Viewer
              </Button>
            </Link>
            <a 
              href="https://github.com/antimatter15/splat" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                View Source
              </Button>
            </a>
          </div>
        </div>



        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🚀 Real-time Rendering
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Experience smooth 60fps rendering of complex 3D scenes using WebGL 2.0, 
                with efficient GPU-based splatting techniques.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🎮 Interactive Controls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Navigate through scenes with intuitive controls - keyboard movement, 
                mouse orbiting, and smooth camera transitions.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📱 Web-based
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                No downloads required. Works directly in modern web browsers 
                with WebGL 2.0 support, including mobile devices.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🔄 Progressive Loading
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Start interacting immediately while models load progressively in the background, 
                with real-time progress feedback.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🌐 CORS Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Load custom .splat files from any CORS-enabled URL, 
                including popular model repositories and your own hosting.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                ⚡ Web Workers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Efficient depth sorting performed asynchronously in web workers, 
                keeping the main thread free for smooth rendering.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle>About 3D Gaussian Splatting</CardTitle>
            </CardHeader>
            <CardContent className="text-left">
              <p className="mb-4">
                3D Gaussian Splatting is a revolutionary technique for creating photorealistic 
                3D scenes from sets of photographs. Unlike traditional 3D modeling or NeRFs, 
                Gaussian Splatting represents scenes as collections of 3D Gaussian functions 
                that can be rendered extremely efficiently.
              </p>
              
              <p className="mb-4">
                This implementation is based on the excellent work by{' '}
                <a 
                  href="https://github.com/antimatter15/splat" 
                  className="text-blue-600 hover:underline"
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  antimatter15/splat
                </a>
                , integrated into a modern Next.js application with TypeScript support, 
                responsive design, and enhanced user experience.
              </p>

              <div className="text-center mt-6">
                <Link href="/viewer">
                  <Button>Try the Interactive Demo</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
