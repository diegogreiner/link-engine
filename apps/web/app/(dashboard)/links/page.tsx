"use client";

import { Copy, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/src/components/ui/button";
import { CreateLinkDialog } from "@/src/components/create-link-dialog";
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
		await LinksService.remove(id);
		await loadLinks();
	}

	async function handleCopy(shortCode: string) {
		const url = LinksService.getPublicUrl(shortCode);
		await navigator.clipboard.writeText(url);
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
										/{link.shortCode}
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

												<Button asChild size="icon" variant="ghost">
													<Link href={`/links/${link.id}`}>
														<Pencil className="h-4 w-4" />
													</Link>
												</Button>

												<Button
													size="icon"
													variant="ghost"
													onClick={() => handleDelete(link.id)}
												>
													<Trash2 className="h-4 w-4 text-destructive" />
												</Button>
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
