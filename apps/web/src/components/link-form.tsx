"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Link from "next/link";
import { BarChart3, Check, ExternalLink } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { LinksService } from "@/src/services/link-service";
import { toast } from "sonner";
import { Form } from "@/src/components/ui/form";

const schema = z.object({
	originalUrl: z.string().url("Informe uma URL válida"),
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
				toast.success("Link atualizado com sucesso!");
				setCreatedLink({ id, shortCode: "", originalUrl: data.originalUrl });
			} else {
				const result = await LinksService.create(payload);
				toast.success("Link criado com sucesso!");
				setCreatedLink({
					id: result.id,
					shortCode: result.shortCode,
					originalUrl: result.originalUrl,
				});
			}

			onSuccess?.();
		} catch {
			toast.error("Erro ao salvar link");
		} finally {
			setLoading(false);
		}
	}

	if (createdLink) {
		return (
			<div className="space-y-4">
				<div className="rounded-lg border border-green-200 bg-green-50 p-4">
					<div className="flex items-center gap-2 text-green-700 font-medium mb-2">
						<Check className="h-4 w-4" />
						{id ? "Link atualizado!" : "Link criado com sucesso!"}
					</div>

					{createdLink.shortCode && (
						<div className="space-y-1">
							<p className="text-sm text-gray-600">Short URL:</p>
							<p className="text-sm font-mono font-medium text-gray-900">
								{LinksService.getPublicUrl(createdLink.shortCode)}
							</p>
						</div>
					)}

					<div className="flex gap-2 mt-3">
						<Button variant="outline" size="sm" asChild>
							<a
								href={LinksService.getPublicUrl(createdLink.shortCode)}
								target="_blank"
								rel="noopener noreferrer"
							>
								<ExternalLink className="mr-1 h-3.5 w-3.5" />
								Abrir Link
							</a>
						</Button>

						<Button variant="outline" size="sm" asChild>
							<Link href={`/analytics/${createdLink.id}`}>
								<BarChart3 className="mr-1 h-3.5 w-3.5" />
								Ver Analytics
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
						Criar outro link
					</Button>
				</div>
			</div>
		);
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				<FormField
					control={form.control}
					name="originalUrl"
					render={({ field }) => (
						<FormItem>
							<FormLabel>URL Original</FormLabel>
							<FormControl>
								<Input placeholder="https://github.com" {...field} />
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
							<FormLabel>GA4 Measurement ID (opcional)</FormLabel>
							<FormControl>
								<Input placeholder="G-XXXXXXXXXX" {...field} />
							</FormControl>
							<p className="text-xs text-muted-foreground">
								Ex: G-XXXXXXXXXX. Se preenchido, o analytics do Google sera rastreado quando alguem acessar o link.
							</p>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div className="flex justify-end">
					<Button type="submit" disabled={loading}>
						{loading
							? "Salvando..."
							: id
								? "Salvar Alterações"
								: "Criar Link"}
					</Button>
				</div>
			</form>
		</Form>
	);
}
