import type { Metadata } from "next";
import { AuthForm } from "@/src/components/auth-form";
import { Link2 } from "lucide-react";

export const metadata: Metadata = {
	title: "Cadastre-se",
};

export default function RegisterPage() {
	return (
		<div className="flex min-h-screen flex-col lg:flex-row">
			<div className="flex w-full flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-blue-900 px-6 py-12 lg:w-1/2 lg:items-center lg:p-12 min-h-screen">
				<div className="text-center text-white">
					<div className="mb-6 inline-flex items-center justify-center rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
						<Link2 className="h-10 w-10 lg:h-12 lg:w-12" />
					</div>

					<h1 className="mb-3 text-3xl font-bold lg:text-4xl">Link Engine</h1>

					<p className="text-base text-blue-100 lg:text-lg">
						Crie sua conta e comece a gerenciar seus links
					</p>
				</div>

				<div className="mt-8 w-full max-w-md lg:hidden">
					<AuthForm mode="register" />
				</div>

				<div className="mt-8 hidden w-full max-w-md gap-4 text-left lg:grid">
					<div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
						<p className="font-semibold text-white">🔗 Links Curtos</p>
						<p className="text-sm text-blue-200">
							Crie links encurtados personalizados
						</p>
					</div>

					<div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
						<p className="font-semibold text-white">📊 Analytics</p>
						<p className="text-sm text-blue-200">
							Acompanhe cliques em tempo real
						</p>
					</div>

					<div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
						<p className="font-semibold text-white">🔒 Seguro</p>
						<p className="text-sm text-blue-200">
							Links seguros com criptografia
						</p>
					</div>
				</div>
			</div>

			<div className="hidden w-1/2 items-center justify-center bg-gray-200 p-12 lg:flex">
				<AuthForm mode="register" />
			</div>
		</div>
	);
}
