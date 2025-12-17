# 3D Gaussian Splatting Next.js Integration

A modern Next.js implementation of real-time 3D Gaussian Splatting visualization, based on the excellent [antimatter15/splat](https://github.com/antimatter15/splat) project.

## Features

- 🚀 **Real-time rendering** with WebGL 2.0 at 60fps
- 🎮 **Interactive controls** - keyboard, mouse, and touch support
- 📱 **Responsive design** - works on desktop and mobile
- 🔄 **Progressive loading** - start interacting while data loads
- 🌐 **CORS support** - load models from external URLs
- ⚡ **Web Workers** - non-blocking depth sorting
- 📦 **TypeScript** - full type safety
- 🎨 **Modern UI** - built with Tailwind CSS and shadcn/ui

## Quick Start

1. **Clone and install**:
   ```bash
   git clone <your-repo>
   cd 3d-gaussian-splatting
   npm install
   ```

2. **Add sample data** (optional):
   ```bash
   # Download a sample model
   mkdir -p public/splats
   curl -o public/splats/train.splat https://huggingface.co/cakewalk/splat-data/resolve/main/train.splat
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** to `http://localhost:3000`

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
