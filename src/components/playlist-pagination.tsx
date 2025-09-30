import { getAuthState } from "@/lib/utils";
import { transferPlaylists } from "@/services/transfer";
import { getSpotifyPlaylists } from "@/spotify";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import EventDisplay from "./event-display";
import { Button } from "./ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "./ui/card";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "./ui/pagination";

const PAGE_SIZE = 10; // updated to 50 entries per page

export default function Playlists() {
	const { spotifyAuth, tidalAuth, checkAuthState } = getAuthState();
	console.log(tidalAuth);
	const accessToken = spotifyAuth?.access_token;
	const [page, setPage] = useState(1);
	const [transferring, setTransferring] = useState(false);

	const offset = (page - 1) * PAGE_SIZE;

	const { data, isLoading, isError, error, isFetching } = useQuery({
		queryKey: ["spotifyPlaylists", accessToken, page],
		queryFn: () => {
			if (!accessToken) return Promise.resolve(null);
			return getSpotifyPlaylists(accessToken, offset);
		},
	});

	const total = data?.total ?? 0;
	const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

	const pages = useMemo(() => {
		const maxButtons = 7;
		let start = Math.max(1, page - Math.floor(maxButtons / 2));
		let end = start + maxButtons - 1;
		if (end > totalPages) {
			end = totalPages;
			start = Math.max(1, end - maxButtons + 1);
		}
		const arr: number[] = [];
		for (let p = start; p <= end; p++) arr.push(p);
		return arr;
	}, [page, totalPages]);

	// we render the card and pagination consistently.
	// - If there's no data yet (initial load), the list area shows a loading state.
	// - If data exists and a refetch is happening, we keep the list & pagination visible
	//   and show a small overlay/indicator in the list area so pagination isn't lost.
	return (
		<div className="my-4 space-y-2">
			<Card>
				<CardHeader>
					<CardTitle className="flex flex-row gap-2 items-center">
						Spotify Playlists
						<Button onClick={checkAuthState} size="sm">
							Check auth again
						</Button>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<CardDescription>
						{!accessToken ? (
							<div>Please connect Spotify to view playlists.</div>
						) : isError ? (
							<div>
								Error loading playlists:{" "}
								{(error as any)?.message}
							</div>
						) : (
							<>
								{/* header / page info */}
								<div className="mb-3 text-sm text-muted-foreground flex items-center gap-2">
									<span>
										{data
											? `Page ${page} of ${totalPages}`
											: "Loading playlists…"}
									</span>
									{/* subtle fetching indicator */}
									{isFetching && data && (
										<span className="text-xs text-muted-foreground">
											· refreshing…
										</span>
									)}
								</div>

								{/* list area - loading state only occupies this area,
                                    keeping pagination and header intact */}
								<div className="relative overflow-y-auto border rounded-md p-3 bg-card">
									{/* initial load (no data yet) */}
									{isLoading && !data ? (
										<div className="flex h-full items-center justify-center">
											<div className="text-sm text-muted-foreground animate-pulse">
												Loading playlists…
											</div>
										</div>
									) : (
										<>
											{data?.items &&
											data.items.length > 0 ? (
												<ul>
													{data.items.map(
														(playlist: any) => (
															<li
																key={
																	playlist.id
																}
																className="mb-2 flex flex-row gap-2 items-center"
															>
																{tidalAuth && (
																	<Button
																		disabled={
																			transferring
																		}
																		size="sm"
																		onClick={() => {
																			setTransferring(
																				true
																			);
																			toast.promise(
																				transferPlaylists(
																					spotifyAuth.access_token,
																					tidalAuth.token!,
																					playlist.id,
																					playlist.name,
																					playlist
																						.tracks
																						?.total ??
																						0
																				),
																				{
																					loading:
																						"Transferring...",
																					success:
																						"Done!",
																					error: "Oops...",
																					finally:
																						() =>
																							setTransferring(
																								false
																							),
																				}
																			);
																		}}
																	>
																		Transfer
																	</Button>
																)}
																<div className="font-bold">
																	{playlist.public
																		? "📭"
																		: "🔒"}{" "}
																	{
																		playlist.name
																	}
																</div>
																<div className="text-sm text-gray-600">
																	{playlist
																		.tracks
																		?.total ??
																		0}{" "}
																	tracks
																</div>
															</li>
														)
													)}
												</ul>
											) : (
												<div className="text-sm text-muted-foreground">
													No playlists found
												</div>
											)}

											{/* fetching overlay when changing pages - keeps list visible */}
											{isFetching && data && (
												<div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm dark:bg-slate-900/60">
													<div className="text-sm text-muted-foreground animate-pulse">
														Loading…
													</div>
												</div>
											)}
										</>
									)}
								</div>

								{/* shadcn pagination - always rendered so it isn't lost during transitions */}
								<nav className="mt-4">
									<Pagination>
										<PaginationContent>
											<PaginationItem>
												<PaginationPrevious
													href="#prev"
													onClick={(e) => {
														e.preventDefault();
														setPage((p) =>
															Math.max(1, p - 1)
														);
													}}
													aria-disabled={page === 1}
												/>
											</PaginationItem>

											{pages && pages.length > 0 && (
												<>
													{pages[0] &&
														pages[0] > 1 && (
															<>
																<PaginationItem>
																	<PaginationLink
																		href="#1"
																		onClick={(
																			e
																		) => {
																			e.preventDefault();
																			setPage(
																				1
																			);
																		}}
																		isActive={
																			1 ===
																			page
																		}
																	>
																		1
																	</PaginationLink>
																</PaginationItem>
																{pages[0] >
																	2 && (
																	<PaginationItem>
																		<PaginationEllipsis />
																	</PaginationItem>
																)}
															</>
														)}

													{/* page buttons */}
													{pages.map((p) => (
														<PaginationItem key={p}>
															<PaginationLink
																href={`#${p}`}
																onClick={(
																	e
																) => {
																	e.preventDefault();
																	setPage(p);
																}}
																isActive={
																	p === page
																}
															>
																{p}
															</PaginationLink>
														</PaginationItem>
													))}

													{pages[pages.length - 1] <
														totalPages && (
														<>
															{pages[
																pages.length - 1
															] <
																totalPages -
																	1 && (
																<PaginationItem>
																	<PaginationEllipsis />
																</PaginationItem>
															)}
															<PaginationItem>
																<PaginationLink
																	href={`#${totalPages}`}
																	onClick={(
																		e
																	) => {
																		e.preventDefault();
																		setPage(
																			totalPages
																		);
																	}}
																	isActive={
																		totalPages ===
																		page
																	}
																>
																	{totalPages}
																</PaginationLink>
															</PaginationItem>
														</>
													)}
												</>
											)}

											<PaginationItem>
												<PaginationNext
													href="#next"
													onClick={(e) => {
														e.preventDefault();
														setPage((p) =>
															Math.min(
																totalPages,
																p + 1
															)
														);
													}}
													aria-disabled={
														page === totalPages
													}
												/>
											</PaginationItem>
										</PaginationContent>
									</Pagination>
								</nav>
							</>
						)}
					</CardDescription>
				</CardContent>
			</Card>
			<EventDisplay />
		</div>
	);
}
