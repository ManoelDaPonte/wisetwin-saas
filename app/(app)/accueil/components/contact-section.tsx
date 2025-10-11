"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/hooks/use-translations";
import { Mail, Phone, ShoppingCart } from "lucide-react";

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
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <ShoppingCart className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle>{t.home.contact.commercial.title}</CardTitle>
            <CardDescription>{t.home.contact.commercial.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleEmailContact}
              className="w-full"
              variant="secondary"
            >
              <Mail className="mr-2 h-4 w-4" />
              {t.home.contact.commercial.cta}
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Phone className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle>{t.home.contact.support.title}</CardTitle>
            <CardDescription>{t.home.contact.support.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleSupportContact}
              className="w-full"
              variant="secondary"
            >
              <Mail className="mr-2 h-4 w-4" />
              {t.home.contact.support.cta}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
