const client_id = "3FRJw4h6v0SBTLxM";
const client_secret = "KC94H4ZUoOIyMmaSIeh9HREjyI9WVRKiPlU2Z5d2Go4=";
const redirect_uri = "http://127.0.0.1:3000/api/auth/tidal/callback";

export function getTidalAuthUrl() {
	return `https://login.tidal.com/authorize?client_id=${client_id}&response_type=code&redirect_uri=${encodeURIComponent(
		redirect_uri
	)}`;
}

export async function exchangeTidalCode(code: string) {
	const res = await fetch("https://auth.tidal.com/v1/oauth2/token", {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: new URLSearchParams({
			client_id,
			client_secret,
			grant_type: "authorization_code",
			code,
			redirect_uri,
		}),
	});
	return await res.json();
}

export async function createTidalPlaylist(
	access_token: string,
	name: string,
	tracks: string[]
) {
	const res = await fetch("https://api.tidal.com/v1/playlists", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${access_token}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ name, description: "Imported from Spotify" }),
	});
	return await res.json();
}
