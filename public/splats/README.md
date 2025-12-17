# Splat Files Directory

This directory contains `.splat` files for the 3D Gaussian Splatting viewer.

## File Format

The `.splat` format is a binary format that contains:
- XYZ Position (3 × Float32)
- XYZ Scale (3 × Float32) 
- RGBA Colors (4 × uint8)
- IJKL Quaternion/Rotation (4 × uint8)

Total: 32 bytes per splat

## Adding Your Own Files

You can add your own `.splat` files to this directory:

1. **From PLY files**: Use the provided conversion script or drag & drop `.ply` files into the viewer
2. **Download existing models**: Many pre-trained models are available from:
   - [Hugging Face Splat Data](https://huggingface.co/cakewalk/splat-data)
   - [NeRF Studio Models](https://docs.nerf.studio/en/latest/)
   - [3D Gaussian Splatting Research](https://repo-sam.inria.fr/fungraph/3d-gaussian-splatting/)

## Default Files

The viewer expects a `train.splat` file as the default model. You can:

1. Download a sample model from Hugging Face:
   ```bash
   curl -o public/splats/train.splat https://huggingface.co/cakewalk/splat-data/resolve/main/train.splat
   ```

2. Or use any of the predefined URLs in the viewer interface

## File Size Considerations

- Small models (< 1MB): Load instantly
- Medium models (1-10MB): Progressive loading with real-time interaction
- Large models (> 10MB): May require downsampling for optimal performance

## Supported Formats

- `.splat` - Native binary format (recommended)
- `.ply` - PLY format with Gaussian splatting attributes (auto-converted)

The viewer will automatically detect and convert PLY files to the optimized splat format.