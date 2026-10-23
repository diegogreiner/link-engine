import { Link2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/src/lib/utils";

/** Marca do Link Engine sobre fundo marinho. */
export function Brand({ className }: { className?: string }) {
	return (
		<Link
			href="/"
			className={cn(
				"flex items-center gap-2.5 rounded-md text-sidebar-foreground",
				className,
			)}
		>
			<span className="flex size-8 items-center justify-center rounded-lg bg-white/12 ring-1 ring-white/15">
				<Link2 className="size-4.5" aria-hidden="true" />
			</span>
			<span className="text-[0.9375rem] font-semibold tracking-tight">
				Link Engine
			</span>
		</Link>
	);
}
