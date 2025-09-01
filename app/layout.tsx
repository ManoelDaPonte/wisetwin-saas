import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Wise Twin",
	description: "Plateforme de formation 3D en ligne",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="fr" suppressHydrationWarning className="h-full">
			<body className={`${inter.className} h-full`}>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
