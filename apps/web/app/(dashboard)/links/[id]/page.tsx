"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/src/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/src/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { LinksService } from "@/src/services/link-service";

const schema = z.object({
	originalUrl: z.string().url("Informe uma URL válida"),
});

type FormData = z.infer<typeof schema>;

interface LinkFormProps {
	id?: string;
	initialData?: Partial<FormData>;
	onSuccess?: () => void;
}

export function LinkForm({ id, initialData, onSuccess }: LinkFormProps) {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const form = useForm<FormData>({
		resolver: zodResolver(schema),
		defaultValues: {
			originalUrl: initialData?.originalUrl ?? "",
		},
	});

	async function onSubmit(data: FormData) {
		try {
			setLoading(true);
			setError(null);

			if (id) {
				await LinksService.update(id, { originalUrl: data.originalUrl });
			} else {
				await LinksService.create({ originalUrl: data.originalUrl });
			}

			form.reset();

			onSuccess?.();
		} catch (err) {
			setError("Erro ao salvar link");
		} finally {
			setLoading(false);
		}
	}

	return (
		<>
			<CardHeader>

				<CardDescription>
					{id
						? "Atualize as informações do link."
						: "Crie um novo link encurtado."}
				</CardDescription>
			</CardHeader>

			<CardContent>
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

						{error && <p className="text-sm text-red-500">{error}</p>}

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
			</CardContent>
		</>
	);
}

interface LinkDetailsPageProps {
	params: {
		id: string;
	};
}

export default function LinkDetailsPage({ params }: LinkDetailsPageProps) {
	const { id } = params;

	return (
			<div className="max-w-3xl space-y-6">
			<div>
				<h1 className="text-3xl font-bold text-gray-900">Editar Link</h1>

				<p className="text-gray-600">ID: {id}</p>
			</div>

				<LinkForm id={id} />
			</div>
	);
}
