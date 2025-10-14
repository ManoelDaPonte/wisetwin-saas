import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { cache } from "react";
import {
  Award,
  BadgeCheck,
  BookOpen,
  Building2,
  Calendar,
  Mail,
  ShieldAlert,
  ShieldCheck,
  Timer,
} from "lucide-react";

export const dynamic = "force-dynamic";

type PageParams = { code: string };

const getCertificate = cache(async (code: string) => {
  let decodedCode = code;

  try {
    decodedCode = decodeURIComponent(code);
  } catch {
    decodedCode = code;
  }

  const normalizedCode = decodedCode.toUpperCase();

  return prisma.certificateVerification.findUnique({
    where: { code: normalizedCode },
    include: {
      trainingAnalytics: {
        include: {
          user: true,
          organization: true,
        },
      },
    },
  });
});

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { code } = await params;
  const certificate = await getCertificate(code);

  if (!certificate) {
    return {
      title: "Certificat introuvable - WiseTwin",
      description:
        "Aucun certificat correspondant à ce code n'a été trouvé dans notre base.",
    };
  }

  return {
    title: `Certificat valide (${certificate.code}) - WiseTwin`,
    description: `Confirmation officielle du certificat ${
      certificate.code
    } délivré à ${
      certificate.trainingAnalytics.user.name ??
      certificate.trainingAnalytics.user.email
    }.`,
  };
}

function formatDuration(seconds: number | null): string {
  if (!seconds || seconds <= 0) {
    return "Non communiqué";
  }

  const totalMinutes = Math.round(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    return `${hours}h${minutes.toString().padStart(2, "0")}`;
  }

  return `${minutes} min`;
}

function resolveUserNames(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  fallback?: string
): { firstName: string; lastName: string; display: string } {
  let resolvedFirst = firstName?.trim() ?? "";
  let resolvedLast = lastName?.trim() ?? "";

  const safeFallback = fallback?.trim();
  if ((!resolvedFirst || !resolvedLast) && safeFallback) {
    const parts = safeFallback.split(/\s+/).filter(Boolean);
    if (parts.length === 1) {
      if (!resolvedFirst) resolvedFirst = parts[0];
    } else if (parts.length > 1) {
      if (!resolvedFirst) resolvedFirst = parts[0];
      if (!resolvedLast) resolvedLast = parts.slice(1).join(" ");
    }
  }

  if (!resolvedFirst) resolvedFirst = "Prénom non communiqué";
  if (!resolvedLast) resolvedLast = "Nom non communiqué";

  return {
    firstName: resolvedFirst,
    lastName: resolvedLast,
    display: `${resolvedFirst} ${resolvedLast}`.trim(),
  };
}

export default async function VerificationPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { code } = await params;
  const certificate = await getCertificate(code);
  let normalizedCode = code;

  try {
    normalizedCode = decodeURIComponent(code).toUpperCase();
  } catch {
    normalizedCode = code.toUpperCase();
  }

  if (!certificate) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200">
        <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-4 py-8 sm:px-6 text-center">
          {/* Logo WiseTwin */}
          <div className="mb-8">
            <Image
              src="https://res.cloudinary.com/dhojbmhmr/image/upload/v1748940258/logo_wisetwin_dark_atpnkr.svg"
              alt="WiseTwin Logo"
              width={140}
              height={40}
              priority
              className="h-10 w-auto"
            />
          </div>

          <div className="rounded-2xl bg-white p-8 sm:p-12 shadow-xl ring-1 ring-slate-200 w-full">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
              <ShieldAlert className="h-8 w-8" aria-hidden="true" />
            </div>
            <h1 className="mt-6 text-2xl sm:text-3xl font-bold text-slate-900">
              Certificat introuvable
            </h1>
            <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed">
              Aucun certificat correspondant au code{" "}
              <span className="font-mono font-semibold text-slate-900 bg-slate-100 px-2 py-1 rounded">
                {normalizedCode}
              </span>{" "}
              n&apos;a été trouvé dans notre système.
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Veuillez vérifier le code ou contacter l&apos;équipe WiseTwin pour
              plus d&apos;informations.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
              <Link
                href="https://www.wisetwin.eu"
                className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-md transition hover:bg-slate-800 hover:shadow-lg"
              >
                Visiter le site WiseTwin
              </Link>
              <a
                href="mailto:contact@wisetwin.eu"
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-400"
              >
                Contacter le support
              </a>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const training = certificate.trainingAnalytics;
  const userNames = resolveUserNames(
    training.user.firstName,
    training.user.name,
    training.user.email
  );

  // Utiliser le formationName stocké dans CertificateVerification, sinon fallback sur buildName
  const formationDisplayName = certificate.formationName || training.buildName;

  const completionDate = training.endTime
    ? format(training.endTime, "d MMMM yyyy", { locale: fr })
    : format(training.updatedAt, "d MMMM yyyy", { locale: fr });
  const duration = formatDuration(training.totalDuration);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 py-6 sm:py-12">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8 flex flex-col gap-3 sm:gap-4 text-center px-4">
          <div className="mx-auto flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg">
            <ShieldCheck
              className="h-7 w-7 sm:h-8 sm:w-8 text-white"
              aria-hidden="true"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
            Certificat Authentique
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Ce certificat WiseTwin est valide et correspond à une formation
            officiellement reconnue.
          </p>
        </div>

        {/* Certificate Card */}
        <section className="rounded-2xl bg-white shadow-xl ring-1 ring-slate-200/50 overflow-hidden">
          {/* Header with Code */}
          <header className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-4 sm:px-6 py-4 sm:py-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1">
                <p className="text-xs sm:text-sm uppercase tracking-wider text-slate-500 font-semibold mb-1">
                  Code de vérification
                </p>
                <p className="font-mono text-base sm:text-lg font-bold text-slate-900 break-all">
                  {certificate.code}
                </p>
              </div>
              <span className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-md">
                <BadgeCheck className="h-4 w-4" aria-hidden="true" />
                Vérifié
              </span>
            </div>
          </header>

          {/* Main Content Grid */}
          <div className="space-y-6 p-4 sm:p-6 lg:p-8">
            {/* Titulaire - Full width on mobile */}
            <div className="space-y-3">
              <h2 className="flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500">
                <Mail className="h-4 w-4" aria-hidden="true" />
                Titulaire du certificat
              </h2>
              <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 sm:p-5 shadow-sm">
                <p className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">
                  {userNames.display}
                </p>
                <div className="grid gap-2 text-sm">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="font-semibold uppercase tracking-wide text-slate-500 text-xs">
                      Nom :
                    </span>
                    <span className="text-slate-700">{userNames.lastName}</span>
                  </div>
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="font-semibold uppercase tracking-wide text-slate-500 text-xs">
                      Prénom :
                    </span>
                    <span className="text-slate-700">
                      {userNames.firstName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-200">
                    <Mail
                      className="h-4 w-4 text-slate-400 flex-shrink-0"
                      aria-hidden="true"
                    />
                    <span className="text-slate-600 break-all">
                      {training.user.email}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Two-column grid for tablet and desktop */}
            <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
              {/* Organisation */}
              <div className="space-y-3">
                <h2 className="flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500">
                  <Building2 className="h-4 w-4" aria-hidden="true" />
                  Organisation
                </h2>
                <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm min-h-[80px] flex items-center justify-center">
                  <p className="text-lg sm:text-xl font-bold text-slate-900">
                    {training.organization?.name ?? "Espace personnel"}
                  </p>
                </div>
              </div>

              {/* Formation */}
              <div className="space-y-3">
                <h2 className="flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500">
                  <BookOpen className="h-4 w-4" aria-hidden="true" />
                  Formation
                </h2>
                <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm min-h-[80px] flex items-center justify-center">
                  <p className="text-lg sm:text-xl font-bold text-slate-900">
                    {formationDisplayName}
                  </p>
                </div>
              </div>
            </div>

            {/* Three-column grid for metrics */}
            <div className="grid gap-4 sm:grid-cols-3">
              {/* Validation Date */}
              <div className="space-y-3">
                <h2 className="flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500">
                  <Calendar className="h-4 w-4" aria-hidden="true" />
                  Date de validation
                </h2>
                <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm text-center h-[80px] flex items-center justify-center">
                  <p className="text-base sm:text-lg font-bold text-slate-900">
                    {completionDate}
                  </p>
                </div>
              </div>

              {/* Duration */}
              <div className="space-y-3">
                <h2 className="flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500">
                  <Timer className="h-4 w-4" aria-hidden="true" />
                  Durée totale
                </h2>
                <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm text-center h-[80px] flex items-center justify-center">
                  <p className="text-base sm:text-lg font-bold text-slate-900">
                    {duration}
                  </p>
                </div>
              </div>

              {/* Score */}
              <div className="space-y-3">
                <h2 className="flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500">
                  <Award className="h-4 w-4" aria-hidden="true" />
                  Score final
                </h2>
                <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm text-center h-[80px] flex items-center justify-center">
                  <p className="text-base sm:text-lg font-bold text-emerald-600">
                    {Math.round(training.score ?? 0)}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="border-t border-slate-100 bg-gradient-to-r from-slate-50 to-white px-4 sm:px-6 py-5 sm:py-6">
            <div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Pour toute question sur la validité d&apos;un certificat,
                contactez{" "}
                <a
                  className="font-semibold text-slate-900 underline decoration-2 underline-offset-2 hover:text-emerald-600 transition"
                  href="mailto:contact@wisetwin.eu"
                >
                  contact@wisetwin.eu
                </a>
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Les certificats WiseTwin sont vérifiables en ligne grâce à leur
                QR code unique.
              </p>
            </div>
          </footer>
        </section>

        {/* Additional Info */}
        <div className="mt-6 sm:mt-8 text-center">
          <p className="text-xs sm:text-sm text-slate-500">
            Document généré automatiquement • Authenticité vérifiable en ligne
          </p>
        </div>
      </div>
    </main>
  );
}
