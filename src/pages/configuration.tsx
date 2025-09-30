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
import { Eye, EyeOff } from "lucide-react";
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

	const [showSpotifySecret, setShowSpotifySecret] = useState(false);
	const [showTidalSecret, setShowTidalSecret] = useState(false);

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
				<CardContent className="space-y-2">
					<CardDescription className="space-y-2">
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
					<CardDescription className="space-y-2">
						<div className="space-y-2">
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
						<div className="space-y-2">
							<Label>Client Secret</Label>
							<div className="relative">
								<Input
									placeholder="Client Secret"
									onChange={(e) => {
										setSpotifyConfig({
											clientId:
												spotifyConfig?.clientId ?? "",
											clientSecret: e.target.value ?? "",
										});
									}}
									type={
										showSpotifySecret ? "text" : "password"
									}
									value={spotifyConfig?.clientSecret ?? ""}
								/>
								<Button
									variant="ghost"
									size="icon"
									type="button"
									className="absolute right-0 top-0 h-full px-3"
									onClick={() =>
										setShowSpotifySecret(!showSpotifySecret)
									}
								>
									{showSpotifySecret ? (
										<EyeOff className="h-4 w-4" />
									) : (
										<Eye className="h-4 w-4" />
									)}
								</Button>
							</div>
						</div>
					</CardDescription>
				</CardContent>
			</Card>
			<Card>
				<CardHeader>
					<CardTitle>Tidal Configuration</CardTitle>
				</CardHeader>
				<CardContent className="space-y-2">
					<CardDescription className="space-y-2">
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
					<CardDescription className="space-y-2">
						<div className="space-y-2">
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
						<div className="space-y-2">
							<Label>Client Secret</Label>
							<div className="relative">
								<Input
									placeholder="Client Secret"
									onChange={(e) => {
										setTidalConfig({
											clientId:
												tidalConfig?.clientId ?? "",
											clientSecret: e.target.value ?? "",
										});
									}}
									type={showTidalSecret ? "text" : "password"}
									value={tidalConfig?.clientSecret ?? ""}
								/>
								<Button
									variant="ghost"
									size="icon"
									type="button"
									className="absolute right-0 top-0 h-full px-3"
									onClick={() =>
										setShowTidalSecret(!showTidalSecret)
									}
								>
									{showTidalSecret ? (
										<EyeOff className="h-4 w-4" />
									) : (
										<Eye className="h-4 w-4" />
									)}
								</Button>
							</div>
						</div>
					</CardDescription>
				</CardContent>
			</Card>
			<Button onClick={save}>Save</Button>
		</div>
	);
}
