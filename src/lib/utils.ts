import { getSpotifySession } from "@/services/sessions";
import { credentialsProvider } from "@tidal-music/auth";
import { type Credentials } from "@tidal-music/common";
import { type ClassValue, clsx } from "clsx";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

export type SpotifyAuth = {
	access_token: string;
	token_type: string;
	expires_in: number;
	refresh_token: string;
	scope: string;
};

export type TransferEvent = {
	type: "negative" | "positive";
	description: string;
	track?: string;
};

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function getAuthState() {
	const [tidalAuth, setTidalAuth] = useState<Credentials | null>();
	const [spotifyAuth, setSpotifyAuth] = useState<SpotifyAuth | null>();
	const checkAuthState = async () => {
		const tidalCredentials = await credentialsProvider
			.getCredentials()
			.catch((e) => {
				console.error(e);
				return null;
			});

		if (tidalCredentials && tidalCredentials.userId) {
			setTidalAuth(tidalCredentials);
		}

		const spotifySession = getSpotifySession();
		if (spotifySession != null) setSpotifyAuth(spotifySession);
	};

	useEffect(() => {
		checkAuthState();
	}, []);
	return { tidalAuth, spotifyAuth, checkAuthState };
}
