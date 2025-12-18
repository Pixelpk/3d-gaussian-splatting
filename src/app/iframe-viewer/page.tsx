'use client';

import { useState } from 'react';

const examples = [
  {
    name: 'Train Scene',
    url: 'train.splat',
    description: 'Classic train scene with detailed environment',
  },
  {
    name: 'Nike Shoe',
    url: 'nike.splat',
    description: 'Product visualization of a Nike sneaker',
  },
  {
    name: 'Plush Toy',
    url: 'plush.splat',
    description: 'Soft toy with fabric textures',
  },
];

export default function IframeViewerPage() {
  const [currentExample, setCurrentExample] = useState(examples[0]);
  const [showExamples, setShowExamples] = useState(false);

  const handleExampleChange = (example: (typeof examples)[0]) => {
    setCurrentExample(example);
    setShowExamples(false);

    // Force iframe reload with new URL parameter
    const iframe = document.querySelector('iframe') as HTMLIFrameElement;
    if (iframe) {
      // Add timestamp to force reload
      iframe.src = `/splat/index.html?url=${encodeURIComponent(example.url)}&t=${Date.now()}`;
    }
  };

  const handleIframeLoad = () => {
    // Focus the iframe after it loads to enable keyboard controls
    const iframe = document.querySelector('iframe') as HTMLIFrameElement;
    if (iframe) {
      iframe.focus();
    }
  };

  const handleContainerClick = () => {
    // Focus iframe when container is clicked to enable keyboard controls
    const iframe = document.querySelector('iframe') as HTMLIFrameElement;
    if (iframe) {
      iframe.focus();
    }
  };

  return (
    <div className='h-screen w-screen bg-black relative' onClick={handleContainerClick}>
      {/* Header with controls */}
      <div className='absolute top-4 left-4 z-10 text-white bg-black bg-opacity-50 p-4 rounded' onClick={(e) => e.stopPropagation()}>
        <h1 className='text-2xl font-bold mb-2'>3D Gaussian Splatting Viewer</h1>
        <p className='text-xs opacity-70 mb-3'>Click anywhere on the viewer to enable keyboard controls</p>

        {/* Example selector */}
        <div className='relative'>
          <button
            onClick={() => setShowExamples(!showExamples)}
            className='flex items-center gap-2 bg-black border-1 bg-opacity-20 hover:bg-opacity-30 px-3 py-2 rounded text-sm transition-colors'
          >
            <span>{currentExample.name}</span>
            <svg className={`w-4 h-4 transition-transform ${showExamples ? 'rotate-180' : ''}`} fill='currentColor' viewBox='0 0 20 20'>
              <path
                fillRule='evenodd'
                d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z'
                clipRule='evenodd'
              />
            </svg>
          </button>

          {showExamples && (
            <div className='absolute top-full left-0 mt-2 bg-black bg-opacity-90 rounded-lg overflow-hidden min-w-64'>
              {examples.map((example, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleChange(example)}
                  className='block w-full text-left px-4 py-3 hover:bg-white hover:bg-opacity-10 transition-colors border-b border-white border-opacity-10 last:border-b-0'
                >
                  <div className='font-medium text-sm'>{example.name}</div>
                  <div className='text-xs opacity-70 mt-1'>{example.description}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Instructions */}
      <div className='absolute top-4 right-4 z-10 text-white bg-black bg-opacity-50 p-3 rounded text-xs max-w-64'>
        <div className='font-medium mb-2'>Controls:</div>
        <div className='space-y-1 opacity-80'>
          <div>• Mouse: Click and drag to orbit</div>
          <div>• Wheel: Zoom in/out</div>
          <div>• WASD: Camera angle</div>
          <div>• Arrow keys: Move around</div>
          <div>• 0-9: Camera presets</div>
        </div>
      </div>

      <iframe
        src={`/splat/index.html?url=${encodeURIComponent(currentExample.url)}`}
        className='w-full h-full border-none'
        style={{ border: 'none' }}
        allow='accelerometer; gyroscope; magnetometer'
        title='Gaussian Splat Viewer'
        onLoad={handleIframeLoad}
        tabIndex={0}
      />
    </div>
  );
}
