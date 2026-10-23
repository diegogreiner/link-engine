"use client";

import { AlertCircle, ChevronLeft } from "lucide-react";
import NextLink from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { LinkForm } from "@/src/components/link-form";
import { PageHeader } from "@/src/components/page-header";
import { ShortLink } from "@/src/components/short-link";
import { Card } from "@/src/components/ui/card";
import { Skeleton } from "@/src/components/ui/skeleton";
import { LinksService, Link as LinkType } from "@/src/services/link-service";

/**
 * Página de edição. Antes ela exportava um LinkForm próprio, o que quebra o
 * `next build` ("LinkForm is not a valid Page export field"), e lia
 * `params.id` direto (no Next 16 `params` é uma Promise). Agora usa o
 * formulário compartilhado e carrega o link para preencher os campos.
 */
export default function LinkDetailsPage() {
	const params = useParams();
	const id = params.id as string;

	const [link, setLink] = useState<LinkType | null>(null);
	const [error, setError] = useState(false);

	const loadLink = useCallback(async () => {
		try {
			const data = await LinksService.findOne(id);
			setLink(data);
			setError(false);
		} catch {
			setError(true);
		}
	}, [id]);

	useEffect(() => {
		let isActive = true;

		void LinksService.findOne(id)
			.then((data) => {
				if (isActive) {
					setLink(data);
					setError(false);
				}
			})
			.catch(() => {
				if (isActive) setError(true);
			});

		return () => {
			isActive = false;
		};
	}, [id]);

	return (
		<>
			<NextLink
				href="/links"
				className="-ml-1 inline-flex items-center gap-1 rounded-md px-1 text-sm text-muted-foreground hover:text-foreground"
			>
				<ChevronLeft className="size-4" aria-hidden="true" />
				Todos os links
			</NextLink>

			<PageHeader
				title="Editar link"
				description={
					link ? (
						<span className="mt-1 inline-flex">
							<ShortLink shortCode={link.shortCode} />
						</span>
					) : undefined
				}
			/>

			<Card className="max-w-2xl">
				<div className="px-5">
					{error ? (
						<p className="flex items-center gap-2 text-sm text-destructive">
							<AlertCircle className="size-4" aria-hidden="true" />
							Não foi possível carregar este link.
						</p>
					) : !link ? (
						<div className="space-y-4">
							<Skeleton className="h-9 w-full" />
							<Skeleton className="h-9 w-full" />
						</div>
					) : (
						<LinkForm
							id={id}
							initialData={{
								originalUrl: link.originalUrl,
								ga4MeasurementId: link.ga4MeasurementId ?? "",
							}}
							onSuccess={loadLink}
						/>
					)}
				</div>
			</Card>
		</>
	);
}
