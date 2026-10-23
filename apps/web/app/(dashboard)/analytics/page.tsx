"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PageHeader } from "@/src/components/page-header";
import { ShortLink } from "@/src/components/short-link";
import { Card } from "@/src/components/ui/card";
import { Skeleton } from "@/src/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/src/components/ui/table";
import { displayUrl, formatNumber } from "@/src/lib/format";
import { LinksService, Link as LinkType } from "@/src/services/link-service";

export default function AnalyticsPage() {
	const [links, setLinks] = useState<LinkType[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function load() {
			try {
				setLoading(true);
				setError(null);
				const data = await LinksService.findAll();
				setLinks(data);
			} catch {
				setError("Não foi possível carregar os links. Recarregue a página.");
			} finally {
				setLoading(false);
			}
		}

		load();
	}, []);

	// Mais clicados primeiro: é o que a pessoa costuma querer analisar.
	const sorted = [...links].sort((a, b) => (b.clicks ?? 0) - (a.clicks ?? 0));

	return (
		<>
			<PageHeader
				title="Analytics"
				description="Escolha um link para ver cliques por dia, país, dispositivo e origem."
			/>

			{error && (
				<p
					role="alert"
					className="rounded-lg border border-destructive/25 bg-destructive/6 px-4 py-3 text-sm text-destructive"
				>
					{error}
				</p>
			)}

			{/* Celular: cada item abre o detalhe */}
			<Card className="gap-0 py-0 md:hidden">
				{loading ? (
					<div className="space-y-4 p-4">
						{["a", "b", "c"].map((key) => (
							<div key={key} className="space-y-2">
								<Skeleton className="h-5 w-28" />
								<Skeleton className="h-4 w-full" />
							</div>
						))}
					</div>
				) : sorted.length === 0 ? (
					<p className="px-5 py-12 text-center text-sm text-muted-foreground">
						Crie um link em Links e compartilhe para começar a ver os cliques.
					</p>
				) : (
					<ul className="divide-y divide-border">
						{sorted.map((link) => (
							<li key={link.shortCode}>
								<Link
									href={`/analytics/${link.id}`}
									className="flex items-center gap-3 px-4 py-3.5 hover:bg-muted/50"
								>
									<div className="min-w-0 flex-1 space-y-1">
										<p className="font-mono text-[0.8125rem] font-medium text-accent-foreground">
											<span className="text-muted-foreground">/</span>
											{link.shortCode}
										</p>
										<p className="truncate text-sm text-muted-foreground">
											{displayUrl(link.originalUrl)}
										</p>
									</div>
									<span className="shrink-0 text-sm font-medium tabular-nums">
										{formatNumber(link.clicks)}
									</span>
									<ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
								</Link>
							</li>
						))}
					</ul>
				)}
			</Card>

			<Card className="hidden gap-0 py-0 md:flex">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Link curto</TableHead>
							<TableHead>Destino</TableHead>
							<TableHead className="text-right">Cliques</TableHead>
							<TableHead className="w-0">
								<span className="sr-only">Abrir</span>
							</TableHead>
						</TableRow>
					</TableHeader>

					<TableBody>
						{loading ? (
							Array.from({ length: 5 }).map((_, i) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: linhas de carregamento fixas
								<TableRow key={i}>
									<TableCell>
										<Skeleton className="h-5 w-24" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-4 w-60" />
									</TableCell>
									<TableCell>
										<Skeleton className="ml-auto h-4 w-10" />
									</TableCell>
									<TableCell />
								</TableRow>
							))
						) : sorted.length === 0 ? (
							<TableRow className="hover:bg-transparent">
								<TableCell colSpan={4} className="py-14 text-center">
									<p className="font-medium">Ainda não há o que analisar</p>
									<p className="mt-1 text-sm text-muted-foreground">
										Crie um link em{" "}
										<Link href="/links" className="font-medium text-primary hover:underline">
											Links
										</Link>{" "}
										e compartilhe para começar a ver os cliques.
									</p>
								</TableCell>
							</TableRow>
						) : (
							sorted.map((link) => (
								<TableRow key={link.shortCode} className="group">
									<TableCell>
										<ShortLink shortCode={link.shortCode} />
									</TableCell>
									<TableCell
										className="max-w-[24rem] truncate text-muted-foreground"
										title={link.originalUrl}
									>
										{displayUrl(link.originalUrl)}
									</TableCell>
									<TableCell className="text-right font-medium tabular-nums">
										{formatNumber(link.clicks)}
									</TableCell>
									<TableCell>
										<Link
											href={`/analytics/${link.id}`}
											className="flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium whitespace-nowrap text-primary hover:bg-accent"
										>
											Ver analytics
											<ChevronRight className="size-4" aria-hidden="true" />
										</Link>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</Card>
		</>
	);
}
