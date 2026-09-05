"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { AuthService } from "@/src/services/auth-service";
import { Button } from "../ui/button";

export function Header() {
	async function handleLogout() {
		try {
			await AuthService.logout();
		} finally {
			await signOut({ callbackUrl: "/login" });
		}
	}

	return (
		<header className="flex h-16 items-center justify-between bg-blue-900 px-6 shadow-sm">
			<div></div>

			<Button
				variant="ghost"
				size="sm"
				onClick={handleLogout}
				className="!text-white !bg-transparent hover:!bg-white/20 hover:!text-white"
			>
				<LogOut className="mr-2 h-4 w-4" />
				Sair
			</Button>
		</header>
	);
}
