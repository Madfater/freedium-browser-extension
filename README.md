# Open in Freedium - Browser Extension

A browser extension to quickly open Medium articles in [Freedium](https://freedium-mirror.cfd) to bypass the paywall.

> This project is forked from [wywywywy/freedium-browser-extension](https://github.com/wywywywy/freedium-browser-extension). Thanks to the original author [wywywywy](https://github.com/wywywywy) for the contribution.

![Screenshot showing "Open in Freedium" in context menu](assets/screenshot.png)

## Features

- Right-click on any Medium link and select "Open in Freedium"
- Right-click anywhere on a Medium article page to open it directly
- Customizable Freedium domain
- Whitelist / Blacklist filter modes
- Custom URL patterns (e.g., for self-hosted Medium blogs)

## Installation (Chrome / Edge)

Since this extension has been removed from the Chrome Web Store, you need to load it manually:

1. Clone this repo
2. Run `build.sh` (Linux / macOS) or `build.bat` (Windows)
3. Open the Extensions page in Chrome `chrome://extensions` (or `edge://extensions` for Edge)
4. Enable "Developer mode"
5. Click "Load unpacked"
6. Select the `chrome` directory created by the build script

## Usage

1. Click the extension icon to open the settings panel
2. Customize the Freedium domain if needed
3. Choose a filter mode:
   - **Whitelist**: Show context menu only on medium.com and matching URLs
   - **Blacklist**: Show context menu on all pages, except matching URLs
4. Click "Manage >" to manage custom URL patterns

## Project Structure

```
├── manifest.json          # Chrome MV3 manifest
├── src/
│   ├── background.js      # Service worker (context menus, message handling)
│   ├── options.html/js/css # Extension settings panel
│   ├── patterns.html/js/css # URL patterns management page
├── icons/                 # Extension icons
├── build.sh / build.bat   # Build scripts
```

## Credits

- Original author: [wywywywy](https://github.com/wywywywy)
- Original repo: [wywywywy/freedium-browser-extension](https://github.com/wywywywy/freedium-browser-extension)
