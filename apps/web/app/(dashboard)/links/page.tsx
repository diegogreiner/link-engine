"use client";

import { BarChart3, Copy } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/src/components/ui/button";
import { CreateLinkDialog } from "@/src/components/create-link-dialog";
import { DeleteConfirmDialog } from "@/src/components/delete-confirm-dialog";
import { EditLinkDialog } from "@/src/components/edit-link-dialog";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/src/components/ui/table";
import { LinksService, Link as LinkType } from "@/src/services/link-service";

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
		loadLinks();
	}, []);

	async function handleDelete(id: string) {
		try {
			setDeletingId(id);
			await LinksService.remove(id);
			toast.success("Link excluído com sucesso!");
			await loadLinks();
		} catch {
			toast.error("Erro ao excluir link");
		} finally {
			setDeletingId(null);
		}
	}

	async function handleCopy(shortCode: string) {
		const url = LinksService.getPublicUrl(shortCode);
		await navigator.clipboard.writeText(url);
		toast.success("Link copiado!");
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Links</h1>
					<p className="text-gray-600">
						Gerencie seus links encurtados.
					</p>
				</div>

				<CreateLinkDialog onSuccess={loadLinks} />
			</div>

			<div className="rounded-lg border border-gray-300 bg-white shadow-md overflow-hidden">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="text-gray-700 font-semibold">Short URL</TableHead>
							<TableHead className="text-gray-700 font-semibold">URL Original</TableHead>
							<TableHead className="text-gray-700 font-semibold">Cliques</TableHead>
							<TableHead className="text-gray-700 font-semibold">Criado em</TableHead>
							<TableHead className="text-gray-700 font-semibold">Ações</TableHead>
						</TableRow>
					</TableHeader>

					<TableBody>
						{loading ? (
							<TableRow key="loading">
								<TableCell colSpan={5} className="text-center py-10">
									Carregando...
								</TableCell>
							</TableRow>
						) : links.length === 0 ? (
							<TableRow key="empty">
								<TableCell
									colSpan={5}
									className="text-center py-10 text-gray-500"
								>
									Nenhum link encontrado
								</TableCell>
							</TableRow>
						) : (
							links.map((link) => (
								<TableRow key={link.shortCode}>
									<TableCell className="font-medium text-gray-900">
										{link.shortCode}
									</TableCell>

									<TableCell className="max-w-[400px] truncate text-gray-700">
										{link.originalUrl}
									</TableCell>

									<TableCell className="text-gray-700">{link.clicks ?? 0}</TableCell>

									<TableCell className="text-gray-700">
										{link.createdAt
											? new Date(link.createdAt).toLocaleDateString()
											: "-"}
									</TableCell>

									<TableCell>
										<div className="flex gap-2">
											<Button
												size="icon"
												variant="ghost"
												onClick={() => handleCopy(link.shortCode)}
											>
												<Copy className="h-4 w-4" />
											</Button>

											<Button size="icon" variant="ghost" asChild>
												<Link href={`/analytics/${link.id}`}>
													<BarChart3 className="h-4 w-4" />
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
										</div>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
