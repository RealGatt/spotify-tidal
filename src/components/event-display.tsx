import type { TransferEvent } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "./ui/alert";

export default function EventDisplay() {
	const [events, setEvents] = useState<TransferEvent[]>([]);

	useEffect(() => {
		const logEvent = (event: Event) => {
			console.log("EventDisplay received event:", event);
			const ce = event as CustomEvent<TransferEvent>;
			if (ce?.detail) {
				setEvents((prev) => [ce.detail, ...prev]);
			} else {
				console.warn("Received event has no detail:", event);
			}
		};

		window.addEventListener("log-event", logEvent as EventListener);
		return () => {
			window.removeEventListener("log-event", logEvent as EventListener);
		};
	}, []);
	return (
		<div>
			<div className="flex flex-col gap-2 max-h-[30vh] overflow-y-auto">
				{[...events].map((e, i) => {
					return (
						<Alert
							key={`event-${i}`}
							variant={
								e.type == "positive" ? "default" : "destructive"
							}
						>
							<AlertDescription className="flex flex-row gap-2">
								<span className="font-bold inline">
									#{events.length - i}
								</span>{" "}
								<span className="inline">{e.description}</span>
							</AlertDescription>
						</Alert>
					);
				})}
			</div>
		</div>
	);
}
