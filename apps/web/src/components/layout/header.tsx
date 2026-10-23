"use client";

import { LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/src/lib/utils";
import { Brand } from "./brand";
import { isNavItemActive, logout, navItems } from "./nav";

/** Barra superior e abas de navegação (somente celular/tablet estreito). */
export function Header() {
	const pathname = usePathname();

	return (
		<header className="md:hidden">
			<div className="flex h-14 items-center justify-between bg-sidebar px-4">
				<Brand />
				<button
					type="button"
					onClick={logout}
					aria-label="Sair"
					className="flex size-9 items-center justify-center rounded-lg text-white/80 transition-colors hover:bg-white/10 hover:text-white"
				>
					<LogOut className="size-4.5" aria-hidden="true" />
				</button>
			</div>

			<nav
				aria-label="Principal"
				className="grid grid-cols-3 border-b border-border bg-card"
			>
				{navItems.map((item) => {
					const Icon = item.icon;
					const active = isNavItemActive(pathname, item.href);

					return (
						<Link
							key={item.href}
							href={item.href}
							aria-current={active ? "page" : undefined}
							className={cn(
								"flex items-center justify-center gap-2 border-b-2 py-3 text-sm font-medium transition-colors",
								active
									? "border-primary text-primary"
									: "border-transparent text-muted-foreground hover:text-foreground",
							)}
						>
							<Icon className="size-4" aria-hidden="true" />
							{item.label}
						</Link>
					);
				})}
			</nav>
		</header>
	);
}
