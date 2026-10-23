import type { ReactNode } from "react";

interface PageHeaderProps {
	title: string;
	description?: ReactNode;
	action?: ReactNode;
}

/** Cabeçalho padrão das páginas do painel: título, descrição e ação principal. */
export function PageHeader({ title, description, action }: PageHeaderProps) {
	return (
		<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
			<div className="min-w-0 space-y-1">
				<h1 className="text-2xl font-semibold tracking-tight text-foreground">
					{title}
				</h1>
				{description && (
					<div className="text-sm text-muted-foreground">{description}</div>
				)}
			</div>
			{action && <div className="shrink-0">{action}</div>}
		</div>
	);
}
