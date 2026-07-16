import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { ReactNode } from "react";
import { authOptions } from "@/src/auth";
import { Header } from "./header";
import { Sidebar } from "./sidebar";

interface DashboardLayoutProps {
	children: ReactNode;
}

export async function DashboardLayout({ children }: DashboardLayoutProps) {
	const session = await getServerSession(authOptions);

	if (!session) {
		redirect("/login");
	}

	return (
		<div className="flex h-screen overflow-hidden bg-gray-200">
			<Sidebar />

			<div className="flex flex-1 flex-col">
				<Header />

				<main className="flex-1 overflow-auto p-6">{children}</main>
			</div>
		</div>
	);
}
