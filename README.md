# Spotify to Tidal

Minimal UI to transfer playlists from a Spotify account to a Tidal account.

## Features

-   Authenticate Spotify and Tidal accounts via OAuth.
-   List Spotify playlists and transfer selected playlists to Tidal.
-   Simple configuration UI that stores client credentials in localStorage.
-   Progress events and basic transfer batching / search logic.

## Prerequisites

1. Bun (runtime & package manager)

    - Install from https://bun.sh (recommended). Follow the official installer for Windows.
    - Verify installation:
        ```bash
        bun --version
        ```

2. Spotify Developer Application

    - Create an app at: https://developer.spotify.com/dashboard
    - Note the Client ID and Client Secret.
    - Add a Redirect URI of the form:
        ```
        <origin>/api/auth/spotify/callback
        ```
        Example: `http://127.0.0.1:3000/api/auth/spotify/callback`
    - The app's OAuth callback is handled by the server endpoint `/api/auth/spotify/callback`.

3. Tidal Developer Application

    - Create an app at: https://developer.tidal.com/dashboard
    - Note the Client ID and Client Secret.
    - Add a Redirect URI of the form:
        ```
        <origin>/api/auth/tidal/callback
        ```
        Default origin used by the code is `http://127.0.0.1:3000` (see `src/tidal.ts`), so a typical callback would be:
        `http://127.0.0.1:3000/api/auth/tidal/callback`

4. Browser for the UI and local network access to the server port.

## Setup

1. Clone the repository and change into the project directory.

2. Install dependencies:

    ```bash
    bun install
    ```

3. Configure Spotify & Tidal credentials:
    - Start the dev server (next section) and open the app in a browser.
    - Go to the Configuration page and paste your Spotify and Tidal Client ID and Client Secret, then Save.
    - Credentials are stored in localStorage by the app (see `src/services/sessions.ts`).

## Running (development)

Start the development server with hot reload:

```bash
bun dev
```

The server prints the URL it is serving; open that URL in your browser.

## UI Flow (tab order & usage)

The app UI uses three main tabs in this order: Configuration -> Login -> Transfer. Follow this flow for correct operation:

1. Configuration (first tab)

    - Enter and save your Spotify and Tidal Client ID and Client Secret.
    - The app persists this info to localStorage (see `src/services/sessions.ts`).

2. Login (second tab)

    - Authenticate your Spotify and Tidal accounts via OAuth.
    - The app will open the provider authorization pages and finalize authentication on callback.
    - Note: the app auto-selects the Login tab if the dev server receives an OAuth callback URL containing the query parameters `spotifycode` or `tidalcode` (see `src/App.tsx` logic that checks window.location.search). If you see a redirect from a provider, switch (or let the UI switch) to Login to complete finalization.

3. Transfer (third tab)
    - Once authenticated, view Spotify playlists and transfer selected playlists to Tidal.
    - Monitor progress and status in the UI while transfer runs.

This tab order reflects the intended user flow: first provide app credentials, then authenticate accounts, then perform playlist transfers.

## How to use

1. Open Configuration and save your Spotify and Tidal app credentials.
2. Open Login and authenticate both Spotify and Tidal accounts.
3. Go to Transfer, view your Spotify playlists, and click Transfer on playlists you want moved to Tidal.
4. Monitor transfer progress in the UI.

## Key files & where to change behavior

-   Server / app entry: `src/index.tsx`
-   React entry: `src/frontend.tsx`, `src/App.tsx`
-   Auth handlers: `src/services/auth.ts`
-   Sessions / config storage: `src/services/sessions.ts`
-   Playlist transfer logic: `src/services/transfer.ts`
-   Spotify API helper: `src/spotify.ts`
-   Tidal helper: `src/tidal.ts`
-   Build helper: `build.ts`
-   Scripts and Bun commands: `package.json`

If you need to change the default origin/port or redirect URI, edit `src/tidal.ts` and `src/index.tsx` as appropriate and update your registered redirect URIs in the Spotify and Tidal developer dashboards.

## Troubleshooting

-   OAuth redirect mismatch: ensure the redirect URIs registered in Spotify/Tidal exactly match the callback URL printed by the dev server (scheme, host, port, and path).
-   Credentials not saved: configuration uses localStorage; ensure your browser allows site storage.
-   Server not starting: confirm Bun is installed and on PATH (`bun --version`).

## License

See project repo for license details.
