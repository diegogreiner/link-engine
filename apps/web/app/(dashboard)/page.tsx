"use client";

import { BarChart3 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { CreateLinkDialog } from "@/src/components/create-link-dialog";
import { PageHeader } from "@/src/components/page-header";
import { ShortLink } from "@/src/components/short-link";
import { Button } from "@/src/components/ui/button";
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
import {
	AnalyticsService,
	AnalyticsSummary,
} from "@/src/services/analytics-service";
import { LinksService, Link as LinkType } from "@/src/services/link-service";

function Metric({
	label,
	value,
	loading,
	error,
}: {
	label: string;
	value: number;
	loading: boolean;
	error: boolean;
}) {
	return (
		<div className="min-w-0 space-y-1 px-3 py-3.5 sm:px-5 sm:py-4">
			<p className="text-xs text-muted-foreground sm:text-sm">{label}</p>
			{loading ? (
				<Skeleton className="h-7 w-16 sm:h-8 sm:w-20" />
			) : error ? (
				<p className="py-1 text-sm text-destructive">Indisponível</p>
			) : (
				<p className="text-xl leading-tight font-semibold tracking-tight tabular-nums sm:text-[1.75rem]">
					{formatNumber(value)}
				</p>
			)}
		</div>
	);
}

export default function DashboardPage() {
	const [links, setLinks] = useState<LinkType[]>([]);
	const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
	const [loadingLinks, setLoadingLinks] = useState(true);
	const [loadingSummary, setLoadingSummary] = useState(true);
	const [errorLinks, setErrorLinks] = useState<string | null>(null);
	const [errorSummary, setErrorSummary] = useState<string | null>(null);

	const loadLinks = useCallback(async () => {
		try {
			const data = await LinksService.findAll();
			setLinks(data);
			setErrorLinks(null);
		} catch {
			setErrorLinks("Erro ao carregar links");
		} finally {
			setLoadingLinks(false);
		}
	}, []);

	useEffect(() => {
		let isActive = true;

		void LinksService.findAll()
			.then((data) => {
				if (isActive) {
					setLinks(data);
					setErrorLinks(null);
				}
			})
			.catch(() => {
				if (isActive) setErrorLinks("Erro ao carregar links");
			})
			.finally(() => {
				if (isActive) setLoadingLinks(false);
			});

		return () => {
			isActive = false;
		};
	}, []);

	useEffect(() => {
		async function load() {
			try {
				setLoadingSummary(true);
				setErrorSummary(null);
				const data = await AnalyticsService.getSummary();
				setSummary(data);
			} catch {
				setErrorSummary("Erro ao carregar métricas");
			} finally {
				setLoadingSummary(false);
			}
		}

		load();
	}, []);

	const totalLinks = links.length;
	const top = summary?.mostAccessedLink ?? null;

	return (
		<>
			<PageHeader
				title="Dashboard"
				description="Visão geral dos seus links e cliques."
				action={<CreateLinkDialog onSuccess={loadLinks} />}
			/>

			<Card className="grid grid-cols-3 gap-0 divide-x divide-border py-0">
				<Metric
					label="Links criados"
					value={totalLinks}
					loading={loadingLinks}
					error={!!errorLinks}
				/>
				<Metric
					label="Cliques no total"
					value={summary?.totalClicks ?? 0}
					loading={loadingSummary}
					error={!!errorSummary}
				/>
				<Metric
					label="Cliques hoje"
					value={summary?.totalClicksToday ?? 0}
					loading={loadingSummary}
					error={!!errorSummary}
				/>
			</Card>

			{(errorLinks || errorSummary) && (
				<p
					role="alert"
					className="rounded-lg border border-destructive/25 bg-destructive/6 px-4 py-3 text-sm text-destructive"
				>
					Parte dos dados não carregou. Recarregue a página para tentar de novo.
				</p>
			)}

			<Card className="gap-4">
				<div className="flex items-baseline justify-between gap-4 px-5">
					<h2 className="text-[0.9375rem] font-semibold">Link mais acessado</h2>
					<p className="text-xs text-muted-foreground">desde a criação</p>
				</div>

				<div className="px-5">
					{loadingSummary ? (
						<div className="space-y-2">
							<Skeleton className="h-7 w-40" />
							<Skeleton className="h-4 w-72" />
						</div>
					) : errorSummary ? (
						<p className="text-sm text-destructive">
							Não foi possível carregar esta métrica.
						</p>
					) : top ? (
						<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
							<div className="min-w-0 space-y-2">
								<div className="flex flex-wrap items-center gap-3">
									<ShortLink shortCode={top.shortCode} size="lg" />
									<span className="text-sm text-muted-foreground tabular-nums">
										<span className="font-semibold text-foreground">
											{formatNumber(top.totalClicks)}
										</span>{" "}
										cliques
									</span>
								</div>
								<p
									className="truncate text-sm text-muted-foreground"
									title={top.originalUrl}
								>
									{displayUrl(top.originalUrl)}
								</p>
							</div>
							<Button variant="outline" asChild className="self-start sm:self-auto">
								<Link href={`/analytics/${top.id}`}>
									<BarChart3 aria-hidden="true" />
									Ver analytics
								</Link>
							</Button>
						</div>
					) : (
						<p className="text-sm text-muted-foreground">
							Quando seus links receberem cliques, o mais acessado aparece aqui.
						</p>
					)}
				</div>
			</Card>

			<Card className="gap-0 py-0">
				<div className="flex items-center justify-between gap-4 px-5 py-4">
					<h2 className="text-[0.9375rem] font-semibold">Links recentes</h2>
					<Button variant="ghost" size="sm" asChild className="text-primary">
						<Link href="/links">Ver todos</Link>
					</Button>
				</div>

				{/* Celular: lista simples no lugar da tabela */}
				<ul className="divide-y divide-border border-t border-border md:hidden">
					{loadingLinks ? (
						<li className="space-y-2 px-4 py-3.5">
							<Skeleton className="h-5 w-28" />
							<Skeleton className="h-4 w-full" />
						</li>
					) : errorLinks ? (
						<li className="px-4 py-8 text-center text-sm text-destructive">
							Não foi possível carregar os links.
						</li>
					) : links.length === 0 ? (
						<li className="px-4 py-10 text-center text-sm text-muted-foreground">
							Use “Novo link” para encurtar sua primeira URL.
						</li>
					) : (
						links.slice(0, 5).map((link) => (
							<li key={link.shortCode} className="space-y-1.5 px-4 py-3.5">
								<div className="flex items-center justify-between gap-3">
									<ShortLink shortCode={link.shortCode} />
									<Link
										href={`/analytics/${link.id}`}
										className="shrink-0 text-sm tabular-nums hover:underline"
									>
										<span className="font-medium">{formatNumber(link.clicks)}</span>{" "}
										<span className="text-muted-foreground">cliques</span>
									</Link>
								</div>
								<p className="truncate text-sm text-muted-foreground" title={link.originalUrl}>
									{displayUrl(link.originalUrl)}
								</p>
							</li>
						))
					)}
				</ul>

				<Table className="hidden md:table">
					<TableHeader>
						<TableRow>
							<TableHead>Link curto</TableHead>
							<TableHead>Destino</TableHead>
							<TableHead className="text-right">Cliques</TableHead>
							<TableHead className="w-0">
								<span className="sr-only">Ações</span>
							</TableHead>
						</TableRow>
					</TableHeader>

					<TableBody>
						{loadingLinks ? (
							["first", "second", "third"].map((key) => (
								<TableRow key={key}>
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
						) : errorLinks ? (
							<TableRow>
								<TableCell colSpan={4} className="py-10 text-center text-destructive">
									Não foi possível carregar os links.
								</TableCell>
							</TableRow>
						) : links.length === 0 ? (
							<TableRow className="hover:bg-transparent">
								<TableCell colSpan={4} className="py-12 text-center">
									<p className="font-medium">Você ainda não criou nenhum link</p>
									<p className="mt-1 text-sm text-muted-foreground">
										Use “Novo link” para encurtar sua primeira URL.
									</p>
								</TableCell>
							</TableRow>
						) : (
							links.slice(0, 5).map((link) => (
								<TableRow key={link.shortCode}>
									<TableCell>
										<ShortLink shortCode={link.shortCode} />
									</TableCell>
									<TableCell
										className="max-w-[20rem] truncate text-muted-foreground"
										title={link.originalUrl}
									>
										{displayUrl(link.originalUrl)}
									</TableCell>
									<TableCell className="text-right font-medium tabular-nums">
										{formatNumber(link.clicks)}
									</TableCell>
									<TableCell>
										<Button
											variant="ghost"
											size="icon-sm"
											asChild
											className="text-muted-foreground"
										>
											<Link
												href={`/analytics/${link.id}`}
												aria-label={`Ver analytics de ${link.shortCode}`}
												title="Ver analytics"
											>
												<BarChart3 aria-hidden="true" />
											</Link>
										</Button>
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
