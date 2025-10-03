export function normalizeForCompare(s: string): string {
	s = (s ?? "").toString();
	// remove parentheses and their contents, remove common punctuation, normalize diacritics, collapse spaces, lowercase
	s = s.replace(/\s*\(.*?\)\s*/g, " ");
	s = s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
	s = s.replace(/[’'`"“”.,!?-]/g, " ");
	s = s.replace(/\s+/g, " ").trim().toLowerCase();
	return s;
}

export function levenshtein(a: string, b: string): number {
	a = a ?? "";
	b = b ?? "";
	const an = a.length;
	const bn = b.length;
	if (an === 0) return bn;
	if (bn === 0) return an;

	const v0 = new Array(bn + 1);
	const v1 = new Array(bn + 1);

	for (let j = 0; j <= bn; j++) v0[j] = j;

	for (let i = 0; i < an; i++) {
		v1[0] = i + 1;
		for (let j = 0; j < bn; j++) {
			const cost = a[i] === b[j] ? 0 : 1;
			v1[j + 1] = Math.min(v1[j] + 1, v0[j + 1] + 1, v0[j] + cost);
		}
		for (let j = 0; j <= bn; j++) v0[j] = v1[j];
	}
	return v1[bn];
}

export function findBestTrackIdFromIncluded(
	included: any[] | undefined,
	targetName: string,
	targetArtist: string
): {
	bestId: string | null;
	bestName: string | null;
} | null {
	if (!Array.isArray(included) || included.length === 0) return null;

	const targetNameNorm = normalizeForCompare(targetName);
	const targetArtistNorm = normalizeForCompare(targetArtist);

	let bestId: string | null = null;
	let bestName: string | null = null;
	let bestScore = Number.POSITIVE_INFINITY;

	for (const track of included) {
		const trackNameRaw = track?.attributes?.title ?? "";

		const trackName = normalizeForCompare(trackNameRaw);

		// exact match shortcut
		if (trackName === targetNameNorm) {
			return track.id ?? null;
		}

		const nameDist = levenshtein(targetNameNorm, trackName);

		// weight name higher than artist (name * 2 + artist)
		const score = nameDist * 2;

		if (score < bestScore) {
			bestScore = score;
			bestId = track.id ?? null;
			bestName = trackName ?? null;
		}
	}

	return { bestId, bestName };
}
