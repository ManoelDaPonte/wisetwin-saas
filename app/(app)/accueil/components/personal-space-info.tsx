"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/hooks/use-translations";
import { useIsPersonalSpace } from "@/stores/organization-store";
import { Plus, UserPlus, Building2, Mail } from "lucide-react";
import { CreateOrganizationDialog } from "@/app/components/create-organization-dialog";
import { JoinOrganizationDialog } from "@/app/components/join-organization-dialog";

export function PersonalSpaceInfo() {
  const t = useTranslations();
  const isPersonalSpace = useIsPersonalSpace();

  // N'afficher que dans l'espace personnel
  if (!isPersonalSpace) return null;

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent>
        <div className="space-y-6">
          {/* Section 1: Vous avez reçu une invitation */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-background rounded-lg border shrink-0">
                <UserPlus className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="font-semibold text-sm">
                    {t.home.personalSpace.invitation.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t.home.personalSpace.invitation.description}
                  </p>
                </div>
                <JoinOrganizationDialog>
                  <Button variant="default" size="sm">
                    <UserPlus className="mr-2 h-4 w-4" />
                    {t.home.personalSpace.invitation.cta}
                  </Button>
                </JoinOrganizationDialog>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-primary/5 px-2 text-muted-foreground">
                ou
              </span>
            </div>
          </div>

          {/* Section 2: Créer votre organisation */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-background rounded-lg border shrink-0">
                <Plus className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="font-semibold text-sm">
                    {t.home.personalSpace.create.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t.home.personalSpace.create.description}
                  </p>
                </div>
                <CreateOrganizationDialog>
                  <Button variant="default" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    {t.home.personalSpace.create.cta}
                  </Button>
                </CreateOrganizationDialog>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-primary/5 px-2 text-muted-foreground">
                ou
              </span>
            </div>
          </div>

          {/* Section 3: Simplement découvrir */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-background rounded-lg border shrink-0">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="font-semibold text-sm">
                    {t.home.personalSpace.discover.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t.home.personalSpace.discover.description}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    window.location.href = `mailto:contact@wisetwin.eu?subject=${encodeURIComponent(
                      t.home.personalSpace.discover.contactSubject
                    )}&body=${encodeURIComponent(
                      t.home.personalSpace.discover.contactBody
                    )}`;
                  }}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  {t.home.personalSpace.discover.cta}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
