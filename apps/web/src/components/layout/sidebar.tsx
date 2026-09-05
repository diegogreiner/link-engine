"use client";

import { BarChart3, Link2, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { signOut } from "next-auth/react";
import { AuthService } from "@/src/services/auth-service";

const items = [
	{
		label: "Dashboard",
		href: "/",
		icon: BarChart3,
	},
	{
		label: "Links",
		href: "/links",
		icon: Link2,
	},
	{
		label: "Analytics",
		href: "/analytics",
		icon: BarChart3,
	},
];

export function Sidebar() {
	const pathname = usePathname();

	async function handleLogout() {
		try {
			await AuthService.logout();
		} finally {
			await signOut({ callbackUrl: "/login" });
		}
	}

	return (
		<aside className="w-64 bg-blue-900 text-white flex flex-col">
			<div className="border-b border-white/10 h-16 p-4 py-0 flex items-center">
				<h1 className="text-xl font-bold text-white">Link Engine</h1>
			</div>

			<nav className="flex-1 p-4 space-y-2">
				{items.map((item) => {
					const Icon = item.icon;

					const active = pathname === item.href;

					return (
						<Link
							key={item.href}
							href={item.href}
							className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium
								${
									active
										? "bg-white/20 text-white shadow-sm"
										: "text-white/70 hover:bg-white/10 hover:text-white"
								}`}
						>
							<Icon size={18} />

							<span>{item.label}</span>
						</Link>
					);
				})}
			</nav>

			<div className="border-t border-white/10 p-4">
				<button
					type="button"
					onClick={handleLogout}
					className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white"
				>
					<LogOut size={18} />
					Sair
				</button>
			</div>
		</aside>
	);
}
