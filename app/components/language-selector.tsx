"use client";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguageStore, Language } from "@/stores/language-store";
import { Languages } from "lucide-react";

const languages = {
	fr: {
		label: "Français",
		flag: "🇫🇷",
	},
	en: {
		label: "English", 
		flag: "🇺🇸",
	},
} as const;

export function LanguageSelector() {
	const { currentLanguage, setLanguage } = useLanguageStore();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" size="sm" className="gap-2">
					<Languages className="h-4 w-4" />
					<span className="hidden sm:inline-block">
						{languages[currentLanguage].flag} {languages[currentLanguage].label}
					</span>
					<span className="sm:hidden">
						{languages[currentLanguage].flag}
					</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				{Object.entries(languages).map(([code, config]) => (
					<DropdownMenuItem
						key={code}
						onClick={() => setLanguage(code as Language)}
						className="gap-2 cursor-pointer"
					>
						<span>{config.flag}</span>
						<span>{config.label}</span>
						{currentLanguage === code && (
							<span className="ml-auto">✓</span>
						)}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}