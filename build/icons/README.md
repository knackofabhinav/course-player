# Linux Icons

This directory contains individual PNG icon files at multiple sizes for Linux AppImage.

## Required Files

- `16x16.png` - Smallest size for system tray, taskbar
- `32x32.png` - Small size for menus, toolbars
- `48x48.png` - Medium size for file managers
- `64x64.png` - Medium-large size
- `128x128.png` - Large size for app launchers
- `256x256.png` - Extra large size
- `512x512.png` - Primary size for AppImage (most important)

## Icon Specifications

- **Format**: PNG with transparency (alpha channel)
- **Color depth**: 32-bit RGBA
- **Compression**: PNG-8 or PNG-24
- **Naming**: Exact dimensions (e.g., `512x512.png`, not `512.png`)

## Generating Icons

### Using ImageMagick

```bash
convert source-1024.png -resize 512x512 build/icons/512x512.png
convert source-1024.png -resize 256x256 build/icons/256x256.png
convert source-1024.png -resize 128x128 build/icons/128x128.png
convert source-1024.png -resize 64x64 build/icons/64x64.png
convert source-1024.png -resize 48x48 build/icons/48x48.png
convert source-1024.png -resize 32x32 build/icons/32x32.png
convert source-1024.png -resize 16x16 build/icons/16x16.png
```

### Using Online Tools

1. Upload 1024x1024 source PNG to image resizer (e.g., iloveimg.com, resizeimage.net)
2. Download each size individually
3. Rename to exact dimensions (e.g., `512x512.png`)
4. Place in this directory

## Quality Considerations

- Start with high-quality 1024x1024 source
- Use bicubic or Lanczos resampling for best quality
- Avoid upscaling (always downscale from larger source)
- Check 16x16 size for clarity (simplify design if needed)

## Notes

- All 7 sizes are recommended but not strictly required
- Minimum: 512x512 (primary) and 256x256 (fallback)
- electron-builder automatically detects icons in this directory
- Uses 512x512 as primary icon for AppImage
