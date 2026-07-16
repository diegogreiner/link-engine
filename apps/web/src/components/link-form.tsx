"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
});

type FormData = z.infer<typeof schema>;

interface LinkFormProps {
	id?: string;
	initialData?: Partial<FormData>;
	onSuccess?: () => void;
}

export function LinkForm({ id, initialData, onSuccess }: LinkFormProps) {
	const [loading, setLoading] = useState(false);

	const form = useForm<FormData>({
		resolver: zodResolver(schema),
		defaultValues: {
			originalUrl: initialData?.originalUrl ?? "",
		},
	});

	async function onSubmit(data: FormData) {
		try {
			setLoading(true);

			if (id) {
				await LinksService.update(id, { originalUrl: data.originalUrl });
				toast.success("Link atualizado com sucesso!");
			} else {
				await LinksService.create({ originalUrl: data.originalUrl });
				toast.success("Link criado com sucesso!");
			}

			form.reset();
			onSuccess?.();
		} catch {
			toast.error("Erro ao salvar link");
		} finally {
			setLoading(false);
		}
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
