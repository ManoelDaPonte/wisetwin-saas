export const fr = {
  // Navigation et interface générale
  home: {
    welcome: "Bonjour",
    subtitle: "Bienvenue sur WiseTwin, votre plateforme de simulateurs immersifs.",
    signature: "Sécurité • Formation • Immersion • Excellence"
  },
  
  // Navigation sidebar
  navigation: {
    home: "Accueil",
    dashboard: "Tableau de bord",
    organization: "Organisation",
    wisetrainer: "WiseTrainer",
    wisetour: "Wisetour",
    superAdmin: "Super-admin",
    
    // Labels des sections
    mainNavigation: "Navigation",
    application: "Application", 
    administration: "Administration",
    
    // Sous-menus
    overview: "Vue d'ensemble",
    certifications: "Certifications",
    members: "Membres",
    settings: "Paramètres",
    trainingPlan: "Plan de formation",
    allTrainings: "Toutes les formations",
    completedTrainings: "Formations terminées",
    virtualVisits: "Visites Virtuelles",
    formations: "Formations",
    users: "Utilisateurs",
    organizations: "Organisations",
    myVisits: "Mes visites"
  },
  
  // Authentification
  auth: {
    login: {
      title: "Connexion à votre compte",
      subtitle: "Entrez votre email pour vous connecter à votre compte",
      email: "Email",
      password: "Mot de passe",
      emailPlaceholder: "exemple@email.com",
      forgotPassword: "Mot de passe oublié ?",
      loginButton: "Se connecter",
      loginInProgress: "Connexion en cours...",
      noAccount: "Vous n'avez pas de compte ?",
      signUp: "S'inscrire",
      invitationMessage: "Connectez-vous pour accepter votre invitation à rejoindre une organisation.",
      errors: {
        invalidCredentials: "Email ou mot de passe incorrect",
        generalError: "Une erreur est survenue. Veuillez réessayer."
      }
    },
    register: {
      title: "Créer un compte",
      subtitle: "Remplissez les informations ci-dessous pour créer votre compte",
      firstName: "Prénom",
      firstNamePlaceholder: "Jean",
      lastName: "Nom",
      lastNamePlaceholder: "Dupont",
      email: "Email",
      emailPlaceholder: "exemple@email.com",
      password: "Mot de passe",
      confirmPassword: "Confirmer le mot de passe",
      createButton: "Créer un compte",
      creatingInProgress: "Création en cours...",
      hasAccount: "Vous avez déjà un compte ?",
      signIn: "Se connecter",
      errors: {
        passwordMismatch: "Les mots de passe ne correspondent pas",
        generalError: "Une erreur est survenue. Veuillez réessayer."
      }
    },
    forgotPassword: {
      title: "Mot de passe oublié",
      subtitle: "Saisissez votre adresse email pour recevoir un lien de réinitialisation",
      email: "Email",
      emailPlaceholder: "exemple@email.com",
      sendButton: "Envoyer le lien",
      sendingInProgress: "Envoi en cours...",
      rememberPassword: "Vous vous souvenez de votre mot de passe ?",
      backToLogin: "Se connecter",
      success: {
        title: "Email envoyé",
        message: "Si votre adresse email est dans notre système, vous recevrez un lien de réinitialisation dans quelques minutes.",
        backToLogin: "Retour à la connexion"
      }
    },
    resetPassword: {
      title: "Nouveau mot de passe",
      subtitle: "Saisissez votre nouveau mot de passe",
      newPassword: "Nouveau mot de passe",
      confirmPassword: "Confirmer le mot de passe",
      resetButton: "Réinitialiser le mot de passe",
      resettingInProgress: "Réinitialisation en cours...",
      backToLogin: "Retour à la connexion",
      success: {
        title: "Mot de passe réinitialisé",
        message: "Votre mot de passe a été réinitialisé avec succès. Vous allez être redirigé vers la page de connexion.",
        loginNow: "Se connecter maintenant"
      },
      errors: {
        invalidLink: {
          title: "Lien invalide",
          message: "Le lien de réinitialisation est invalide ou manquant.",
          requestNew: "Demander un nouveau lien"
        },
        missingToken: "Token manquant. Veuillez utiliser le lien reçu par email.",
        passwordMismatch: "Les mots de passe ne correspondent pas"
      }
    }
  },

  // Tableau de bord
  dashboard: {
    title: "Tableau de bord",
    noSession: "Veuillez vous connecter pour accéder à votre tableau de bord.",
    wisetrainer: {
      title: "WiseTrainer (Formations)",
      completedTrainings: "Formations terminées"
    },
    wisetour: {
      title: "Wisetour (Visites)",
      environmentsVisited: "Environnements visités"
    },
    recentActivity: {
      title: "Activité récente",
      completed: "a terminé",
      you: "Vous",
      training: "Formation",
      visit: "Visite",
      noActivity: "Aucune activité récente. Commencez une formation !",
      errorLoading: "Une erreur est survenue lors du chargement des données. Veuillez rafraîchir la page."
    }
  },

  // Certifications
  certifications: {
    title: "Mes Certifications",
    subtitle: "Téléchargez les certificats de vos formations terminées",
    searchPlaceholder: "Rechercher une formation...",
    table: {
      formation: "Formation",
      completionDate: "Date de completion",
      actions: "Actions",
      downloadButton: "Télécharger",
      generating: "Génération..."
    },
    stats: {
      availableSingular: "certification disponible",
      availablePlural: "certifications disponibles"
    },
    pagination: {
      previous: "Précédent",
      next: "Suivant",
      page: "Page",
      of: "sur"
    },
    empty: {
      noResults: "Aucune certification trouvée pour",
      noCertifications: "Aucune certification disponible",
      getStarted: "Terminez des formations pour obtenir vos premiers certificats"
    },
    errors: {
      organizationMissing: "Informations d'organisation manquantes",
      downloadFailed: "Erreur lors du téléchargement"
    },
    success: {
      downloadComplete: "Certificat téléchargé avec succès !"
    }
  },
  
  // Organisation
  organization: {
    title: "Organisation",
    joinWithCode: "Rejoindre avec un code",
    createOrganization: "Créer une organisation", 
    manageMembers: "Gérer les membres",
    dashboard: "Tableau de bord",
    joinOrCreate: "Rejoignez une organisation ou créez la vôtre",
    manage: "Gérez",
    overview: {
      title: "Vue d'ensemble",
      subtitle: "Tableau de bord de votre organisation"
    }
  },

  // Membres
  members: {
    title: "Membres",
    subtitle: "Gérez les membres et leurs permissions dans",
    invite: {
      button: "Inviter un membre",
      title: "Inviter un membre",
      description: "Envoyez une invitation par email pour rejoindre votre organisation. L'invitation expirera dans 7 jours.",
      email: "Email",
      emailPlaceholder: "membre@example.com",
      emailDescription: "L'adresse email de la personne à inviter",
      role: "Rôle",
      rolePlaceholder: "Sélectionner un rôle",
      roleDescription: "Les administrateurs peuvent inviter et gérer les membres",
      roles: {
        member: "Membre",
        admin: "Administrateur"
      },
      cancel: "Annuler",
      send: "Envoyer l'invitation",
      sending: "Envoi...",
      errors: {
        invalidEmail: "Email invalide",
        roleRequired: "Veuillez sélectionner un rôle"
      }
    },
    table: {
      name: "Nom",
      email: "Email",
      role: "Rôle",
      status: "Statut",
      joinedAt: "Rejoint le",
      actions: "Actions",
      statuses: {
        active: "Actif",
        invited: "Invité",
        pending: "En attente"
      },
      roles: {
        owner: "Propriétaire",
        admin: "Administrateur", 
        member: "Membre"
      },
      empty: "Aucun membre trouvé",
      loading: "Chargement des membres..."
    },
    actions: {
      changeRole: "Changer le rôle",
      remove: "Retirer",
      cancelInvitation: "Annuler l'invitation"
    }
  },

  // Paramètres organisation
  organizationSettings: {
    title: "Paramètres de l'organisation",
    subtitle: "Gérez les paramètres et la configuration de"
  },

  // Tableau de bord formations
  trainingDashboard: {
    title: "Tableau de bord des formations",
    subtitle: "Suivez l'avancement des formations de vos équipes",
    stats: {
      activeUsers: "Utilisateurs actifs",
      activeTrainings: "Formations actives",
      completionRate: "Taux de complétion",
      averageTime: "Temps moyen",
      perTraining: "Par formation",
      noData: "Aucune donnée disponible",
      noActiveTraining: "Aucune formation active"
    },
    ongoingTrainings: {
      title: "Formations en cours",
      subtitle: "Progression globale par formation",
      completed: "Terminée",
      ongoing: "En cours",
      users: "utilisateurs",
      averageProgress: "Progression moyenne"
    },
    recentActivity: {
      title: "Activité récente",
      subtitle: "Dernières progressions des utilisateurs",
      assignButton: "Assigner des formations"
    }
  },

  // Plan de formation
  trainingPlan: {
    title: "Gestion des plans de formations",
    subtitle: "Gérez les formations de vos membres",
    restrictedAccess: {
      title: "Accès restreint",
      message: "Seuls les administrateurs et propriétaires peuvent gérer les formations."
    },
    selectOrganization: "Veuillez sélectionner une organisation pour accéder à la gestion des formations.",
    tabs: {
      dashboard: "Tableau de bord",
      plans: "Plans",
      members: "Membres",
      trainings: "Formations"
    }
  },

  // Administration
  admin: {
    organizations: {
      title: "Toutes les organisations",
      subtitle: "Superviser et gérer les organisations et leurs membres",
      searchPlaceholder: "Rechercher une organisation...",
      emptyMessage: "Aucune organisation trouvée",
      table: {
        organization: "Organisation",
        owner: "Propriétaire",
        noName: "Sans nom",
        members: "Membres",
        trainings: "Formations",
        invitations: "Invitations",
        containerId: "Container ID",
        created: "Créée"
      },
      actions: {
        edit: "Modifier",
        contactOwner: "Contact owner",
        delete: "Supprimer"
      }
    },
    users: {
      title: "Tous les utilisateurs",
      subtitle: "Gérer et superviser les comptes utilisateurs de la plateforme",
      searchPlaceholder: "Rechercher un utilisateur...",
      emptyMessage: "Aucun utilisateur trouvé",
      table: {
        user: "Utilisateur",
        emailVerified: "Email vérifié",
        verified: "Vérifié",
        notVerified: "Non vérifié",
        organizations: "Organisations",
        followedTrainings: "Formations suivies",
        container: "Container",
        created: "Créé",
        none: "Aucun",
        registered: "Inscrit"
      },
      actions: {
        contact: "Contact",
        delete: "Supprimer"
      }
    },
    trainings: {
      title: "Toutes les formations",
      subtitle: "Gérer les métadonnées et configurations des formations Unity",
      searchPlaceholder: "Rechercher une formation...",
      emptyMessage: "Aucune formation trouvée",
      table: {
        formation: "Formation",
        type: "Type",
        container: "Container",
        organization: "Organisation",
        lastModified: "Dernière modification",
        unknown: "Inconnue",
        metadata: "Métadonnées",
        present: "Présentes",
        missing: "Manquantes"
      },
      actions: {
        edit: "Éditer"
      }
    }
  },
  
  // Formations Unity
  wisetrainer: {
    title: "Formations disponibles",
    subtitle: "Explorez et lancez les modules de formation Unity"
  },

  wisetour: {
    title: "Visites disponibles", 
    subtitle: "Explorez et lancez les visites d'environnements industriels Unity"
  },

  completedTrainings: {
    title: "Formations Terminées",
    subtitle: "Consultez l'historique de vos formations terminées ({count} formation{s}) et relancez-les si nécessaire"
  },

  myVisits: {
    title: "Mes Visites",
    subtitle: "Gérez et suivez vos visites industrielles en cours"
  },

  // Formations et environnements
  training: {
    title: "Formations & Environnements",
    subtitle: "Accédez à vos formations et environnements 3D",
    wisetrainer: "WiseTrainer"
  },
  
  // Progression et certifications
  progress: {
    title: "Progression & Certifications",
    subtitle: "Suivez vos avancements et obtenez vos certifications",
    myDashboard: "Mon tableau de bord",
    myCertifications: "Mes certifications"
  },

  // Paramètres
  settings: {
    title: "Paramètres",
    subtitle: "Gérez vos préférences et paramètres de compte",
    profile: {
      title: "Profil",
      subtitle: "Vos informations personnelles"
    },
    appearance: {
      title: "Apparence",
      subtitle: "Personnalisez l'apparence de l'application",
      theme: "Thème",
      light: "Clair",
      dark: "Sombre",
      system: "Système"
    },
    account: {
      title: "Compte",
      subtitle: "Gérez vos informations de compte",
      firstName: "Prénom",
      firstNamePlaceholder: "Votre prénom",
      name: "Nom",
      namePlaceholder: "Votre nom",
      save: "Sauvegarder",
      updateSuccess: "Informations mises à jour avec succès",
      updateError: "Erreur lors de la mise à jour",
      changePassword: {
        title: "Changer le mot de passe",
        current: "Mot de passe actuel",
        currentPlaceholder: "Entrez votre mot de passe actuel",
        new: "Nouveau mot de passe",
        newPlaceholder: "Entrez votre nouveau mot de passe",
        confirm: "Confirmer le nouveau mot de passe",
        confirmPlaceholder: "Confirmez votre nouveau mot de passe",
        button: "Changer le mot de passe",
        success: "Mot de passe changé avec succès",
        error: "Erreur lors du changement de mot de passe"
      }
    },
    dangerZone: {
      title: "Zone dangereuse",
      subtitle: "Actions irréversibles",
      deleteAccount: {
        title: "Supprimer le compte",
        description: "Cette action supprimera définitivement votre compte et toutes vos données. Cette action est irréversible.",
        passwordLabel: "Mot de passe pour confirmer",
        passwordPlaceholder: "Entrez votre mot de passe pour confirmer",
        button: "Supprimer mon compte",
        confirmTitle: "Êtes-vous absolument sûr ?",
        confirmDescription: "Cette action est irréversible. Cela supprimera définitivement votre compte, toutes vos données et tous les conteneurs Azure associés.",
        cancel: "Annuler",
        confirmButton: "Supprimer définitivement",
        passwordRequired: "Veuillez entrer votre mot de passe pour confirmer",
        success: "Compte supprimé avec succès",
        error: "Erreur lors de la suppression du compte"
      }
    }
  },
  
  // Communs
  common: {
    user: "Utilisateur",
    loading: "Chargement...",
    loadingStates: {
      generating: "Génération...", 
      creating: "Création en cours...",
      sending: "Envoi en cours...",
      connecting: "Connexion en cours...",
      resetting: "Réinitialisation en cours..."
    }
  }
} as const;