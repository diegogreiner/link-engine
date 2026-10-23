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
		<div className="flex h-dvh overflow-hidden bg-background">
			<Sidebar />

			<div className="flex min-w-0 flex-1 flex-col">
				<Header />

				<main className="flex-1 overflow-y-auto">
					<div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 md:px-8 md:py-8">
						{children}
					</div>
				</main>
			</div>
		</div>
	);
}
