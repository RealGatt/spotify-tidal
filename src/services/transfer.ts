import { findBestTrackIdFromIncluded } from "@/lib/levenshtein";

async function getSpotifyPlaylistTracks(token: string, playlistId: string) {
	let tracks: { name: string; artist: string }[] = [];
	let url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=100`;

	while (url) {
		const res = await fetch(url, {
			headers: { Authorization: `Bearer ${token}` },
		});
		const data = await res.json();

		for (const item of data.items) {
			if (!item.track) continue;
			tracks.push({
				name: item.track.name,
				artist: item.track.artists.map((a: any) => a.name).join(", "),
			});
		}

		url = data.next; // Spotify paginated
	}

	return tracks;
}

async function searchTidalTrack(
	token: string,
	name: string,
	artist: string,
	countryCode: string
) {
	// remove ()'s and anything in ()'s from name
	// remove apostrophes and other punctuation
	let cleanName = name.replace(/\s*\(.*?\)\s*/g, "").trim();
	cleanName = cleanName
		.replace(/[’'`"“”.,!?-]/g, "")
		.replace(/\s+/g, " ")
		.trim();
	let cleanArtist = artist
		.replace(/\s*\(.*?\)\s*/g, "")
		.replace(/[’'`"“”.,!?-]/g, "")
		.replace(/\s+/g, " ")
		.trim();

	const query = encodeURIComponent(`${cleanName} ${cleanArtist}`);
	const res = await fetch(
		`https://openapi.tidal.com/v2/searchResults/${query}/relationships/tracks?countryCode=AU&explicitFilter=include&include=tracks`,
		{
			headers: {
				Authorization: `Bearer ${token}`,
				accept: "application/vnd.api+json",
			},
		}
	);
	const data = await res.json();
	console.log(data);

	// find a song that matches the exact name, if possible

	if (data && data.included) {
		document.dispatchEvent(
			new CustomEvent("log-event", {
				bubbles: true,
				detail: {
					type: "positive",
					description: `Found ${data.included.length} possible tracks for ${name} (${artist})`,
				},
			})
		);
		for (const track of data.included) {
			const trackName = track.attributes.title;
			if (trackName == name) {
				document.dispatchEvent(
					new CustomEvent("log-event", {
						bubbles: true,
						detail: {
							type: "positive",
							description: `Found track for ${name} (${artist}) - [${track.id} / ${trackName}]`,
						},
					})
				);
				return track.id;
			}
		}

		const bestTrack = findBestTrackIdFromIncluded(
			data.included,
			name,
			artist
		);
		if (bestTrack) {
			document.dispatchEvent(
				new CustomEvent("log-event", {
					bubbles: true,
					detail: {
						type: "negative",
						description: `Could not find an exact match for ${name} (${artist}), using the closest Levenshtein match - [${bestTrack.bestId} / ${bestTrack.bestName}]`,
					},
				})
			);
			return bestTrack.bestId ?? null;
		}
	}
	return null;
}

async function createTidalPlaylist(
	token: string,
	name: string,
	countryCode: string
) {
	const res = await fetch(
		`https://openapi.tidal.com/v2/playlists?countryCode=${countryCode}`,
		{
			method: "POST",
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/vnd.api+json",
			},
			body: JSON.stringify({
				data: {
					attributes: {
						accessType: "PUBLIC",
						description: "Imported from Spotify",
						name,
					},
					type: "playlists",
				},
			}),
		}
	);

	const data = await res.json();
	console.log(data);
	return data.data.id; // Tidal uses UUID for playlist IDs
}

async function addTracksToTidalPlaylist(
	token: string,
	playlistId: string,
	trackIds: string[],
	countryCode: string
) {
	console.log(`Adding ${trackIds.length} tracks to ${playlistId}`);
	if (trackIds.length === 0) return;
	const mappedTracks = trackIds.map((t) => {
		return {
			id: t,
			type: "tracks",
		};
	});
	document.dispatchEvent(
		new CustomEvent("log-event", {
			bubbles: true,
			detail: {
				type: "positive",
				description: `Adding ${mappedTracks.length} to playlist`,
			},
		})
	);
	let batchCount = 0;
	for (let i = 0; i < mappedTracks.length; i += 20) {
		batchCount++;
		const batch = mappedTracks.slice(i, i + 20);
		document.dispatchEvent(
			new CustomEvent("log-event", {
				bubbles: true,
				detail: {
					type: "positive",
					description: `Doing batch ${batchCount}`,
				},
			})
		);
		const response = await fetch(
			`https://openapi.tidal.com/v2/playlists/${playlistId}/relationships/items?countryCode=${countryCode}`,
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/vnd.api+json",
				},
				body: JSON.stringify({
					data: batch,
				}),
			}
		);
		if (response.ok) {
			document.dispatchEvent(
				new CustomEvent("log-event", {
					bubbles: true,
					detail: {
						type: "positive",
						description: `Done batch ${batchCount}`,
					},
				})
			);
		} else {
			document.dispatchEvent(
				new CustomEvent("log-event", {
					bubbles: true,
					detail: {
						type: "negative",
						description: `Failed to do batch ${batchCount}`,
					},
				})
			);
		}
		await new Promise((resolve) => setTimeout(resolve, 5000));
	}
}

export async function getSpotifyPlaylists(token: string) {
	const res = await fetch("https://api.spotify.com/v1/me/playlists", {
		headers: { Authorization: `Bearer ${token}` },
	});
	const data = await res.json();
	return (
		data.items?.map((pl: any) => ({
			id: pl.id,
			name: pl.name,
		})) ?? []
	);
}

export async function transferPlaylists(
	spotifyToken: string,
	tidalToken: string,
	playlistId: string,
	playlistName: string,
	playlistLength: number
) {
	// Fetch country for Tidal account
	const userRes = await fetch("https://openapi.tidal.com/v2/users/me", {
		headers: { Authorization: `Bearer ${tidalToken}` },
	});
	const userData = await userRes.json();
	document.dispatchEvent(
		new CustomEvent("log-event", {
			bubbles: true,
			detail: {
				type: "positive",
				description: "Fetched Tidal User Profile",
			},
		})
	);
	const countryCode = userData.data.attributes.country;
	const tracks = await getSpotifyPlaylistTracks(spotifyToken, playlistId);
	console.log(tracks);
	document.dispatchEvent(
		new CustomEvent("log-event", {
			bubbles: true,
			detail: {
				type: "positive",
				description: `Fetched ${tracks.length} tracks for Playlist ${playlistName} (${playlistId})`,
			},
		})
	);

	const tidalPlaylistId = await createTidalPlaylist(
		tidalToken,
		playlistName,
		countryCode
	);
	console.log(`Made playlist`, tidalPlaylistId);
	document.dispatchEvent(
		new CustomEvent("log-event", {
			bubbles: true,
			detail: {
				type: "positive",
				description: `Made the playlist on Tidal`,
			},
		})
	);

	const tidalTrackIds: string[] = [];
	for (const t of tracks) {
		const tidalId = await searchTidalTrack(
			tidalToken,
			t.name,
			t.artist,
			countryCode
		);
		if (tidalId) {
			console.log(`Found track for ${t.name} (${t.artist})`, tidalId);
			tidalTrackIds.push(tidalId);
		} else {
			document.dispatchEvent(
				new CustomEvent("log-event", {
					bubbles: true,
					detail: {
						type: "negative",
						description: `Could not find a track for ${t.name} (${t.artist})`,
						track: t.name,
					},
				})
			);
		}
		await new Promise((resolve) => setTimeout(resolve, 200));
	}

	await addTracksToTidalPlaylist(
		tidalToken,
		tidalPlaylistId,
		tidalTrackIds,
		countryCode
	);

	document.dispatchEvent(
		new CustomEvent("log-event", {
			bubbles: true,
			detail: {
				type: "positive",
				description: `Done! Moved over ${tidalTrackIds.length} out of ${playlistLength} tracks`,
			},
		})
	);

	return {
		name: playlistName,
		transferred: tidalTrackIds.length,
		total: tracks.length,
	};
}
