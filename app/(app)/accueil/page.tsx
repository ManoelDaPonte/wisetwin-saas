"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	useOrganizationStore,
	useIsPersonalSpace,
} from "@/stores/organization-store";
import { useTranslations } from "@/hooks/use-translations";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
	Building2,
	Users,
	BookOpen,
	Award,
	BarChart3,
	ArrowRight,
	Plus,
	LogIn,
	Box,
} from "lucide-react";

export default function HomePage() {
	const router = useRouter();
	const { data: session } = useSession();
	const { activeOrganization } = useOrganizationStore();
	const isPersonalSpace = useIsPersonalSpace();
	const t = useTranslations();

	return (
		<div className="container mx-auto py-8 space-y-8">
			<div className="text-center mb-12">
				<h1 className="text-4xl font-bold mb-4">
					{t.home.welcome} {session?.user?.name || t.common.user} 👋
				</h1>
				<p className="text-xl text-muted-foreground">
					{t.home.subtitle}
				</p>
			</div>

			{/* Cards principales */}
			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{/* Card Organisation */}
				<Card className="hover:shadow-lg transition-shadow">
					<CardHeader>
						<div className="flex items-center justify-between mb-4">
							<div className="p-3 bg-primary/10 rounded-lg">
								<Building2 className="h-8 w-8 text-primary" />
							</div>
						</div>
						<CardTitle>{t.organization.title}</CardTitle>
						<CardDescription>
							{isPersonalSpace
								? t.organization.joinOrCreate
								: `${t.organization.manage} ${
										activeOrganization?.name ||
										"votre organisation"
								  }`}
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						{isPersonalSpace ? (
							<>
								<Button
									className="w-full justify-between"
									variant="outline"
									onClick={() => router.push("/organisation")}
								>
									<span className="flex items-center gap-2">
										<LogIn className="h-4 w-4" />
										{t.organization.joinWithCode}
									</span>
									<ArrowRight className="h-4 w-4" />
								</Button>
								<Button
									className="w-full justify-between"
									onClick={() => router.push("/organisation")}
								>
									<span className="flex items-center gap-2">
										<Plus className="h-4 w-4" />
										{t.organization.createOrganization}
									</span>
									<ArrowRight className="h-4 w-4" />
								</Button>
							</>
						) : (
							<>
								<Button
									className="w-full justify-between"
									variant="outline"
									onClick={() => router.push("/organisation")}
								>
									<span className="flex items-center gap-2">
										<Users className="h-4 w-4" />
										{t.organization.manageMembers}
									</span>
									<ArrowRight className="h-4 w-4" />
								</Button>
								<Button
									className="w-full justify-between"
									onClick={() =>
										router.push(
											"/organisation/tableau-de-bord"
										)
									}
								>
									<span className="flex items-center gap-2">
										<BarChart3 className="h-4 w-4" />
										{t.organization.dashboard}
									</span>
									<ArrowRight className="h-4 w-4" />
								</Button>
							</>
						)}
					</CardContent>
				</Card>

				{/* Card Formations et Environnements */}
				<Card className="hover:shadow-lg transition-shadow">
					<CardHeader>
						<div className="flex items-center justify-between mb-4">
							<div className="p-3 bg-primary/10 rounded-lg">
								<BookOpen className="h-8 w-8 text-primary" />
							</div>
						</div>
						<CardTitle>{t.training.title}</CardTitle>
						<CardDescription>
							{t.training.subtitle}
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						<Button
							className="w-full justify-between"
							variant="outline"
							onClick={() => router.push("/wisetrainer")}
						>
							<span className="flex items-center gap-2">
								<Box className="h-4 w-4" />
								{t.training.wisetrainer}
							</span>
							<ArrowRight className="h-4 w-4" />
						</Button>
						{/* <Button
							className="w-full justify-between"
							onClick={() => router.push("/wisetour")}
						>
							<span className="flex items-center gap-2">
								<Boxes className="h-4 w-4" />
								WiseTour - Environnements
							</span>
							<ArrowRight className="h-4 w-4" />
						</Button> */}
					</CardContent>
				</Card>

				{/* Card Progression et Certifications */}
				<Card className="hover:shadow-lg transition-shadow">
					<CardHeader>
						<div className="flex items-center justify-between mb-4">
							<div className="p-3 bg-primary/10 rounded-lg">
								<Award className="h-8 w-8 text-primary" />
							</div>
						</div>
						<CardTitle>{t.progress.title}</CardTitle>
						<CardDescription>
							{t.progress.subtitle}
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						<Button
							className="w-full justify-between"
							variant="outline"
							onClick={() => router.push("/tableau-de-bord")}
						>
							<span className="flex items-center gap-2">
								<BarChart3 className="h-4 w-4" />
								{t.progress.myDashboard}
							</span>
							<ArrowRight className="h-4 w-4" />
						</Button>
						<Button
							className="w-full justify-between"
							onClick={() =>
								router.push("/tableau-de-bord/certifications")
							}
						>
							<span className="flex items-center gap-2">
								<Award className="h-4 w-4" />
								{t.progress.myCertifications}
							</span>
							<ArrowRight className="h-4 w-4" />
						</Button>
					</CardContent>
				</Card>
			</div>

			{/* Signature */}
			<div className="mt-12 text-center">
				<p className="text-lg font-medium text-muted-foreground">
					{t.home.signature}
				</p>
			</div>
		</div>
	);
}
