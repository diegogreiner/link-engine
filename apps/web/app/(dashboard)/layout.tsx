import type { Metadata } from "next";
import { DashboardLayout } from "@/src/components/layout";

export const metadata: Metadata = {
	title: "Dashboard",
};

export default function DashboardRootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <DashboardLayout>{children}</DashboardLayout>;
}
