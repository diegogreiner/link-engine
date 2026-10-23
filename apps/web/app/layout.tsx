import { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/src/providers/session-provider";
import { Providers } from "@/src/providers/toast";

// Plex Sans para a interface; Plex Mono só para os códigos curtos.
const plexSans = IBM_Plex_Sans({
	variable: "--font-plex-sans",
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
	display: "swap",
});

const plexMono = IBM_Plex_Mono({
	variable: "--font-plex-mono",
	subsets: ["latin"],
	weight: ["400", "500"],
	display: "swap",
});

export const metadata: Metadata = {
	title: {
		default: "Link Engine",
		template: "%s | Link Engine",
	},
	description: "Encurte, gerencie e analise seus links",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="pt-BR"
			className={`${plexSans.variable} ${plexMono.variable} h-full antialiased`}
		>
			<body className="flex min-h-full flex-col">
				<SessionProvider>
					<Providers>{children}</Providers>
				</SessionProvider>
			</body>
		</html>
	);
}
