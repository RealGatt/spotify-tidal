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
