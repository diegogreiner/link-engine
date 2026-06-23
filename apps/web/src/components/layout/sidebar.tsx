"use client";

import { BarChart3, Link2, LogOut, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { signOut } from "next-auth/react";

const items = [
	{
		label: "Dashboard",
		href: "/dashboard",
		icon: BarChart3,
	},
	{
		label: "Links",
		href: "/links",
		icon: Link2,
	},
];

export function Sidebar() {
	const pathname = usePathname();

	return (
		<aside className="w-64 border-r bg-background">
			<div className="border-b p-6">
				<h1 className="text-xl font-bold">Link Engine</h1>

				<p className="text-sm text-muted-foreground">URL Shortener</p>
			</div>

			<nav className="p-4 space-y-2">
				{items.map((item) => {
					const Icon = item.icon;

					const active = pathname === item.href;

					return (
						<Link
							key={item.href}
							href={item.href}
							className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition
								${
									active
										? "bg-primary text-primary-foreground"
										: "hover:bg-muted"
								}`}
						>
							<Icon size={18} />

							<span>{item.label}</span>
						</Link>
					);
				})}
			</nav>

			<div className="mt-auto p-4">
				<button
					type="button"
					onClick={() => signOut()}
					className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-muted"
				>
					<LogOut size={18} />
					Sair
				</button>
			</div>
		</aside>
	);
}
