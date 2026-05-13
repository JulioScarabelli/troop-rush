# Troop Rush

Endless side-scrolling runner where you choose gates and fight enemy waves. Build your squad through smart gate choices and survive as long as possible.

## Core gameplay loop

1. Your squad auto-runs to the right
2. Gates appear with two lane choices — one good (+troops or multiplier), one bad (-troops)
3. Press UP or DOWN to pick a lane before hitting the gate
4. Between gates, enemy waves appear and your troops auto-shoot them
5. Enemies that reach your squad kill troops 1:1
6. Game ends when troop count reaches 0
7. Score = distance traveled

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173 in a browser.

To test on mobile: Open the Network URL shown in the terminal on a device connected to the same WiFi.

## Controls

- **UP / DOWN buttons** on screen (mobile)
- **Arrow Up / Arrow Down** keys (desktop)

## Testing

- **Resetting**: Clear site data or use an incognito window
- **Tuning**: Edit CSV files in `data/` and refresh the browser

## Sprites

- Sprite paths are theme-wrapped at runtime via `resolveSpritePath()`.
- Assets go in `data/sprites/themes/<theme>/...`
