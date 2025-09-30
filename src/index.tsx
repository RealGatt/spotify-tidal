import { serve } from "bun";
import index from "./index.html";
import { handleSpotifyAuth, handleTidalAuth } from "./services/auth.ts";

const server = serve({
	routes: {
		"/*": index,

		"/api/login/spotify": async (req) => handleSpotifyAuth(req),
		"/api/login/tidal": async (req) => handleTidalAuth(req),

		"/api/auth/spotify/callback": async (req) => handleSpotifyAuth(req),
		"/api/auth/tidal/callback": async (req) => handleTidalAuth(req),
	},

	development: process.env.NODE_ENV !== "production" && {
		hmr: true,
		console: true,
	},
});

console.log(`🚀 Server running at ${server.url}`);
