import Head from "next/head";
import { AuthForm } from "@/src/components/auth-form";

export default function LoginPage() {
	return (
		<div className="flex min-h-screen items-center justify-center">
			<Head>
				<title>Entrar</title>
			</Head>
			<AuthForm mode="login" />
		</div>
	);
}
