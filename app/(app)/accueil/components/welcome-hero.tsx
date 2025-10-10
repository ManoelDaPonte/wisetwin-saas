"use client";

import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";
import {
  useOrganizationStore,
  useIsPersonalSpace,
} from "@/stores/organization-store";
import { useTranslations } from "@/hooks/use-translations";
import { Building2, User } from "lucide-react";

export function WelcomeHero() {
  const { data: session } = useSession();
  const { activeOrganization, organizations } = useOrganizationStore();
  const isPersonalSpace = useIsPersonalSpace();
  const t = useTranslations();

  // Déterminer si c'est un nouvel utilisateur
  const isNewUser = organizations.length === 0;

  // Déterminer le nom à afficher
  const userName =
    session?.user?.firstName ||
    session?.user?.name ||
    session?.user?.email ||
    t.common.user;

  // Message contextuel selon l'état
  const getContextualMessage = () => {
    if (isNewUser) {
      return t.home.contextualMessages.newUser;
    }
    if (isPersonalSpace) {
      return t.home.contextualMessages.personalSpace;
    }
    return `${t.home.contextualMessages.organizationSpace} ${activeOrganization?.name}`;
  };

  return (
    <div className="relative">
      {/* Badge d'espace actuel */}
      <div className="flex justify-center mb-6">
        <Badge variant="outline" className="px-4 py-2 text-sm">
          {isPersonalSpace ? (
            <>
              <User className="h-4 w-4 mr-2" />
              Espace personnel
            </>
          ) : (
            <>
              <Building2 className="h-4 w-4 mr-2" />
              {activeOrganization?.name}
              {activeOrganization?.role && (
                <span className="ml-2 text-muted-foreground">
                  •{" "}
                  {activeOrganization.role === "OWNER"
                    ? "Propriétaire"
                    : activeOrganization.role === "ADMIN"
                    ? "Administrateur"
                    : "Membre"}
                </span>
              )}
            </>
          )}
        </Badge>
      </div>

      {/* Titre et message de bienvenue */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          {t.home.welcome} {userName} !
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {getContextualMessage()}
        </p>
      </div>
    </div>
  );
}
