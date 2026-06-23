"use client";

import { Copy, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/src/components/layout";
import { Button } from "@/src/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/src/components/ui/dialog";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/src/components/ui/table";
import { LinksService, Link as LinkType } from "@/src/services/link-service";
import { LinkForm } from "./[id]/page";

export default function LinksPage() {
	const [links, setLinks] = useState<LinkType[]>([]);
	const [loading, setLoading] = useState(true);
	const [open, setOpen] = useState(false);

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
		<DashboardLayout>
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold">Links</h1>

						<p className="text-muted-foreground">
							Gerencie seus links encurtados.
						</p>
					</div>

					<Dialog open={open} onOpenChange={setOpen}>
						<DialogTrigger asChild>
							<Button>
								<Plus className="mr-2 h-4 w-4" />
								Novo Link
							</Button>
						</DialogTrigger>

						<DialogContent>
							<DialogHeader>
								<DialogTitle>Novo Link</DialogTitle>
							</DialogHeader>

							<LinkForm
								onSuccess={() => {
									setOpen(false);
									loadLinks();
								}}
							/>
						</DialogContent>
					</Dialog>
				</div>

				<div className="rounded-md border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Short URL</TableHead>

								<TableHead>URL Original</TableHead>

								<TableHead>Cliques</TableHead>

								<TableHead>Criado em</TableHead>

								<TableHead className="text-right">Ações</TableHead>
							</TableRow>
						</TableHeader>

						<TableBody>
							{loading ? (
								<TableRow>
									<TableCell colSpan={5} className="text-center py-10">
										Carregando...
									</TableCell>
								</TableRow>
							) : links.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={5}
										className="text-center py-10 text-muted-foreground"
									>
										Nenhum link encontrado
									</TableCell>
								</TableRow>
							) : (
								links.map((link) => (
									<TableRow key={link.id}>
										<TableCell className="font-medium">
											/{link.shortCode}
										</TableCell>

										<TableCell className="max-w-[400px] truncate">
											{link.originalUrl}
										</TableCell>

										<TableCell>{link.clicks ?? 0}</TableCell>

										<TableCell>
											{link.createdAt
												? new Date(link.createdAt).toLocaleDateString()
												: "-"}
										</TableCell>

										<TableCell>
											<div className="flex justify-end gap-2">
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
		</DashboardLayout>
	);
}
