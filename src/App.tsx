import SpotifyPlaylists from "@/pages/spotify-playlists";
import "./index.css";

import { cx } from "class-variance-authority";
import { useEffect, useState } from "react";
import { Toaster } from "./components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import Config from "./pages/configuration";
import Login from "./pages/login";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export function App() {
	const [tab, setTab] = useState("connections");
	useEffect(() => {
		const search = new URLSearchParams(window.location.search);
		if (search.has("tidalcode") || search.has("spotifycode")) {
			setTab("login");
		}
	}, []);

	return (
		<QueryClientProvider client={queryClient}>
			<div className="min-w-4xl p-6 h-[90vh] bg-black/20 rounded-md">
				<h1 className="text-xl font-bold mb-4">Playlist Transfer</h1>
				<Toaster richColors />
				<Tabs
					defaultValue="connections"
					value={tab}
					onValueChange={(e) => setTab(e)}
					className="w-full p-4"
				>
					<TabsList>
						<TabsTrigger value="connections">
							Configuration
						</TabsTrigger>
						<TabsTrigger value="login">Login</TabsTrigger>
						<TabsTrigger value="transfer">Transfer</TabsTrigger>
					</TabsList>
					<TabsContent
						value="connections"
						forceMount
						className={cx(tab != "connections" && "hidden")}
					>
						<Config />
					</TabsContent>
					<TabsContent
						value="login"
						forceMount
						className={cx(tab != "login" && "hidden")}
					>
						<Login />
					</TabsContent>
					<TabsContent
						value="transfer"
						forceMount
						className={cx(tab != "transfer" && "hidden")}
					>
						<SpotifyPlaylists />
					</TabsContent>
				</Tabs>
			</div>
		</QueryClientProvider>
	);
}

export default App;
