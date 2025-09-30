export async function getSpotifyPlaylists(
	access_token: string,
	offset: number = 0
) {
	const res = await fetch(
		`https://api.spotify.com/v1/me/playlists?limit=10&offset=${offset}`,
		{
			headers: { Authorization: `Bearer ${access_token}` },
		}
	);
	return await res.json();
}
