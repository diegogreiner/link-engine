"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
	email: z.email(),
	password: z.string().min(6),
});

export function AuthForm({ mode }: AuthFormProps) {
	const router = useRouter();

	const [error, setError] = useState("");

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

		try {
			if (mode === "register") {
				AuthService.register(values);

				router.push("/login");
				return;
			}

			const result = await signIn("credentials", {
				redirect: false,
				email: values.email,
				password: values.password,
			});

			if (result?.error) {
				setError("Credenciais inválidas");
				return;
			}

			router.push("/dashboard");
		} catch {
			setError("Ocorreu um erro");
		}
	}

	return (
		<Card className="w-full max-w-md">
			<CardHeader>
				<CardTitle>{mode === "login" ? "Entrar" : "Criar Conta"}</CardTitle>

				<CardDescription>
					{mode === "login"
						? "Informe suas credenciais"
						: "Preencha seus dados"}
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
										<Input type="password" placeholder="********" {...field} />
									</FormControl>

									<FormMessage />
								</FormItem>
							)}
						/>

						{error && <p className="text-sm text-destructive">{error}</p>}

						<Button type="submit" className="w-full">
							{mode === "login" ? "Entrar" : "Cadastrar"}
						</Button>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
