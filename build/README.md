# Build Resources

This directory contains assets used by electron-builder during the packaging process.

## Required Files

### Icons

- **icon.icns** - macOS icon (1024x1024 with multiple sizes)
- **icon.ico** - Windows icon (256x256 with multiple sizes)
- **icons/** - Linux icons directory (PNG files at multiple sizes)

### Optional Files

- **dmg-background.png** - macOS DMG background image (540x380 pixels)
- **entitlements.mac.plist** - macOS entitlements for sandboxing

## Creating Icons

### Option 1: Using png2icons (Recommended)

```bash
npm install -g png2icons
png2icons source-1024.png build/icon.icns
png2icons source-1024.png build/icon.ico
```

### Option 2: Using Online Converters

1. Create source icon: 1024x1024 PNG
2. Upload to converter (e.g., cloudconvert.com, icoconvert.com)
3. Download .icns and .ico files
4. Place in this directory

### Option 3: Using Electron Icon Maker

```bash
npm install -g electron-icon-maker
electron-icon-maker --input=source.png --output=build
```

## Icon Design Guidelines

- Start with 1024x1024 PNG with transparent background
- Simple, recognizable design that works at small sizes
- High contrast for visibility
- Avoid fine details that disappear at 16x16

## Placeholder Icon

For initial testing, you can use a simple colored square or circle with "CP" text. Replace with a professional icon before public release.
