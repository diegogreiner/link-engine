"use client";

import { LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/src/lib/utils";
import { Brand } from "./brand";
import { isNavItemActive, logout, navItems } from "./nav";

/** Navegação lateral (desktop). No celular quem aparece é o Header. */
export function Sidebar() {
	const pathname = usePathname();
	const { data: session } = useSession();

	return (
		<aside className="hidden w-60 shrink-0 flex-col bg-sidebar text-sidebar-foreground md:flex">
			<div className="flex h-16 items-center px-5">
				<Brand />
			</div>

			<nav aria-label="Principal" className="flex-1 space-y-1 px-3 pt-2">
				{navItems.map((item) => {
					const Icon = item.icon;
					const active = isNavItemActive(pathname, item.href);

					return (
						<Link
							key={item.href}
							href={item.href}
							aria-current={active ? "page" : undefined}
							className={cn(
								"flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
								active
									? "bg-white/12 text-white"
									: "text-white/70 hover:bg-white/6 hover:text-white",
							)}
						>
							<Icon className="size-4.5" aria-hidden="true" />
							{item.label}
						</Link>
					);
				})}
			</nav>

			<div className="border-t border-sidebar-border px-3 py-3">
				{session?.user?.email && (
					<p
						className="truncate px-3 pb-2 text-xs text-white/60"
						title={session.user.email}
					>
						{session.user.email}
					</p>
				)}
				<button
					type="button"
					onClick={logout}
					className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/6 hover:text-white"
				>
					<LogOut className="size-4.5" aria-hidden="true" />
					Sair
				</button>
			</div>
		</aside>
	);
}
