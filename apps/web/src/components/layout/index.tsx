import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { auth } from "@/src/auth";
import { Header } from "./header";
import { Sidebar } from "./sidebar";

interface DashboardLayoutProps {
	children: ReactNode;
}

export async function DashboardLayout({ children }: DashboardLayoutProps) {
	const session = await auth();

	if (!session) {
		redirect("/login");
	}
	
	return (
		<div className="flex h-screen overflow-hidden">
			<Sidebar />

			<div className="flex flex-1 flex-col">
				<Header />

				<main className="flex-1 overflow-auto p-6">{children}</main>
			</div>
		</div>
	);
}
