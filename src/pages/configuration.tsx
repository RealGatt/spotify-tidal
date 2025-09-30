import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	getApplicationDetails,
	saveApplicationDetails,
	setSpotifySession,
} from "@/services/sessions";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export default function Config() {
	const [tidalConfig, setTidalConfig] = useState<{
		clientId: string;
		clientSecret: string;
	} | null>(null);
	const [spotifyConfig, setSpotifyConfig] = useState<{
		clientId: string;
		clientSecret: string;
	} | null>(null);

	const [url, setUrl] = useState("http://127.0.0.1:3000");

	useEffect(() => {
		const url = new URL(window.location.href);
		setUrl(url.origin);
		console.log(url);

		setTidalConfig(getApplicationDetails("tidal"));
		setSpotifyConfig(getApplicationDetails("spotify"));
	}, []);

	const save = useCallback(() => {
		if (tidalConfig) saveApplicationDetails("tidal", tidalConfig);
		if (spotifyConfig) saveApplicationDetails("spotify", spotifyConfig);
		setSpotifySession(null);
		toast.success("Saved configuration to localStorage");
		// send a "config update" event
		document.dispatchEvent(
			new CustomEvent("application-update", {
				bubbles: true,
			})
		);
	}, [tidalConfig, spotifyConfig]);

	return (
		<div className="h-full space-y-4">
			<Card>
				<CardHeader>
					<CardTitle>Spotify Configuration</CardTitle>
				</CardHeader>
				<CardContent>
					<CardDescription>
						Create an{" "}
						<a
							href="https://developer.spotify.com/dashboard"
							target="_blank"
							className="underline"
						>
							Application
						</a>{" "}
						with callback URL{" "}
						<pre className="inline">
							{url}/api/auth/spotify/callback
						</pre>
					</CardDescription>
					<CardDescription>
						<div>
							<Label>Client ID</Label>
							<Input
								placeholder="Client ID"
								onChange={(e) => {
									setSpotifyConfig({
										clientId: e.target.value ?? "",
										clientSecret:
											spotifyConfig?.clientSecret ?? "",
									});
								}}
								value={spotifyConfig?.clientId ?? ""}
							/>
						</div>
						<div>
							<Label>Client Secret</Label>
							<Input
								placeholder="Client Secret"
								onChange={(e) => {
									setSpotifyConfig({
										clientId: spotifyConfig?.clientId ?? "",
										clientSecret: e.target.value ?? "",
									});
								}}
								value={spotifyConfig?.clientSecret ?? ""}
							/>
						</div>
						{JSON.stringify(spotifyConfig)}
					</CardDescription>
				</CardContent>
			</Card>
			<Card>
				<CardHeader>
					<CardTitle>Tidal Configuration</CardTitle>
				</CardHeader>
				<CardContent>
					<CardDescription>
						Create an{" "}
						<a
							href="https://developer.tidal.com/dashboard"
							target="_blank"
							className="underline"
						>
							Application
						</a>{" "}
						with callback URL{" "}
						<pre className="inline">
							{url}/api/auth/tidal/callback
						</pre>{" "}
						and all available scopes.
					</CardDescription>
					<CardDescription>
						<div>
							<Label>Client ID</Label>
							<Input
								placeholder="Client ID"
								onChange={(e) => {
									setTidalConfig({
										clientId: e.target.value ?? "",
										clientSecret:
											tidalConfig?.clientSecret ?? "",
									});
								}}
								value={tidalConfig?.clientId ?? ""}
							/>
						</div>
						<div>
							<Label>Client Secret</Label>
							<Input
								placeholder="Client Secret"
								onChange={(e) => {
									setTidalConfig({
										clientId: tidalConfig?.clientId ?? "",
										clientSecret: e.target.value ?? "",
									});
								}}
								value={tidalConfig?.clientSecret ?? ""}
							/>
						</div>
						{JSON.stringify(tidalConfig)}
					</CardDescription>
				</CardContent>
			</Card>
			<Button onClick={save}>Save</Button>
		</div>
	);
}
