import Link from "next/link";
import { ThemeLogo } from "./components/theme-logo";
import { LanguageSelector } from "@/app/components/language-selector";

export default function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="grid min-h-svh lg:grid-cols-2">
			<div className="flex flex-col gap-4 p-6 md:p-10">
				<div className="flex justify-center gap-2 md:justify-start">
					<Link
						href="/"
						className="flex items-center gap-2 font-medium"
					>
						<div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
							<ThemeLogo size="small" variant="normal" />
						</div>
						WiseTwin
					</Link>
				</div>
				<div className="flex flex-1 items-center justify-center">
					<div className="w-full max-w-xs">{children}</div>
				</div>
			</div>
			<div className="bg-muted relative hidden lg:flex flex-col items-center justify-center">
				<div className="absolute top-6 right-6">
					<LanguageSelector />
				</div>
				<ThemeLogo size="large" className="mb-6" />
				<p className="text-muted-foreground text-center text-sm font-medium tracking-wide">
					Sécurité • Formation • Immersion • Excellence
				</p>
			</div>
		</div>
	);
}
