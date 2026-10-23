import { BarChart3, LayoutDashboard, Link2 } from "lucide-react";
import { signOut } from "next-auth/react";
import { AuthService } from "@/src/services/auth-service";

export const navItems = [
	{ label: "Dashboard", href: "/", icon: LayoutDashboard },
	{ label: "Links", href: "/links", icon: Link2 },
	{ label: "Analytics", href: "/analytics", icon: BarChart3 },
];

/** "/analytics/abc" também deixa "Analytics" ativo; "/" só ativa no próprio "/". */
export function isNavItemActive(pathname: string, href: string): boolean {
	if (href === "/") return pathname === "/";
	return pathname === href || pathname.startsWith(`${href}/`);
}

export async function logout() {
	try {
		await AuthService.logout();
	} finally {
		await signOut({ callbackUrl: "/login" });
	}
}
