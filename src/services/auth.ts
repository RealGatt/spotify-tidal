export async function handleSpotifyAuth(req: Request) {
	const url = new URL(req.url);
	if (url.searchParams.has("code")) {
		const code = url.searchParams.get("code");
		return Response.redirect("/?spotifycode=" + code);
	} else {
		return Response.redirect("/");
	}
}
export async function handleTidalAuth(req: Request) {
	const url = new URL(req.url);
	if (url.searchParams.has("code")) {
		const code = url.searchParams.get("code");
		return Response.redirect("/?tidalcode=" + code);
	} else {
		return Response.redirect("/");
	}
}
