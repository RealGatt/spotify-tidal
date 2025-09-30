import Playlists from "@/components/playlist-pagination";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getAuthState } from "@/lib/utils";

export default function SpotifyPlaylists() {
	const { spotifyAuth } = getAuthState();

	if (spotifyAuth) {
		return <Playlists />;
	}

	// shadcn card
	return (
		<div className="my-4 overflow-y-auto max-h-[600px]">
			<Alert variant={"destructive"}>
				<AlertDescription>
					You have not logged into Spotify
				</AlertDescription>
			</Alert>
		</div>
	);
}
