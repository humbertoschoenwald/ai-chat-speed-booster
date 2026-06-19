# Firefox install guide

## Store install

Install AI Chat Speed Booster from Mozilla Add-ons:

- https://addons.mozilla.org/en-US/firefox/addon/ai-chat-speed-booster/

## Manual temporary install

1. Download the latest Firefox release asset from:
   - https://github.com/Noah4ever/ai-chat-speed-booster/releases
2. Extract the zip on your computer.
3. Open `about:debugging#/runtime/this-firefox`.
4. Click **Load Temporary Add-on**.
5. Select `manifest.json` inside the extracted `dist/firefox` folder.

Note: temporary add-ons are removed when Firefox restarts unless the extension is distributed through Mozilla Add-ons or otherwise signed for distribution.
