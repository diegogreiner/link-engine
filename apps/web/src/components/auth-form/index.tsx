"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AuthService } from "@/src/services/auth-service";
import { Button } from "../ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";

interface AuthFormProps {
	mode: "login" | "register";
}

const schema = z.object({
	email: z.string().min(1, "Informe seu e-mail").email("E-mail inválido"),
	password: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres"),
});

type ApiErrorResponse = {
	message?: string | string[];
};

function getApiErrorMessage(error: unknown) {
	if (!axios.isAxiosError<ApiErrorResponse>(error)) {
		return "Não foi possível falar com o servidor. Tente de novo em instantes.";
	}

	const message = error.response?.data?.message;

	if (Array.isArray(message)) {
		return message.join(". ");
	}

	if (typeof message === "string" && message.length > 0) {
		return message;
	}

	return "Não foi possível falar com o servidor. Tente de novo em instantes.";
}

const COPY = {
	login: {
		title: "Entrar",
		description: "Use o e-mail e a senha da sua conta.",
		submit: "Entrar",
		submitting: "Entrando...",
	},
	register: {
		title: "Criar conta",
		description: "Leva menos de um minuto. Você só precisa de um e-mail.",
		submit: "Criar conta",
		submitting: "Criando conta...",
	},
} as const;

export function AuthForm({ mode }: AuthFormProps) {
	const router = useRouter();
	const copy = COPY[mode];

	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	type FormData = z.infer<typeof schema>;

	const form = useForm<FormData>({
		resolver: zodResolver(schema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	async function onSubmit(values: FormData) {
		setError("");
		setSuccess("");
		setIsLoading(true);
		let accountCreated = false;

		try {
			if (mode === "register") {
				await AuthService.register(values);
				accountCreated = true;
				setSuccess("Conta criada. Entrando no dashboard...");
			}

			const result = await signIn("credentials", {
				redirect: false,
				email: values.email,
				password: values.password,
			});

			if (!result?.ok) {
				setSuccess("");
				setError(
					mode === "register"
						? "Sua conta foi criada, mas não foi possível entrar automaticamente. Tente entrar com suas credenciais."
						: "E-mail ou senha incorretos. Confira e tente de novo.",
				);
				return;
			}

			router.replace("/");
			router.refresh();
		} catch (error) {
			setSuccess("");
			setError(
				accountCreated
					? "Sua conta foi criada, mas não foi possível entrar automaticamente. Tente entrar com suas credenciais."
					: getApiErrorMessage(error),
			);
		} finally {
			setIsLoading(false);
		}
	}

	const isSubmitting = form.formState.isSubmitting || isLoading;

	return (
		<div className="space-y-8">
			<div className="space-y-2">
				<h2 className="text-2xl font-semibold tracking-tight">{copy.title}</h2>
				<p className="text-sm text-muted-foreground">{copy.description}</p>
			</div>

			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="space-y-5"
					noValidate
				>
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel>E-mail</FormLabel>
								<FormControl>
									<Input
										type="email"
										autoComplete="email"
										placeholder="voce@empresa.com"
										disabled={isSubmitting}
										className="h-10"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="password"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Senha</FormLabel>
								<FormControl>
									<Input
										type="password"
										autoComplete={
											mode === "login" ? "current-password" : "new-password"
										}
										placeholder={
											mode === "register" ? "Mínimo de 8 caracteres" : undefined
										}
										disabled={isSubmitting}
										className="h-10"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{error && (
						<p
							role="alert"
							className="flex items-start gap-2 rounded-lg border border-destructive/25 bg-destructive/6 px-3 py-2.5 text-sm text-destructive"
						>
							<AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
							{error}
						</p>
					)}
					{success && (
						<p
							role="status"
							className="flex items-start gap-2 rounded-lg border border-success/25 bg-success/6 px-3 py-2.5 text-sm text-success"
						>
							<CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
							{success}
						</p>
					)}

					<Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
						{isSubmitting && <Loader2 className="animate-spin" aria-hidden="true" />}
						{isSubmitting ? copy.submitting : copy.submit}
					</Button>
				</form>
			</Form>

			<p className="text-sm text-muted-foreground">
				{mode === "login" ? (
					<>
						Ainda não tem conta?{" "}
						<Link href="/register" className="font-medium text-primary hover:underline">
							Criar conta
						</Link>
					</>
				) : (
					<>
						Já tem conta?{" "}
						<Link href="/login" className="font-medium text-primary hover:underline">
							Entrar
						</Link>
					</>
				)}
			</p>
		</div>
	);
}
