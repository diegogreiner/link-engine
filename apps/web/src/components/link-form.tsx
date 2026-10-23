"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { BarChart3, CheckCircle2, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { ShortLink } from "@/src/components/short-link";
import { Button } from "@/src/components/ui/button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { LinksService } from "@/src/services/link-service";

const schema = z.object({
	originalUrl: z.string().url("Informe uma URL completa, começando com https://"),
	ga4MeasurementId: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface LinkFormProps {
	id?: string;
	initialData?: Partial<FormData>;
	onSuccess?: () => void;
}

interface CreatedLink {
	id: string;
	shortCode: string;
	originalUrl: string;
}

export function LinkForm({ id, initialData, onSuccess }: LinkFormProps) {
	const [loading, setLoading] = useState(false);
	const [createdLink, setCreatedLink] = useState<CreatedLink | null>(null);

	const form = useForm<FormData>({
		resolver: zodResolver(schema),
		defaultValues: {
			originalUrl: initialData?.originalUrl ?? "",
			ga4MeasurementId: initialData?.ga4MeasurementId ?? "",
		},
	});

	async function onSubmit(data: FormData) {
		try {
			setLoading(true);

			const payload = {
				originalUrl: data.originalUrl,
				ga4MeasurementId: data.ga4MeasurementId || undefined,
			};

			if (id) {
				await LinksService.update(id, payload);
				toast.success("Link atualizado");
				setCreatedLink({ id, shortCode: "", originalUrl: data.originalUrl });
			} else {
				const result = await LinksService.create(payload);
				toast.success("Link criado");
				setCreatedLink({
					id: result.id,
					shortCode: result.shortCode,
					originalUrl: result.originalUrl,
				});
			}

			onSuccess?.();
		} catch {
			toast.error("Não foi possível salvar o link. Tente de novo.");
		} finally {
			setLoading(false);
		}
	}

	if (createdLink) {
		return (
			<div className="min-w-0 space-y-5">
				<div className="min-w-0 space-y-4 rounded-lg border border-success/25 bg-success/6 p-4">
					<p className="flex items-center gap-2 font-medium text-success">
						<CheckCircle2 className="size-4" aria-hidden="true" />
						{id ? "Link atualizado" : "Link criado. Já pode compartilhar."}
					</p>

					{createdLink.shortCode && (
						<ShortLink shortCode={createdLink.shortCode} showHost size="lg" />
					)}

					<div className="flex flex-wrap gap-2">
						{createdLink.shortCode && (
							<Button variant="outline" size="sm" asChild>
								<a
									href={LinksService.getPublicUrl(createdLink.shortCode)}
									target="_blank"
									rel="noopener noreferrer"
								>
									<ExternalLink aria-hidden="true" />
									Abrir link
								</a>
							</Button>
						)}

						<Button variant="outline" size="sm" asChild>
							<Link href={`/analytics/${createdLink.id}`}>
								<BarChart3 aria-hidden="true" />
								Ver analytics
							</Link>
						</Button>
					</div>
				</div>

				<div className="flex justify-end">
					<Button
						type="button"
						variant="ghost"
						onClick={() => {
							setCreatedLink(null);
							form.reset();
						}}
					>
						{id ? "Editar de novo" : "Criar outro link"}
					</Button>
				</div>
			</div>
		);
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
				<FormField
					control={form.control}
					name="originalUrl"
					render={({ field }) => (
						<FormItem>
							<FormLabel>URL de destino</FormLabel>
							<FormControl>
								<Input
									type="url"
									inputMode="url"
									placeholder="https://www.seusite.com.br/pagina"
									autoFocus={!id}
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="ga4MeasurementId"
					render={({ field }) => (
						<FormItem>
							<FormLabel>
								ID do Google Analytics 4
								<span className="font-normal text-muted-foreground">(opcional)</span>
							</FormLabel>
							<FormControl>
								<Input placeholder="G-XXXXXXXXXX" className="font-mono" {...field} />
							</FormControl>
							<FormDescription className="text-xs">
								Com ele, cada acesso ao link também é enviado para o seu GA4.
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div className="flex justify-end">
					<Button type="submit" disabled={loading}>
						{loading ? "Salvando..." : id ? "Salvar alterações" : "Criar link"}
					</Button>
				</div>
			</form>
		</Form>
	);
}
