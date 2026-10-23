import type { Metadata } from "next";
import { AuthForm } from "@/src/components/auth-form";
import { AuthShell } from "@/src/components/auth-shell";

export const metadata: Metadata = {
	title: "Entrar",
};

export default function LoginPage() {
	return (
		<AuthShell>
			<AuthForm mode="login" />
		</AuthShell>
	);
}
