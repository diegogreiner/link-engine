"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { AuthService } from "@/src/services/auth-service";
import { Button } from "../ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../ui/card";
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
	email: z
		.string()
		.min(1, "E-mail é obrigatório")
		.email("E-mail inválido"),
	password: z
		.string()
		.min(6, "Senha deve ter no mínimo 6 caracteres"),
});

export function AuthForm({ mode }: AuthFormProps) {
	const router = useRouter();

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

		try {
			if (mode === "register") {
				await AuthService.register(values);

				setSuccess("Conta criada com sucesso! Redirecionando...");

				setTimeout(() => {
					router.push("/login");
				}, 1500);

				return;
			}

			const result = await signIn("credentials", {
				redirect: false,
				email: values.email,
				password: values.password,
			});

			if (result?.error) {
				setError("E-mail ou senha inválidos");
				return;
			}

			router.push("/");
		} catch {
			setError("Ocorreu um erro. Tente novamente.");
		} finally {
			setIsLoading(false);
		}
	}

	const isSubmitting = form.formState.isSubmitting || isLoading;

	return (
		<Card className="w-full max-w-md border-0 bg-gray-50 shadow-lg lg:bg-white">
			<CardHeader>
				<CardTitle>{mode === "login" ? "Entrar" : "Criar Conta"}</CardTitle>

				<CardDescription>
					{mode === "login"
						? "Informe suas credenciais para acessar"
						: "Preencha seus dados para criar sua conta"}
				</CardDescription>
			</CardHeader>

			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name={"email"}
							render={({ field }) => (
								<FormItem>
									<FormLabel>E-mail</FormLabel>

									<FormControl>
										<Input
											type="email"
											placeholder="email@empresa.com"
											disabled={isSubmitting}
											{...field}
										/>
									</FormControl>

									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name={"password"}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Senha</FormLabel>

									<FormControl>
										<Input
											type="password"
											placeholder="********"
											disabled={isSubmitting}
											{...field}
										/>
									</FormControl>

									<FormMessage />
								</FormItem>
							)}
						/>

						{error && <p className="text-sm text-destructive">{error}</p>}
						{success && <p className="text-sm text-green-600">{success}</p>}

						<Button type="submit" className="w-full" disabled={isSubmitting}>
							{isSubmitting ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									{mode === "login" ? "Entrando..." : "Cadastrando..."}
								</>
							) : mode === "login" ? (
								"Entrar"
							) : (
								"Cadastrar"
							)}
						</Button>
					</form>
				</Form>

				<div className="mt-4 text-center text-sm text-muted-foreground">
					{mode === "login" ? (
						<>
							Não tem uma conta?{" "}
							<a
								href="/register"
								className="font-medium text-primary hover:underline"
							>
								Criar conta
							</a>
						</>
					) : (
						<>
							Já tem uma conta?{" "}
							<a
								href="/login"
								className="font-medium text-primary hover:underline"
							>
								Fazer login
							</a>
						</>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
