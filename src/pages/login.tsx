import {
	credentialsProvider,
	finalizeLogin,
	init,
	initializeLogin,
	logout,
} from "@tidal-music/auth";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	getApplicationDetails,
	getSpotifySession,
	setSpotifySession,
} from "@/services/sessions";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export default function Login() {
	const [tidalConfig, setTidalConfig] = useState<{
		clientId: string;
		clientSecret: string;
	} | null>(null);
	const [spotifyConfig, setSpotifyConfig] = useState<{
		clientId: string;
		clientSecret: string;
	} | null>(null);

	const [spotifyState, setSpotify] = useState<boolean>(false);
	const [tidalState, setTidal] = useState<boolean>(false);
	const [loggingIn, setLoggingIn] = useState<boolean>(true);
	const [url, setUrl] = useState("http://127.0.0.1:3000");

	const initTidal = useCallback(async () => {
		const localTidalConfig = getApplicationDetails("tidal");
		if (!localTidalConfig) return;
		console.log(localTidalConfig);
		await init({
			clientId: localTidalConfig.clientId,
			clientSecret: localTidalConfig.clientSecret,
			credentialsStorageKey: "tidal",
			scopes: [
				"collection.read",
				"collection.write",
				"playlists.read",
				"playlists.write",
				"search.read",
				"search.write",
				"user.read",
			],
		});
		console.log(`init'd tidal`);
	}, [tidalConfig]);

	useEffect(() => {
		const triggerUpdate = async () => {
			setTidalConfig(getApplicationDetails("tidal"));
			setSpotifyConfig(getApplicationDetails("spotify"));
			await initTidal();
			logout();
		};

		window.addEventListener("application-update", triggerUpdate);

		return () => {
			window.removeEventListener("application-update", triggerUpdate);
		};
	}, []);

	useEffect(() => {
		setTidalConfig(getApplicationDetails("tidal"));
		setSpotifyConfig(getApplicationDetails("spotify"));

		const url = new URL(window.location.href);
		setUrl(url.origin);
		console.log(url);

		const checkAuthState = async () => {
			// we always init tidal auth
			await initTidal();

			// check if the URL has a "tidalcode" searchparam
			const search = new URLSearchParams(window.location.search);
			if (search.has("tidalcode")) {
				const tidalcode = search.get("tidalcode");
				console.log(`finalising with code`, tidalcode);
				try {
					await finalizeLogin(`code=${tidalcode}&state=na`);
					toast.success("Authenticated with Tidal");
					window.location.search = "";
				} catch (e) {
					console.error(e);
					toast.error(
						"Something went wrong when authenticating with Tidal"
					);
				}
			}

			if (search.has("spotifycode")) {
				const localSpotifyConfig = getApplicationDetails("spotify");
				const spotifycode = search.get("spotifycode");
				console.log(`finalising with code`, spotifycode);
				try {
					const tokenRes = await fetch(
						"https://accounts.spotify.com/api/token",
						{
							method: "POST",
							headers: {
								Authorization:
									"Basic " +
									btoa(
										`${localSpotifyConfig.clientId}:${localSpotifyConfig.clientSecret}`
									),
								"Content-Type":
									"application/x-www-form-urlencoded",
							},
							body: new URLSearchParams({
								grant_type: "authorization_code",
								code: spotifycode!,
								redirect_uri: `${url.origin}/api/auth/spotify/callback`,
							}),
						}
					);

					const tokenData = await tokenRes.json();
					setSpotifySession(tokenData);
					toast.success("Authenticated with Spotify");

					window.location.search = "";
				} catch (e) {
					console.error(e);
					toast.error(
						"Something went wrong when authenticating with Spotify"
					);
				}
			}

			const tidalCredentials = await credentialsProvider
				.getCredentials()
				.catch((e) => {
					console.error(e);
					return null;
				});

			if (tidalCredentials && tidalCredentials.userId) {
				toast.success("Authenticated with Tidal");
				setTidal(true);
			}

			const spotifySession = getSpotifySession();
			if (spotifySession != null) {
				toast.success("Authenticated with Spotify");
				setSpotify(true);
			}
		};
		checkAuthState().then(() => setLoggingIn(false));
	}, []);

	const tidalLogin = useCallback(async () => {
		await initTidal();
		const loginInit = await initializeLogin({
			redirectUri: `${url}/api/auth/tidal/callback`,
		});
		window.location.href = loginInit;
	}, []);

	const spotifyLogin = useCallback(async () => {
		const localSpotifyConfig = getApplicationDetails("spotify");
		if (!localSpotifyConfig || !localSpotifyConfig.clientId) return;
		const authUrl = `https://accounts.spotify.com/authorize?${new URLSearchParams(
			{
				client_id: localSpotifyConfig.clientId,
				response_type: "code",
				redirect_uri: `${url}/api/auth/spotify/callback`,
				scope: "playlist-read-private playlist-modify-private playlist-modify-public",
			}
		)}`;

		window.location.href = authUrl;
	}, []);

	if (!tidalConfig || !spotifyConfig) {
		return (
			<div>
				<Alert variant={"destructive"}>
					<AlertDescription>
						Head back to the Configuration Tab and setup your
						application details
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	return (
		<div className="space-y-2">
			{loggingIn ? (
				<div className="text-green-600 font-semibold">Loading...</div>
			) : (
				<>
					<Alert>
						<AlertDescription>Using URL {url}</AlertDescription>
					</Alert>
					{spotifyState ? (
						<div className="text-green-600 font-semibold">
							Spotify Connected
							<Button
								onClick={spotifyLogin}
								className="px-4 py-2 rounded bg-green-500 text-white block text-center"
							>
								Reauth with Spotify
							</Button>
						</div>
					) : (
						<Button
							onClick={spotifyLogin}
							className="px-4 py-2 rounded bg-green-500 text-white block text-center"
						>
							Login with Spotify
						</Button>
					)}
					{tidalState ? (
						<div className="text-blue-600 font-semibold">
							Tidal Connected
							<Button
								onClick={tidalLogin}
								className="px-4 py-2 rounded bg-blue-500 text-white block text-center"
							>
								Reauth with Tidal
							</Button>
						</div>
					) : (
						<Button
							onClick={tidalLogin}
							className="px-4 py-2 rounded bg-blue-500 text-white block text-center"
						>
							Login with Tidal
						</Button>
					)}
				</>
			)}
		</div>
	);
}
