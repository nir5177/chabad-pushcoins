
---

## Hard Rules (never violate)

### Stay on Expo Managed Workflow
- **Never run `expo eject` or `expo prebuild` without explicit approval.**
- No bare React Native. No native `android/` or `ios/` folders.
- All native config goes through `app.json` plugins or Expo config plugins
  (like `withAndroidQueries.js`).
- Reason: ejecting breaks the EAS Build pipeline and `build.sh`.

### EAS for Builds, Always
- Production builds: `eas build --platform android` (or `ios`).
- Never instruct the user to run `gradle`, `xcodebuild`, or open Android Studio.
- `eas.json` defines the build profiles — modify it, don't bypass it.

### Hebrew / RTL First
- All user-facing strings are Hebrew.
- Use `I18nManager.forceRTL(true)` if needed, but verify icons/arrows flip correctly.
- No hardcoded English labels in JSX. No `marginLeft`/`paddingLeft` — use
  `marginStart`/`paddingStart` so RTL works.

### Deep Links Are Fragile — Don't Touch Casually
- **Bit (Israeli payment app)** uses an Android Intent URI:
  `intent://...#Intent;scheme=bit;package=com.bnhp.payments.paymentsapp;end`
  — the `package=` must stay exactly that bundle ID.
- **WhatsApp** uses `whatsapp://send?phone=...` scheme.
- Both require entries in `withAndroidQueries.js` so Android 11+ doesn't block them.
- Before changing any URL/scheme/package name, search the repo for all
  references and update them together.

### Audio Engine
- Use `expo-av` only (the project standard). Don't add `react-native-sound`,
  `react-native-track-player`, or any other audio lib.
- Coin sounds must follow the **stop → rewind → play** sequence (see
  `AudioEngine.js`) — skipping rewind breaks playback on Android.
- Sound files must be MP3, mono, ≤100KB each. Pre-load on app start.

### Asset Budget
- Total `assets/` size: **≤ 5 MB**. Currently ~2 MB.
- Coin PNGs: ≤ 80KB each, max 512×512.
- Photos (pushka.jpg, rebbe.jpg): ≤ 500KB each, JPEG quality 80.
- Run images through an optimizer before committing.
- If you must add a new asset, justify why — and check whether an existing one
  can be reused.

### Privacy
- **No analytics SDKs.** No Firebase, no Sentry, no Mixpanel, no Amplitude.
- **No tracking pixels, no crash reporters that phone home.**
- This is a religious-use app — users expect zero data collection.
- The only outbound traffic is the user-initiated Bit/WhatsApp deep links.

---

## Decision Framework

Before any change, ask in this order:

1. **Does it require ejecting from Expo?** → Stop. Find an Expo-compatible approach.
2. **Does it touch a deep link, Intent URI, or Android queries?** → Re-read the
   "Deep Links" section above and grep all references before editing.
3. **Does it break RTL layout?** → Test mentally in RTL.
4. **Does it add a dependency?** → Check if Expo SDK already provides it.
   If not, prefer libraries listed in Expo's "Supported Libraries" page.
5. **Does it increase total app size?** → If yes, justify against the budget.
6. **Does it phone home with user data?** → Refuse.

---

## Coding Standards

### React Native / JS
- Functional components + hooks. No class components.
- Avoid inline styles in JSX — use `StyleSheet.create()`.
- No `console.log` in committed code (use a `__DEV__` guard if temporary).
- Keep components in `src/components/` small and single-purpose.

### File Naming
- Components: `PascalCase.js` (e.g. `CoinButton.js`).
- Screens: `PascalCaseScreen.js` (e.g. `HomeScreen.js`).
- Assets: `lowercase-with-hyphens.{png,mp3,jpg}`.

### State
- Local UI state: `useState` / `useReducer`.
- No Redux, no MobX, no Zustand without explicit need — this app is small.

---

## Build & Release

- **Dev:** `npx expo start` then scan QR with Expo Go.
- **Internal preview build:** `eas build --profile preview --platform android`.
- **Production:** `eas build --profile production --platform android` then
  submit to Google Play. (iOS only when Apple Dev account is set up.)
- `build.sh` is a convenience wrapper — keep it in sync with this flow.

---

## What to Always Do

- Verify drag-to-pushka still works after any gesture/animation change.
- Test on a real Android device for sound playback (emulator audio is unreliable).
- Keep all 4 coin sounds working — they play randomly for variety.
- Update `app.json` version + `package.json` version together before each release.

## What to Never Do

- Never eject from Expo without explicit approval.
- Never add an analytics, crash-reporting, or ad SDK.
- Never hardcode English strings in user-facing UI.
- Never change the Bit package name or Intent URI scheme without testing the
  full payment flow.
- Never bundle assets larger than the per-file limits above.
- Never commit secrets, signing keys, or EAS credentials — those live in
  `eas.json` env or EAS secrets, not in git.