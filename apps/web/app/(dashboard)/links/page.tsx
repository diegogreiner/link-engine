"use client";

import { BarChart3 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CreateLinkDialog } from "@/src/components/create-link-dialog";
import { DeleteConfirmDialog } from "@/src/components/delete-confirm-dialog";
import { EditLinkDialog } from "@/src/components/edit-link-dialog";
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
import { displayUrl, formatDate, formatNumber } from "@/src/lib/format";
import { LinksService, Link as LinkType } from "@/src/services/link-service";

function EmptyState() {
	return (
		<div className="px-5 py-14 text-center">
			<p className="font-medium">Nenhum link por aqui ainda</p>
			<p className="mt-1 text-sm text-muted-foreground">
				Crie o primeiro com o botão “Novo link”.
			</p>
		</div>
	);
}

export default function LinksPage() {
	const [links, setLinks] = useState<LinkType[]>([]);
	const [loading, setLoading] = useState(true);
	const [deletingId, setDeletingId] = useState<string | null>(null);

	async function loadLinks() {
		setLoading(true);
		try {
			const data = await LinksService.findAll();
			setLinks(data);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		let isActive = true;

		void LinksService.findAll()
			.then((data) => {
				if (isActive) {
					setLinks(data);
				}
			})
			.catch(() => {
				if (isActive) {
					toast.error("Não foi possível carregar os links.");
				}
			})
			.finally(() => {
				if (isActive) {
					setLoading(false);
				}
			});

		return () => {
			isActive = false;
		};
	}, []);

	async function handleDelete(id: string) {
		try {
			setDeletingId(id);
			await LinksService.remove(id);
			toast.success("Link excluído");
			await loadLinks();
		} catch {
			toast.error("Não foi possível excluir o link.");
		} finally {
			setDeletingId(null);
		}
	}

	function renderActions(link: LinkType) {
		return (
			<>
				<Button size="icon-sm" variant="ghost" asChild className="text-muted-foreground">
					<Link
						href={`/analytics/${link.id}`}
						aria-label={`Ver analytics de ${link.shortCode}`}
						title="Ver analytics"
					>
						<BarChart3 aria-hidden="true" />
					</Link>
				</Button>
				<EditLinkDialog
					linkId={link.id}
					initialUrl={link.originalUrl}
					initialGa4={link.ga4MeasurementId}
					onSuccess={loadLinks}
				/>
				<DeleteConfirmDialog
					onConfirm={() => handleDelete(link.id)}
					loading={deletingId === link.id}
				/>
			</>
		);
	}

	return (
		<>
			<PageHeader
				title="Links"
				description={
					loading
						? "Todos os seus links curtos."
						: `${formatNumber(links.length)} ${links.length === 1 ? "link" : "links"} criados.`
				}
				action={<CreateLinkDialog onSuccess={loadLinks} />}
			/>

			{/* Celular: lista empilhada, sem rolagem horizontal */}
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
				) : links.length === 0 ? (
					<EmptyState />
				) : (
					<ul className="divide-y divide-border">
						{links.map((link) => (
							<li key={link.shortCode} className="space-y-1.5 px-4 py-3.5">
								<div className="flex items-center justify-between gap-3">
									<ShortLink shortCode={link.shortCode} />
									<span className="shrink-0 text-sm tabular-nums">
										<span className="font-medium">{formatNumber(link.clicks)}</span>{" "}
										<span className="text-muted-foreground">cliques</span>
									</span>
								</div>
								<p className="truncate text-sm text-muted-foreground" title={link.originalUrl}>
									{displayUrl(link.originalUrl)}
								</p>
								<div className="flex items-center justify-between gap-3">
									<span className="text-xs text-muted-foreground tabular-nums">
										Criado em {formatDate(link.createdAt)}
									</span>
									<div className="-mr-1.5 flex gap-0.5">{renderActions(link)}</div>
								</div>
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
							<TableHead>Criado em</TableHead>
							<TableHead className="w-0">
								<span className="sr-only">Ações</span>
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{loading ? (
							["a", "b", "c", "d"].map((key) => (
								<TableRow key={key}>
									<TableCell>
										<Skeleton className="h-5 w-24" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-4 w-64" />
									</TableCell>
									<TableCell>
										<Skeleton className="ml-auto h-4 w-10" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-4 w-20" />
									</TableCell>
									<TableCell />
								</TableRow>
							))
						) : links.length === 0 ? (
							<TableRow className="hover:bg-transparent">
								<TableCell colSpan={5} className="p-0">
									<EmptyState />
								</TableCell>
							</TableRow>
						) : (
							links.map((link) => (
								<TableRow key={link.shortCode}>
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
									<TableCell className="text-muted-foreground tabular-nums">
										{formatDate(link.createdAt)}
									</TableCell>
									<TableCell>
										<div className="flex justify-end gap-1">{renderActions(link)}</div>
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
