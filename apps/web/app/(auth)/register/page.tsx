import type { Metadata } from "next";
import { AuthForm } from "@/src/components/auth-form";
import { AuthShell } from "@/src/components/auth-shell";

export const metadata: Metadata = {
	title: "Criar conta",
};

export default function RegisterPage() {
	return (
		<AuthShell>
			<AuthForm mode="register" />
		</AuthShell>
	);
}
