"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "../ui/button";

export function Header() {
	return (
		<header className="flex h-16 items-center justify-between border-b px-6">
			<div>
				<h2 className="font-semibold">Dashboard</h2>
				<p className="text-sm text-muted-foreground">
					Gerencie seus links e acompanhe métricas
				</p>
			</div>

			<Button
				variant="outline"
				size="sm"
				onClick={() =>
					signOut({
						callbackUrl: "/login",
					})
				}
			>
				<LogOut className="mr-2 h-4 w-4" />
				Sair
			</Button>
		</header>
	);
}
