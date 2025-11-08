# Course Player - Local Course Viewer

A desktop application for watching local video courses with progress tracking, built with modern web technologies.

## Description

Course Player is an Electron-based desktop application that allows you to watch video courses stored locally on your computer. It features automatic progress tracking, a clean Material-UI interface with dark mode support, and efficient course navigation.

## Tech Stack

- **Electron 28** - Desktop application framework
- **React 18** - UI library
- **TypeScript 5** - Type-safe development
- **Material-UI v5** - Component library with theming
- **Redux Toolkit** - State management
- **HTML5 Video** - Native video playback with browser controls
- **react-markdown** - Markdown rendering with GFM support
- **remark-gfm** - GitHub Flavored Markdown plugin
- **electron-vite** - Fast build tool optimized for Electron
- **Vite** - Lightning-fast frontend tooling

## Prerequisites

- Node.js >= 18.0.0
- npm or yarn package manager

## Installation

1. Clone the repository or navigate to the project directory
2. Install dependencies:

```bash
npm install
```

## Development

Run the application in development mode with hot module replacement:

```bash
npm run dev
```

This will start the Electron app with:
- Hot reload for React components
- DevTools automatically opened (in development mode for debugging)
- Source maps for debugging

### Testing the Application

The application features a complete course management interface:

1. **Navigation**: Use the sidebar to navigate between Courses, Watch Course, and Settings pages
2. **Theme Toggle**: Click the sun/moon icon in the header to switch between light and dark mode
3. **Adding Courses**:
   - Go to the Courses page (home)
   - Click the "Add Course Folder" button in the header
   - Select a folder containing a valid `course.json` file
   - The course will appear in the grid view with thumbnail, metadata, and progress
4. **View Toggle**: Switch between grid and list views using the icon button next to "Add Course Folder"
5. **Opening Courses**: Click on any course card to navigate to the course viewer (placeholder in Phase 5)

The course list features:
- Responsive grid layout (3 columns → 2 columns → 1 column based on screen size)
- Skeleton loaders during course loading
- Empty state with helpful message when no courses are loaded
- Progress indicators showing completion percentage
- Course metadata including title, instructor, description, lesson count, and duration

## Building & Distribution

### Overview

The app can be packaged for macOS, Windows, and Linux using electron-builder. Builds are unsigned by default, which means users will see security warnings on first launch.

### Prerequisites

- **Node.js**: Version 18.0.0 or higher
- **npm**: Comes with Node.js
- **Platform-specific tools**:
  - macOS: Xcode Command Line Tools (for native modules)
  - Windows: Visual Studio Build Tools or Windows SDK (for native modules)
  - Linux: Standard build tools (gcc, make)

### Development Build

Run the application in development mode with hot reload:

```bash
npm run dev
```

Use this for testing during development. No build artifacts are created.

### Production Build

Compile TypeScript to JavaScript:

```bash
npm run build
```

This compiles the code into the `out/` directory. Required before running `package` or `dist` commands. This does NOT create an installer, only compiles the code.

### Packaging (Testing)

Package the app without creating an installer:

```bash
npm run package
```

**Output**: Unpacked app in `dist/[platform]/` directory

**Use case**: Test the packaged app before creating an installer

**How to test**:
- macOS: Open `dist/mac/Course Player.app`
- Windows: Run `dist/win-unpacked/Course Player.exe`
- Linux: Run `dist/linux-unpacked/course-player`

### Creating Installers

#### Current Platform

Create installer for your current platform:

```bash
npm run dist
```

**Output**:
- macOS: `dist/Course Player-0.1.0.dmg`
- Windows: `dist/Course Player Setup 0.1.0.exe`
- Linux: `dist/Course-Player-0.1.0.AppImage`

#### Specific Platform

Build for a specific platform:

```bash
npm run dist:mac    # macOS DMG
npm run dist:win    # Windows NSIS installer
npm run dist:linux  # Linux AppImage
```

**Note**: Building for other platforms may require additional setup (Wine for Windows builds on macOS/Linux)

#### All Platforms

Create installers for all platforms:

```bash
npm run dist:all
```

**Requirements**: Best results on macOS (can build all platforms with Wine)

**Output**: DMG, EXE, and AppImage in `dist/` directory

### Build Workflow

1. Make changes to code
2. Test with `npm run dev`
3. Compile with `npm run build`
4. (Optional) Test packaged app with `npm run package`
5. Create installer with `npm run dist`
6. Test installer on target platform
7. Distribute installer to users

### Platform-Specific Notes

#### macOS

- **Installer format**: DMG (disk image)
- **Architecture**: Universal binary (Intel x64 + Apple Silicon arm64)
- **Minimum OS**: macOS 10.15 (Catalina) or newer
- **Security warning**: "Course Player is from an unidentified developer"
  - **Solution**: Right-click app > Open, or run `xattr -cr /Applications/Course\ Player.app`
  - **Prevention**: Code signing with Apple Developer certificate (requires $99/year account)
- **Installation**: Drag app to Applications folder from DMG
- **Uninstallation**: Drag app from Applications to Trash

#### Windows

- **Installer format**: NSIS (Nullsoft Scriptable Install System)
- **Architecture**: x64 (64-bit)
- **Minimum OS**: Windows 10 or newer
- **Security warning**: Windows SmartScreen "Windows protected your PC"
  - **Solution**: Click "More info" > "Run anyway"
  - **Prevention**: Code signing with certificate (requires $100-400/year certificate)
- **Installation**: Run installer, choose install location, click Install
- **Uninstallation**: Control Panel > Programs > Uninstall
- **Shortcuts**: Desktop and Start Menu shortcuts created automatically

#### Linux

- **Installer format**: AppImage (portable, no installation required)
- **Architecture**: x64 (64-bit)
- **Minimum OS**: Most modern distributions (Ubuntu 20.04+, Fedora 35+, etc.)
- **Security**: No warnings, AppImage is self-contained
- **Making executable**: `chmod +x Course-Player-0.1.0.AppImage`
- **Running**: `./Course-Player-0.1.0.AppImage` or double-click in file manager
- **Installation**: Optional, can integrate with system using AppImageLauncher
- **Uninstallation**: Delete AppImage file

### File Sizes (Approximate)

- macOS DMG: 150-200 MB (includes Electron runtime)
- Windows EXE: 120-180 MB
- Linux AppImage: 140-190 MB

### Distribution

#### Recommended Approach

**1. GitHub Releases**:
- Create a new release on GitHub
- Upload installers as release assets
- Users download directly from GitHub
- Free and easy to set up
- Supports auto-update in future

**2. Direct Download**:
- Host installers on personal website or CDN
- Provide download links for each platform
- Consider using a download page with platform detection

**3. App Stores** (Future consideration):
- Mac App Store (requires Apple Developer account, review process)
- Microsoft Store (requires developer account, review process)
- Snap Store / Flathub (Linux, free but requires packaging)

### Code Signing (Optional)

#### Why sign?

- Removes security warnings on macOS and Windows
- Required for auto-updates
- Builds user trust
- Required for app store distribution

#### macOS Code Signing

**Requirements**:
- Apple Developer account ($99/year)
- Developer ID Application certificate
- Xcode or Xcode Command Line Tools

**Process**:
1. Obtain certificate from Apple Developer portal
2. Install certificate in Keychain
3. Add to `electron-builder.json`:
   ```json
   "mac": {
     "identity": "Developer ID Application: Your Name (TEAM_ID)",
     "hardenedRuntime": true,
     "gatekeeperAssess": false,
     "entitlements": "build/entitlements.mac.plist",
     "entitlementsInherit": "build/entitlements.mac.plist"
   }
   ```
4. Run `npm run dist:mac`

**Notarization** (additional step):
- Required for macOS 10.15+
- Upload signed app to Apple for scanning
- Staple notarization ticket to app
- Add `afterSign` script to electron-builder.json

#### Windows Code Signing

**Requirements**:
- Code signing certificate ($100-400/year from DigiCert, Sectigo, etc.)
- Certificate file (.pfx or .p12) and password

**Process**:
1. Obtain certificate from certificate authority
2. Add to `electron-builder.json`:
   ```json
   "win": {
     "certificateFile": "path/to/certificate.pfx",
     "certificatePassword": "password"
   }
   ```
3. Or use environment variables:
   - `CSC_LINK`: Path to certificate file
   - `CSC_KEY_PASSWORD`: Certificate password
4. Run `npm run dist:win`

#### Linux Code Signing

- Not required for Linux
- AppImage is self-contained and portable
- No security warnings by default

### Auto-Updates (Optional, Future Enhancement)

**Requirements**:
- Update server (GitHub Releases, S3, custom server)
- electron-updater package
- Code signing (required for macOS/Windows)
- Version management strategy

**Implementation**:
1. Install electron-updater: `npm install electron-updater`
2. Configure publish in electron-builder.json:
   ```json
   "publish": {
     "provider": "github",
     "owner": "your-username",
     "repo": "course-player"
   }
   ```
3. Add update check in main process
4. Handle update events (download, install, restart)
5. Test update flow

### Troubleshooting

#### Build fails with "Cannot find module"

**Solution**: Run `npm install` to ensure all dependencies are installed. Check that `out/` directory exists after `npm run build`. Verify `files` configuration in electron-builder.json includes `out/**/*`.

#### App crashes on launch after packaging

**Solution**: Check that `main` field in package.json points to `out/main/index.js`. Verify all required files are included in `files` configuration. Test with `npm run package` before creating installer. Check console logs for error messages.

#### "Application is damaged" on macOS

**Cause**: Gatekeeper blocking unsigned app

**Solution**: Run `xattr -cr /Applications/Course\ Player.app` or right-click app > Open (first time only)

**Prevention**: Code signing

#### Windows SmartScreen warning

**Cause**: Unsigned executable

**Solution**: Click "More info" > "Run anyway"

**Prevention**: Code signing

#### Linux AppImage won't run

**Cause**: Not marked as executable

**Solution**: `chmod +x Course-Player-*.AppImage` or right-click > Properties > Permissions > Allow executing file as program

#### Build is very slow

**Solution**: Use `npm run dist` instead of `npm run dist:all` (build for current platform only). Disable compression: Set `"compression": "store"` in electron-builder.json. Use faster machine or CI/CD service.

#### "ENOSPC: no space left on device"

**Cause**: Insufficient disk space

**Solution**: Free up disk space (builds require 1-2 GB temporary space). Clean build artifacts: `npm run clean`.

#### Cross-platform builds fail

**Cause**: Missing Wine (for Windows builds on macOS/Linux)

**Solution**: Install Wine: `brew install wine-stable` (macOS) or `apt install wine` (Linux). Or build on target platform using CI/CD.

### CI/CD Integration (Optional, Future Enhancement)

#### GitHub Actions

Create `.github/workflows/build.yml` for automated builds:

```yaml
name: Build
on:
  push:
    tags:
      - 'v*'
jobs:
  build:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [macos-latest, windows-latest, ubuntu-latest]
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run build
      - run: npm run dist
      - uses: actions/upload-artifact@v3
        with:
          name: ${{ matrix.os }}
          path: dist/*
```

### Resources

- electron-builder documentation: https://www.electron.build/
- Electron documentation: https://www.electronjs.org/docs/latest/
- Code signing guide: https://www.electron.build/code-signing
- Auto-update guide: https://www.electron.build/auto-update

### Notes

- First build may take longer (downloads Electron binaries)
- Subsequent builds are faster (uses cache)
- Building for all platforms from one machine requires macOS
- Consider using CI/CD for automated builds on multiple platforms
- Test installers on target platforms before public release

## Type Checking

Run TypeScript type checking without emitting files:

```bash
npm run typecheck
```

## Project Structure

```
course-player/
├── electron/              # Electron main process and preload scripts
│   ├── main/              # Main process
│   │   └── index.ts       # Main process entry point
│   └── preload/           # Preload script
│       └── index.ts       # Preload script for secure IPC
├── src/                   # Application source code
│   ├── renderer/          # React renderer application
│   │   ├── App.tsx        # Root React component
│   │   ├── main.tsx       # React entry point
│   │   ├── index.html     # HTML template
│   │   ├── components/    # React components
│   │   │   ├── Layout/    # Layout components
│   │   │   │   ├── MainLayout.tsx  # Main layout with drawer
│   │   │   │   ├── Header.tsx      # App bar header
│   │   │   │   ├── Sidebar.tsx     # Navigation sidebar
│   │   │   │   └── constants.ts    # Layout constants
│   │   │   ├── CourseList/         # Course list components
│   │   │   │   ├── CourseCard.tsx  # Individual course card
│   │   │   │   ├── CourseList.tsx  # Course list with grid/list views
│   │   │   │   └── index.ts        # Barrel exports
│   │   │   └── CourseViewer/       # Course viewer components
│   │   │       ├── VideoPlayer.tsx # Video player with HTML5 video
│   │   │       ├── VideoControls.tsx # Custom controls (placeholder)
│   │   │       ├── LessonList.tsx  # Collapsible section list with completion indicators
│   │   │       ├── LessonDetails.tsx # Tabbed interface for notes, resources, and links
│   │   │       └── index.ts        # Barrel exports
│   │   ├── pages/         # Page-level components for routes
│   │   │   ├── CoursesPage.tsx     # Courses list page
│   │   │   ├── CourseViewerPage.tsx # Course viewer page
│   │   │   ├── SettingsPage.tsx    # Settings page
│   │   │   ├── NotFoundPage.tsx    # 404 error page
│   │   │   └── index.ts            # Barrel exports
│   │   └── services/      # Service modules for file operations
│   │       ├── fileSystem.ts       # File system IPC wrapper
│   │       ├── courseLoader.ts     # Course metadata utilities
│   │       └── videoLoader.ts      # Video file loading and Blob URL management
│   ├── types/             # TypeScript type definitions
│   │   ├── course.ts      # Course data types
│   │   ├── progress.ts    # Progress tracking types
│   │   ├── electron.d.ts  # Electron API types
│   │   └── index.ts       # Barrel exports
│   ├── store/             # Redux store configuration
│   │   ├── slices/        # Redux slices
│   │   │   ├── coursesSlice.ts  # Courses state management
│   │   │   ├── playerSlice.ts   # Player state management
│   │   │   └── progressSlice.ts # Progress state management
│   │   ├── index.ts       # Store configuration
│   │   └── hooks.ts       # Typed Redux hooks
│   └── utils/             # Utility functions
└── out/                   # Build output (generated)
    ├── main/              # Built main process
    ├── preload/           # Built preload scripts
    └── renderer/          # Built renderer application
```

## IPC Bridge Architecture

The application uses a secure three-layer architecture for communication between the Electron processes:

**Main Process (Node.js)** ↔ **Preload Script (contextBridge)** ↔ **Renderer Process (React)**

### Available IPC Methods

- **`selectFolder()`** - Opens native folder selection dialog
- **`loadCourse(folderPath)`** - Reads and parses course.json from a folder
- **`saveProgress(progressData)`** - Saves progress data to persistent storage
- **`readFile(filePath)`** - Reads file contents (for lesson notes, resources, etc.)
- **`loadProgress()`** - Loads saved progress data
- **`readVideoFile(filePath)`** - Reads video file as binary data (ArrayBuffer) for video player
- **`readImageFile(filePath)`** - Reads image file as binary data (ArrayBuffer) for thumbnails
- **`openResource(filePath)`** - Opens resource file with system's default application
- **`openExternalLink(url)`** - Opens external URL in default browser

### Security Model

The IPC bridge follows Electron security best practices:
- **Context Isolation**: Renderer process cannot access Node.js APIs directly
- **Sandboxing**: Renderer process runs in a sandboxed environment
- **No Node Integration**: Node.js is disabled in the renderer process
- **Limited API Surface**: Only specific IPC methods are exposed via contextBridge
- **Type Safety**: Full TypeScript support for all IPC methods

## File System Operations

### Progress Data Storage

Progress data is automatically saved to: `~/.course-player/progress.json`

This location is in the user's home directory and persists across application restarts.

### Course Folder Structure

Course folders must contain a `course.json` file with the following required fields:
- `id` - Unique course identifier
- `title` - Course title
- `sections` - Array of course sections with lessons

Detailed course JSON structure documentation will be added in Phase 4 of development.

## State Management Architecture

The application uses **Redux Toolkit** for state management with three specialized slices:

### Courses Slice (`coursesSlice`)
Manages loaded courses, selected course, and course folders:
- Stores array of loaded course data
- Tracks currently selected/active course
- Manages list of course folder paths
- Async thunks for loading courses from folders
- Memoized selectors for efficient data access

### Player Slice (`playerSlice`)
Manages video playback state:
- Current lesson being played
- Playback position and duration
- Playback speed (0.5x - 2.0x)
- Volume and muted state
- Player status (playing, paused, buffering)
- Fullscreen and Picture-in-Picture modes

### Progress Slice (`progressSlice`)
Manages watch progress and completion tracking:
- Watch history per lesson (time watched, last position)
- Completion status (90% threshold)
- Course-level progress aggregation
- Async thunks for loading/saving progress to disk
- Auto-save functionality with dirty state tracking

### Typed Redux Hooks

Always use the typed hooks instead of plain Redux hooks for type safety:
- `useAppDispatch()` - Type-safe dispatch with thunk support
- `useAppSelector()` - Type-safe state selection with full IntelliSense

**Example usage:**
```typescript
import { useAppDispatch, useAppSelector } from '@/renderer/store/hooks'
import { selectAllCourses, loadCourseFromFolder } from '@/renderer/store/slices/coursesSlice'

const courses = useAppSelector(selectAllCourses)
const dispatch = useAppDispatch()
dispatch(loadCourseFromFolder(folderPath))
```

### Redux DevTools

Redux DevTools are enabled in development mode for debugging state changes. Install the browser extension for [Chrome](https://chrome.google.com/webstore/detail/redux-devtools/) or [Firefox](https://addons.mozilla.org/en-US/firefox/addon/reduxdevtools/).

## Type System

The application uses comprehensive TypeScript interfaces for type safety throughout:

### Course Types (`src/renderer/types/course.ts`)
- **`Course`** - Complete course structure with sections, lessons, and metadata
- **`CourseSection`** - Course section containing lessons
- **`Lesson`** - Individual lesson with video path, duration, notes, resources
- **`CourseResource`** - Downloadable resource attached to a lesson
- **`CourseLink`** - External reference link
- **`CourseId`, `LessonId`, `SectionId`** - Type aliases for IDs

### Progress Types (`src/renderer/types/progress.ts`)
- **`ProgressData`** - Complete progress data structure persisted to disk
- **`CourseProgress`** - Progress tracking for an entire course
- **`LessonProgress`** - Progress tracking for an individual lesson
- **`ProgressState`** - Runtime state with loading/saving metadata

### Electron API Types (`src/renderer/types/electron.d.ts`)
- Global `window.electron` type definitions
- Full type safety for all IPC methods
- No imports needed - types are globally available

### Barrel Exports

All types are exported from `src/types/index.ts` for convenient imports:
```typescript
import { Course, ProgressData, LessonProgress } from '@/types'
```

## Application Architecture

### Layout System

The application uses a responsive drawer pattern:
- **Mobile (< 960px)**: Temporary drawer with overlay, hamburger menu in header
- **Desktop (≥ 960px)**: Permanent drawer always visible, content shifts right
- **Drawer width**: 240px

Component hierarchy: App → MainLayout → (Header + Sidebar + Outlet)

The theme toggle is in the Header, accessible on all pages.

### Routing Structure

Main routes:
- `/` - Courses list (home page)
- `/viewer` - Course viewer without specific course
- `/viewer/:courseId` - Course viewer for specific course
- `/settings` - Application settings
- `*` - 404 Not Found page

React Router v6 is used with BrowserRouter and v7 future flags enabled for smooth upgrades. All routes are nested under MainLayout for consistent UI.

### Navigation

Sidebar navigation items:
- **Courses** (Home icon) - navigates to `/`
- **Watch Course** (PlayCircle icon) - navigates to `/viewer`
- **Settings** (Settings icon) - navigates to `/settings`

Active route is highlighted in the sidebar. Clicking navigation items closes the mobile drawer automatically.

## Course Management

### Course List Features

The course list provides a professional interface for managing and browsing your local courses:

**View Modes:**
- **Grid View** (default): Responsive grid layout with 3 columns on desktop (≥ 960px), 2 columns on tablet (≥ 600px), and 1 column on mobile
- **List View**: Single column with full-width cards for detailed viewing
- **Toggle button**: Switch between views using the GridView/ViewList icon button in the header

**Course Cards:**
- **Thumbnail display**: Shows course thumbnail image with fallback to VideoLibrary icon for courses without thumbnails
- **Course metadata**: Displays title, instructor (if provided), and description
- **Progress indicator**: Linear progress bar showing completion percentage based on completed lessons
- **Lesson information**: Chips displaying total lesson count and course duration
- **Click to open**: Entire card is clickable to navigate to course viewer

**Loading States:**
- **Skeleton loaders**: Displays 6 skeleton placeholders during course loading with wave animation
- **Loading spinner**: Shows during async operations

**Empty States:**
- **Helpful message**: When no courses are loaded, displays "No Courses Yet" with VideoLibrary icon
- **Call to action**: Prominently displays "Add Course Folder" button with instructions

**Error Handling:**
- **Alert component**: Displays error messages with dismiss action
- **Snackbar notifications**: Shows success/error feedback for course loading operations

### Adding Courses

To add a course to your library:

1. Click the **"Add Course Folder"** button in the header
2. Select a folder containing a valid `course.json` file in the native folder selection dialog
3. The course is validated and loaded into the Redux store
4. Course appears in the list with thumbnail, metadata, and progress
5. Progress tracking is automatically initialized for the new course

Courses persist in the Redux store during the session. Progress data is saved to `~/.course-player/progress.json`.

### Course Metadata

Course information is calculated and displayed automatically:

- **Duration**: Total duration calculated from all lesson durations, displayed in human-readable format (e.g., "2h 30m")
- **Lesson count**: Total number of lessons across all sections
- **Progress percentage**: Calculated from completed lessons vs. total lessons
- **Thumbnails**: Loaded from course folder using `file://` protocol with path from `course.json`

## Course JSON Format

Course folders must contain a `course.json` file at the root level. The file structure is defined by the `Course` interface in `src/renderer/types/course.ts`.

### Required Fields

- **`id`** (string): Unique course identifier
- **`title`** (string): Course title
- **`sections`** (array): Array of course sections, each containing:
  - **`id`** (string): Unique section identifier
  - **`title`** (string): Section title
  - **`lessons`** (array): Array of lessons, each containing:
    - **`id`** (string): Unique lesson identifier
    - **`title`** (string): Lesson title
    - **`videoPath`** (string): Relative path to video file from course folder
    - **`duration`** (number): Lesson duration in seconds

### Optional Fields

- **`description`** (string): Course description
- **`instructor`** (string): Instructor name
- **`thumbnail`** (string): Relative path to thumbnail image from course folder
- **`tags`** (array of strings): Course tags/categories
- **`difficulty`** (string): Course difficulty level
- **`createdAt`** (string): ISO timestamp (auto-added if missing)
- **`duration`** (number): Total course duration in seconds (auto-calculated if missing)
- **`totalLessons`** (number): Total lesson count (auto-calculated)

### Minimal Example

```json
{
  "id": "course-001",
  "title": "Introduction to React",
  "sections": [
    {
      "id": "section-1",
      "title": "Getting Started",
      "lessons": [
        {
          "id": "lesson-1",
          "title": "What is React?",
          "videoPath": "./videos/01-intro.mp4",
          "duration": 600
        },
        {
          "id": "lesson-2",
          "title": "Setting Up Your Environment",
          "videoPath": "./videos/02-setup.mp4",
          "duration": 900
        }
      ]
    }
  ]
}
```

### Complete Example

```json
{
  "id": "react-advanced-2024",
  "title": "Advanced React Patterns",
  "description": "Master advanced React patterns and best practices",
  "instructor": "John Doe",
  "thumbnail": "./assets/thumbnail.jpg",
  "tags": ["react", "javascript", "frontend"],
  "difficulty": "advanced",
  "sections": [
    {
      "id": "section-1",
      "title": "Compound Components",
      "lessons": [
        {
          "id": "lesson-1-1",
          "title": "Introduction to Compound Components",
          "videoPath": "./videos/01-compound-intro.mp4",
          "duration": 720
        }
      ]
    }
  ]
}
```

The `courseLoader` service automatically enriches course data with calculated fields like `duration` and `totalLessons` when courses are loaded.

## Video Player

The application uses native **HTML5 video element** with custom controls for reliable video playback with comprehensive features.

### Player Features

**Playback Controls:**
- Play/pause with visual feedback
- Seek bar with precise time scrubbing
- Volume control and mute toggle
- Playback speed adjustment (0.5x - 2.0x)
- Fullscreen mode
- Picture-in-Picture (PiP) mode

**Progress Tracking:**
- Auto-resume from last watched position (if > 5 seconds and < 90% complete)
- Real-time progress tracking (saved every 2 seconds)
- Automatic lesson completion at 90% threshold
- Watch duration tracking for each lesson
- Progress persisted to `~/.course-player/progress.json`

**Navigation:**
- Auto-play next lesson after current lesson ends (2 second delay)
- Next/Previous lesson navigation
- Seamless section transitions

**Keyboard Shortcuts:**
Browser provides native keyboard shortcuts:
- **Space**: Play/pause
- **F**: Toggle fullscreen (browser-dependent)
- **M**: Toggle mute (browser-dependent)
- **Arrow Left/Right**: Seek backward/forward
- **Arrow Up/Down**: Volume up/down

### Video Loading Architecture

The application uses a Blob URL approach to load local video files:

1. **IPC Request**: Renderer requests video file via `window.electron.readVideoFile(filePath)`
2. **File Reading**: Main process reads video file as Buffer using Node.js `fs.readFile()`
3. **Buffer Transfer**: Buffer is converted to ArrayBuffer for IPC transfer to renderer
4. **Blob Creation**: Renderer creates Blob from ArrayBuffer with correct MIME type
5. **URL Generation**: Blob URL is created via `URL.createObjectURL()` for video player
6. **Cleanup**: Blob URL is revoked when component unmounts or video changes

This approach avoids CORS issues and enables proper video seeking/scrubbing.

### Supported Video Formats

The player supports all formats compatible with modern browsers:
- **MP4** (H.264, AAC) - Recommended
- **WebM** (VP8/VP9, Vorbis/Opus)
- **OGG** (Theora, Vorbis)
- **MOV** (QuickTime)
- **AVI** (limited browser support)
- **MKV** (limited browser support)

**Recommendation**: Use MP4 with H.264 video codec and AAC audio codec for best compatibility and performance.

### Video Player Integration

The video player is integrated with Redux for state management:

**progressSlice Integration:**
- `setCurrentTime`: Updates current playback position every 2 seconds
- `updateLessonProgress`: Tracks watched duration (only when playing)
- `markLessonComplete`: Marks lesson complete at 90% threshold or on video end
- `selectLessonProgress`: Retrieves lesson progress for auto-resume

### Course Viewer Page

Navigate to a course's viewer page by clicking on a course card. The viewer includes:

1. **Course Title**: Displayed at the top
2. **Video Player**: Full-width responsive player (16:9 aspect ratio)
3. **Lesson Info**: Current lesson title, description, and section name
4. **Auto-Navigation**: Automatically advances to next lesson when current lesson ends

**URL Pattern**: `/viewer/:courseId`

Example: `/viewer/react-advanced-2024`

## Lesson Navigation & Details

The application provides a comprehensive interface for navigating through course content and accessing lesson materials.

### Overview

The lesson navigation system uses a two-column responsive layout:
- **Desktop (≥ 960px)**: Video player and lesson info on the left (70%), navigation and details on the right (30%)
- **Mobile (< 960px)**: Single column with video first, then lesson info, then collapsible navigation and details
- Integrates with progress tracking for real-time completion status
- Supports markdown rendering for lesson notes with GitHub Flavored Markdown

### Lesson List Features

**Collapsible Sections:**
- Each course section displays as a collapsible accordion component
- Section headers show title, description, and completion progress (e.g., "3/5 lessons complete")
- The section containing the current lesson is automatically expanded
- Users can manually expand/collapse other sections for better organization

**Lesson Items:**
- Each lesson displays title, description (if available), and duration in MM:SS format
- **Completion indicators:**
  - Green checkmark (✓) for completed lessons (90% watch threshold reached)
  - Gray circle outline (○) for incomplete lessons
- Current lesson is highlighted with the theme's primary color
- Click any lesson to load it in the video player and switch sections seamlessly

**Progress Integration:**
- Completion status synced with Redux progress tracking in real-time
- Lessons are marked complete when reaching 90% of video duration
- Section progress calculated automatically based on completed lessons
- Progress persists to `~/.course-player/progress.json`

### Lesson Details Features

**Tabbed Interface:**
- Three tabs: Notes, Resources, Links
- Badge indicators show count of resources and links for quick reference
- Smooth tab transitions with Material-UI animations
- Navigation buttons (Previous/Next) at the top of the panel

**Notes Tab:**
- Renders lesson notes from markdown files (`.md` format)
- **GitHub Flavored Markdown (GFM) support:**
  - Tables with column alignment
  - Strikethrough text (~~text~~)
  - Task lists (- [ ] and - [x])
  - Autolinks for URLs and email addresses
  - Syntax highlighting for code blocks
  - Proper heading hierarchy (h1-h6)
- **Custom styling with Material-UI components:**
  - Headings use Typography variants (h4, h5, h6)
  - Links open in new tab with `rel="noopener noreferrer"` security attributes
  - Code blocks styled with Paper component and monospace font
  - Inline code with subtle background color
- Loading states with spinner animation
- Error handling for missing/corrupted files with user-friendly alerts
- Placeholder message if no notes are available: "No notes available for this lesson"

**Resources Tab:**
- Lists downloadable resources (PDFs, ZIPs, code files, etc.)
- **Each resource displays:**
  - File type icon (PDF document, ZIP archive, generic file)
  - Resource title and type (from course.json or file extension)
  - Click to open with default application
- Uses Electron's `shell.openPath` API for secure file opening with system default apps
- Error handling for missing files or permission issues
- Success/error notifications via snackbar (auto-dismiss after 4 seconds)
- Placeholder message if no resources: "No resources available for this lesson"

**Links Tab:**
- Lists external reference links for additional learning materials
- **Each link displays:**
  - Link icon
  - Link title and description (if provided in course.json)
  - URL preview in secondary text
  - Click to open in default browser
- Uses Electron's `shell.openExternal` API for secure URL opening
- Opens in new browser tab/window
- URL validation (must start with http:// or https://)
- Success/error notifications via snackbar
- Placeholder message if no links: "No external links for this lesson"

**Navigation Buttons:**
- Previous/Next lesson buttons at the top of details panel
- Buttons are disabled appropriately:
  - Previous disabled on first lesson of course
  - Next disabled on last lesson of course
- Seamless navigation across sections (auto-advances to next section after last lesson)
- Integrates with video player auto-advance feature for continuous learning

### Responsive Layout

**Desktop (≥ 960px):**
- Two-column layout with 8/4 Material-UI Grid split
- Left column: Video player (16:9 aspect ratio) + lesson info (title, description, section)
- Right column: Lesson list (max height 400px, scrollable) + lesson details (tabs, scrollable content)
- Both columns independently scrollable for long content
- Lesson list has max height constraint to prevent excessive scrolling

**Mobile (< 960px):**
- Single-column stacked layout for better mobile experience
- Order: Video player → Lesson info → Lesson list → Lesson details
- All sections full-width for optimal mobile viewing
- Optimized touch targets for mobile interaction (44px minimum)
- Collapsible accordions reduce screen clutter

### Markdown Rendering

**Supported Syntax:**
- **Headings**: # ## ### #### ##### ######
- **Text formatting**: **bold**, *italic*, ~~strikethrough~~
- **Lists**: Ordered (1. 2. 3.) and unordered (- * +)
- **Task lists**: - [ ] Unchecked, - [x] Checked
- **Tables**: Full GFM table support with alignment
- **Code blocks**: Fenced code blocks with language syntax highlighting
- **Inline code**: Single backticks for inline code
- **Links**: [text](url) - opens in new tab with security attributes
- **Images**: ![alt](src) - if referenced in markdown
- **Blockquotes**: > quoted text
- **Horizontal rules**: --- or ***

**Security:**
- Markdown rendered safely by default (no raw HTML execution)
- External links open with `rel="noopener noreferrer"` to prevent security vulnerabilities
- File paths validated before opening with system apps
- URL format validated before opening in browser (http:// or https:// only)

**File Paths:**
- Notes, resources, and links use relative paths from course folder
- Paths resolved to absolute paths at runtime using `resolveVideoPath` helper
- Example: `./notes/lesson-01.md` → `/path/to/course/notes/lesson-01.md`
- File existence validated before attempting to read or open

### Course Content Example

Example lesson with all features enabled:

```json
{
  "id": "lesson-1",
  "title": "Introduction to React Hooks",
  "videoPath": "./videos/01-hooks-intro.mp4",
  "duration": 720,
  "description": "Learn the basics of React Hooks",
  "notes": "./notes/01-hooks.md",
  "resources": [
    {
      "title": "Starter Code",
      "path": "./resources/01-starter.zip",
      "type": "application/zip"
    },
    {
      "title": "Cheat Sheet",
      "path": "./resources/hooks-cheatsheet.pdf",
      "type": "application/pdf"
    }
  ],
  "links": [
    {
      "title": "React Hooks Documentation",
      "url": "https://react.dev/reference/react",
      "description": "Official React documentation for Hooks API"
    },
    {
      "title": "Hooks FAQ",
      "url": "https://react.dev/learn/hooks-faq"
    }
  ]
}
```

## Testing Redux Integration

To verify the Redux store setup is working correctly:

1. Run `npm run dev`
2. Navigate to the Courses page using the sidebar (default home page)
3. Click the "Add Course Folder" button in the header
4. Select a folder containing a valid `course.json` file
5. The course will be loaded, validated, and enriched with metadata
6. Course appears in the grid/list view with progress tracking initialized
7. Open Redux DevTools (if installed) to inspect state changes in `courses` and `progress` slices
8. Click on a course card to navigate to the viewer (viewer page is a placeholder until Phase 6)

The Redux store now includes:
- **`coursesSlice`**: Loaded courses with enriched metadata (duration, lesson count, timestamps)
- **`progressSlice`**: Progress tracking for each course (completion percentage, watch time)
- **Async thunks**: `loadCourseFromFolder`, `loadProgress`, `saveProgress`
- **Memoized selectors**: Efficient data access with automatic re-computation

## Features (Planned)

- ✅ Phase 1: Project setup with Electron + React + TypeScript + Material-UI
- ✅ Phase 2: File system integration and course folder selection
- ✅ Phase 3: Redux state management setup
- ✅ Phase 4: Main application layout with responsive drawer and routing
- ✅ Phase 5: Course list with grid/list view toggle, progress indicators, and loading states
- ✅ Phase 6: Video player with HTML5 video, auto-resume, and progress tracking
- ✅ Phase 7: Lesson navigation with collapsible sections, markdown notes, resources, and external links
- ✅ Phase 8: Settings management, course search/filter, Continue Watching section, and keyboard shortcuts customization
- 🔲 Phase 9: Testing and optimization
- 🔲 Phase 10: Packaging for distribution

## Phase 8 Features

### Settings & Preferences

Comprehensive settings system with localStorage persistence accessible via Settings icon in header.

**Settings Categories:**
- **General**: Course folder management, view preferences, Continue Watching toggle
- **Playback**: Default playback speed (0.5x-2.0x), auto-play next lesson toggle
- **Appearance**: Theme selection (Light/Dark/System)
- **Keyboard Shortcuts**: Customizable video player shortcuts (Play/Pause, Seek, Volume, Fullscreen)

**Key Features:**
- All settings persist across app restarts via localStorage
- Settings dialog with tabbed interface for easy navigation
- Theme changes apply immediately without restart
- Default playback speed applied to all new videos
- Auto-play next lesson respects user preference

### Course Search & Filter

Real-time search and multi-criteria filtering for course discovery.

**Search Features:**
- Text search across course title, description, and instructor (case-insensitive)
- Instant results as you type (no debouncing needed)
- Clear button to reset search

**Filter Options:**
- **Instructor Filter**: Filter by specific instructor or view all
- **Completion Filter**: All Courses | Completed | In Progress | Not Started
- Filters combine using AND logic for precise results

**Active Filters Display:**
- Visual chips showing currently active filters
- Remove individual filters by clicking chip delete icon
- "Clear Filters" button to reset all at once

### Continue Watching

Prominent section showing most recently watched course for easy resumption.

**Features:**
- Displays course title, completion percentage, and last watched timestamp
- Visual progress bar showing course completion
- Large "Resume" button for one-click continuation
- Auto-resume from last position when clicking Resume
- Can be hidden via Settings > General > Show Continue Watching

## Security

This application follows Electron security best practices:
- Context isolation enabled
- Node integration disabled in renderer
- Sandboxing enabled
- Content Security Policy configured
- IPC communication via secure contextBridge

## Troubleshooting

### Common Issues

**Issue: `window.electron is undefined`**
- **Solution**: Check that the preload script is loaded correctly. The preload script path should be configured in `electron/main/index.ts` and the file should exist at `electron/preload/index.ts`.

**Issue: IPC handler not found**
- **Solution**: Verify that the IPC handler is registered in the main process (`electron/main/index.ts`) using `ipcMain.handle()`. Check the console for error messages.

**Issue: Permission denied when saving progress**
- **Solution**: Check file system permissions for the `.course-player` directory in your home folder. The application should automatically create this directory, but manual creation may be needed in some cases:
  ```bash
  mkdir -p ~/.course-player
  chmod 755 ~/.course-player
  ```

**Issue: Course file not found**
- **Solution**: Ensure the selected folder contains a `course.json` file at its root level. The file must be valid JSON with required fields (`id`, `title`, `sections`).

**Issue: Markdown notes not displaying**
- **Solution**: Check that the notes file exists at the path specified in `course.json`. Verify the file is valid markdown and readable. Check the console for file loading errors. Ensure the path is relative to the course folder (e.g., `./notes/lesson-01.md`).

**Issue: Resource won't open**
- **Solution**: Verify the resource file exists and is not corrupted. Check file permissions. Ensure you have a default application configured for the file type. On macOS, you may need to grant Electron permission to access files in System Settings > Privacy & Security.

**Issue: External link won't open**
- **Solution**: Verify the URL is valid and starts with `http://` or `https://`. Check your default browser settings. Some security software may block external link opening from Electron applications.

**Issue: Lesson list not showing completion status**
- **Solution**: Ensure progress tracking is working (check `~/.course-player/progress.json` exists and is readable). Verify lessons are being marked complete when reaching 90% of video duration. Check Redux DevTools to inspect progress state. Restart the application if progress appears stale.

## License

MIT
