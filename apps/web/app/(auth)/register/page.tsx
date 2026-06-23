import Head from "next/head";
import { AuthForm } from "@/src/components/auth-form";

export default function RegisterPage() {
	return (
		<div className="flex min-h-screen items-center justify-center">
			<Head>
				<title>Cadastre-se</title>
			</Head>
			<AuthForm mode="register" />
		</div>
	);
}
