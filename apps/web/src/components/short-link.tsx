"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/src/lib/utils";
import { LinksService } from "@/src/services/link-service";

interface ShortLinkProps {
	shortCode: string;
	/** Mostra o domínio antes do código (ex.: link-engine.app/aB3xYz). */
	showHost?: boolean;
	size?: "default" | "lg";
	className?: string;
}

/**
 * O link curto aparece igual em todo o app: código em mono, clicável,
 * com o botão de copiar colado ao lado.
 */
export function ShortLink({
	shortCode,
	showHost = false,
	size = "default",
	className,
}: ShortLinkProps) {
	const [copied, setCopied] = useState(false);
	const url = LinksService.getPublicUrl(shortCode);
	const host = url.replace(/^https?:\/\//, "").replace(`/${shortCode}`, "");

	useEffect(() => {
		if (!copied) return;
		const timeout = setTimeout(() => setCopied(false), 1500);
		return () => clearTimeout(timeout);
	}, [copied]);

	async function handleCopy() {
		try {
			await navigator.clipboard.writeText(url);
			setCopied(true);
			toast.success("Link copiado");
		} catch {
			toast.error("Não foi possível copiar. Selecione o link e copie manualmente.");
		}
	}

	return (
		<span
			className={cn(
				"inline-flex max-w-full items-stretch overflow-hidden rounded-md border border-primary/20 bg-accent font-mono",
				size === "lg" ? "text-base" : "text-[0.8125rem]",
				className,
			)}
		>
			<a
				href={url}
				target="_blank"
				rel="noopener noreferrer"
				title={url}
				className={cn(
					"min-w-0 truncate text-accent-foreground hover:underline focus-visible:outline-offset-0",
					size === "lg" ? "px-3 py-1.5" : "px-2 py-0.5",
				)}
			>
				{showHost && <span className="text-muted-foreground">{host}</span>}
				<span className="text-muted-foreground">/</span>
				<span className="font-medium">{shortCode}</span>
			</a>
			<button
				type="button"
				onClick={handleCopy}
				aria-label={copied ? "Link copiado" : `Copiar link ${shortCode}`}
				className={cn(
					"flex shrink-0 items-center border-l border-primary/20 text-accent-foreground/70 transition-colors hover:bg-primary/10 hover:text-accent-foreground focus-visible:outline-offset-0",
					size === "lg" ? "px-2.5" : "px-1.5",
				)}
			>
				{copied ? (
					<Check className="size-3.5 text-success" />
				) : (
					<Copy className="size-3.5" />
				)}
			</button>
		</span>
	);
}
