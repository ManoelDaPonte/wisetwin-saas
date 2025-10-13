"use client";

import { useTranslations } from "@/hooks/use-translations";
import { WelcomeHero } from "./components/welcome-hero";
import { ConceptsExplainer } from "./components/concepts-explainer";
import { QuickActions } from "./components/quick-actions";
import { PersonalSpaceInfo } from "./components/personal-space-info";
import { FaqSection } from "./components/faq-section";
import { ContactSection } from "./components/contact-section";
import { Separator } from "@/components/ui/separator";

export default function HomePage() {
  const t = useTranslations();

  return (
    <div className="container mx-auto py-8 space-y-12">
      {/* Section Hero avec badge et message contextuel */}
      <WelcomeHero />

      <Separator className="my-8" />

      {/* Information sur l'espace personnel (uniquement en mode personnel) */}
      <PersonalSpaceInfo />

      {/* Explication des concepts (visible pour tous) */}
      <ConceptsExplainer />

      <Separator className="my-8" />

      {/* Actions rapides contextuelles */}
      <QuickActions />

      <Separator className="my-8" />

      {/* Questions fréquentes */}
      <FaqSection />

      <Separator className="my-8" />

      {/* Section contact */}
      <ContactSection />

      {/* Signature */}
      <div className="mt-16 pt-8 text-center">
        <p className="text-lg font-medium text-muted-foreground">
          {t.home.signature}
        </p>
      </div>
    </div>
  );
}
