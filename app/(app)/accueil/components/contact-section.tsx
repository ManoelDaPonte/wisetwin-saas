"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/hooks/use-translations";
import { Mail, Phone } from "lucide-react";

export function ContactSection() {
  const t = useTranslations();

  const handleEmailContact = () => {
    window.location.href = `mailto:contact@wisetwin.eu?subject=${encodeURIComponent(
      t.home.contact.emailSubject
    )}&body=${encodeURIComponent(t.home.contact.emailBody)}`;
  };

  const handleSupportContact = () => {
    window.location.href = `mailto:support@wisetwin.eu?subject=${encodeURIComponent(
      t.home.contact.supportSubject
    )}&body=${encodeURIComponent(t.home.contact.supportBody)}`;
  };

  return (
    <div className="space-y-6">
      {/* Titre et sous-titre */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {t.home.contact.title}
        </h2>
        <p className="text-muted-foreground mt-2">
          {t.home.contact.description}
        </p>
      </div>

      {/* Grid avec les 2 cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="font-semibold text-sm">
                      {t.home.contact.commercial.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t.home.contact.commercial.description}
                    </p>
                  </div>
                  <Button
                    onClick={handleEmailContact}
                    size="sm"
                    variant="default"
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    {t.home.contact.commercial.cta}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="font-semibold text-sm">
                      {t.home.contact.support.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t.home.contact.support.description}
                    </p>
                  </div>
                  <Button
                    onClick={handleSupportContact}
                    size="sm"
                    variant="default"
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    {t.home.contact.support.cta}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
