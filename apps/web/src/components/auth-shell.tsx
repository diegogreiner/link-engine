import { ArrowDown, Link2 } from "lucide-react";
import type { ReactNode } from "react";

const FEATURES = [
	"Crie um link curto e copie com um clique.",
	"Veja cliques por dia, país, dispositivo e origem.",
	"Conecte o Google Analytics (GA4) em qualquer link.",
];

/**
 * Moldura das telas de login e cadastro. À esquerda, uma demonstração do que
 * o produto faz (URL longa vira link curto); à direita, o formulário.
 */
export function AuthShell({ children }: { children: ReactNode }) {
	return (
		<div className="flex min-h-dvh flex-col bg-background lg:flex-row">
			<aside className="bg-sidebar text-sidebar-foreground lg:flex lg:w-[46%] lg:flex-col lg:p-12 xl:p-16">
				<div className="flex items-center gap-2.5 px-5 py-4 lg:p-0">
					<span className="flex size-8 items-center justify-center rounded-lg bg-white/12 ring-1 ring-white/15">
						<Link2 className="size-4.5" aria-hidden="true" />
					</span>
					<span className="text-[0.9375rem] font-semibold tracking-tight">
						Link Engine
					</span>
				</div>

				<div className="hidden max-w-md space-y-10 lg:my-auto lg:block">
					<h1 className="text-[2rem] leading-tight font-semibold tracking-tight text-balance">
						Links curtos que mostram de onde vem cada clique.
					</h1>

					<figure
						aria-label="Exemplo de link encurtado"
						className="space-y-3 rounded-xl bg-white/6 p-5 ring-1 ring-white/10"
					>
						<p className="text-sm leading-relaxed break-all text-white/55">
							https://www.lojaaurora.com.br/colecao/black-friday-2026?utm_source=instagram&amp;utm_campaign=bf26
						</p>
						<ArrowDown className="size-4 text-white/40" aria-hidden="true" />
						<div className="flex flex-wrap items-baseline justify-between gap-3">
							<span className="rounded-md bg-white px-3 py-1.5 font-mono text-base text-accent-foreground">
								<span className="text-muted-foreground">/</span>
								<span className="font-medium">bf26Xa</span>
							</span>
							<span className="text-sm text-white/70 tabular-nums">
								1.284 cliques esta semana
							</span>
						</div>
					</figure>

					<ul className="space-y-3 text-[0.9375rem] text-white/80">
						{FEATURES.map((feature) => (
							<li key={feature} className="flex gap-3">
								<span
									className="mt-2 size-1.5 shrink-0 rounded-full bg-chart-2"
									aria-hidden="true"
								/>
								{feature}
							</li>
						))}
					</ul>
				</div>
			</aside>

			<main className="flex flex-1 items-start justify-center px-5 py-10 sm:items-center lg:px-12">
				<div className="w-full max-w-sm">{children}</div>
			</main>
		</div>
	);
}
