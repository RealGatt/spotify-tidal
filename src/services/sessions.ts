import type { SpotifyAuth } from "@/lib/utils";

export function saveApplicationDetails(
	applicationName: string,
	details: {
		clientId: string;
		clientSecret: string;
	}
) {
	if (window.localStorage == null) return null;
	return window.localStorage.setItem(
		`applicationConfig:${applicationName.toLowerCase()}`,
		JSON.stringify(details)
	);
}

export function getApplicationDetails(applicationName: string) {
	if (window.localStorage == null) return null;
	const auth = window.localStorage.getItem(
		`applicationConfig:${applicationName.toLowerCase()}`
	);
	if (auth) {
		return JSON.parse(auth);
	}
	return null;
}

export function getSpotifySession(): SpotifyAuth | null {
	if (window.localStorage == null) return null;
	const auth = window.localStorage.getItem("spotifyAuth");
	if (auth) {
		return JSON.parse(auth);
	}
	return null;
}

export function setSpotifySession(args: SpotifyAuth | null) {
	if (window.localStorage == null) return null;
	if (!args) {
		return window.localStorage.removeItem("spotifyAuth");
	}
	return window.localStorage.setItem("spotifyAuth", JSON.stringify(args));
}
