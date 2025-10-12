export const fr = {
  // Navigation et interface générale
  home: {
    welcome: "Bonjour",
    subtitle:
      "Bienvenue sur Wise Twin, votre plateforme de simulateurs immersifs.",
    signature: "Sécurité • Formation • Immersion • Excellence",
    onboarding: {
      title: "Démarrez votre parcours",
      step1: "Rejoindre ou créer",
      step1Desc: "Intégrez une organisation existante ou créez la vôtre",
      step2: "Explorer les formations",
      step2Desc: "Découvrez les modules WiseTrainer disponibles",
      step3: "Suivre votre progression",
      step3Desc: "Consultez vos statistiques et certifications",
    },
    concepts: {
      title: "Comment fonctionne Wise Twin ?",
      multitenant: {
        title: "Système multi-organisations",
        description:
          "Travaillez dans votre espace personnel ou rejoignez plusieurs organisations",
        detail1: "Chaque organisation a ses propres données isolées",
        detail2: "Invitez et gérez les membres de votre équipe",
        detail3: "Basculez entre plusieurs organisations facilement",
      },
      spaces: {
        title: "Espaces de travail",
        description:
          "Basculez facilement entre vos différents contextes de travail",
        detail1: "Espace personnel pour vos formations individuelles",
        detail2: "Espaces d'organisation pour le travail en équipe",
        detail3: "Permissions adaptées selon votre rôle",
      },
      trainings: {
        title: "Formations immersives",
        description:
          "Accédez à des simulations 3D Unity pour votre apprentissage",
        detail1: "Simulations 3D interactives avec Unity WebGL",
        detail2: "Suivi de progression en temps réel",
        detail3: "Certifications à l'issue des formations",
      },
    },
    contextualMessages: {
      newUser:
        "Bienvenue sur Wise Twin ! Commençons par configurer votre espace",
      personalSpace: "Vous êtes dans votre espace personnel",
      organizationSpace: "Vous travaillez dans l'organisation",
    },
    quickActions: {
      title: "Actions rapides",
      personalDescription: "Gérez votre espace personnel et vos formations",
      orgDescription: "Actions disponibles dans",
      manageOrganizations: "Gérez vos organisations",
      viewOrganizations: "Voir mes organisations",
      orgManagement: "Gestion de l'organisation",
      administerOrg: "Administrez",
      trainingPlans: "Plans de formation",
      settings: "Paramètres",
      orgTrainings: "Formations de l'organisation",
      accessResources: "Accédez aux ressources partagées",
      availableTrainings: "Formations disponibles",
      myProgress: "Ma progression",
      trackProgress: "Suivez vos avancements personnels",
    },
    personalSpace: {
      title: "Votre espace personnel",
      description:
        "Cet espace est présent par défaut pour vous permettre de tester gratuitement les fonctionnalités de la plateforme et découvrir nos démos avant toute démarche commerciale.",
      invitation: {
        title: "Vous avez reçu une invitation ?",
        description:
          "Rejoignez votre organisation en entrant le code d'invitation fourni par votre administrateur.",
        cta: "Rejoindre avec un code",
      },
      create: {
        title: "Créer votre organisation",
        description:
          "Créez votre propre espace de travail pour gérer vos équipes et vos formations.",
        cta: "Créer une organisation",
      },
      discover: {
        title: "Simplement découvrir",
        description:
          "Profitez de votre espace personnel pour explorer nos démos et tester gratuitement la plateforme avant toute démarche commerciale.",
        cta: "Nous contacter",
        contactSubject: "Demande d'information commerciale",
        contactBody:
          "Bonjour,\n\nJe découvre actuellement Wise Twin et souhaiterais obtenir plus d'informations sur vos solutions de formation immersive.\n\nCordialement,",
      },
    },
    faq: {
      title: "Questions fréquentes",
      subtitle: "Trouvez rapidement des réponses à vos questions",
      questions: {
        password: {
          question: "Comment changer mon mot de passe ?",
          answer:
            "Vous pouvez modifier votre mot de passe dans les paramètres de votre compte. Cliquez sur le lien ci-dessous pour y accéder directement.",
          linkText: "Accéder aux paramètres",
        },
        organization: {
          question: "Comment rejoindre ou créer une organisation ?",
          answer:
            "Pour rejoindre une organisation, vous avez besoin d'un code d'invitation fourni par un administrateur. Pour créer votre propre organisation, rendez-vous dans la section Organisation.",
          linkText: "Gérer mes organisations",
        },
        trainings: {
          question: "Où puis-je trouver les formations disponibles ?",
          answer:
            "Toutes les formations WiseTrainer sont accessibles depuis la page des formations. Vous y trouverez l'ensemble des modules disponibles pour votre espace actuel.",
          linkText: "Voir les formations",
        },
        certification: {
          question: "Comment obtenir mes certifications ?",
          answer:
            "Une fois une formation terminée, votre certificat est automatiquement généré. Vous pouvez le télécharger depuis votre tableau de bord des certifications.",
          linkText: "Mes certifications",
        },
        switching: {
          question:
            "Comment basculer entre mon espace personnel et mes organisations ?",
          answer:
            "Utilisez le sélecteur d'organisation dans la barre latérale (en haut à gauche). Vous pouvez basculer facilement entre votre espace personnel et vos différentes organisations. Vous serez automatiquement redirigé vers la page d'accueil lors du changement.",
        },
      },
    },
    contact: {
      title: "Besoin d'aide ?",
      description:
        "Notre équipe est là pour vous accompagner. Choisissez le type de demande qui correspond le mieux à vos besoins.",
      commercial: {
        title: "Questions commerciales",
        description: "Pour toute demande d'information, démonstration ou devis",
        cta: "Contacter l'équipe commerciale",
      },
      support: {
        title: "Support technique",
        description: "Pour toute question technique ou problème rencontré",
        cta: "Contacter le support",
      },
      emailSubject: "Demande d'information commerciale",
      emailBody:
        "Bonjour,\n\nJe souhaiterais obtenir plus d'informations sur vos solutions.\n\nCordialement,",
      supportSubject: "Demande de support technique",
      supportBody:
        "Bonjour,\n\nJe rencontre un problème technique et j'aurais besoin d'assistance.\n\nDescription du problème :\n\n\nCordialement,",
    },
  },

  // Navigation sidebar
  navigation: {
    // Labels des sections
    personal: "Personnel",
    application: "Applications",
    organization: "Organisation",
    superAdmin: "Super Admin",

    // Section Personnel
    home: "Accueil",
    myDashboard: "Mon tableau de bord",
    myActivity: "Mon activité",
    myCertifications: "Mes certifications",

    // Section Application
    wisetrainer: "WiseTrainer",
    wisetour: "Wisetour",

    // Section Organisation
    organizationOverview: "Mon organisation",
    members: "Membres",
    trainingPlans: "Plans de formation",
    analytics: "Analytiques",
    settings: "Paramètres",

    // Section Super Admin
    trainingCatalog: "Catalogue formations",
    allUsers: "Tous les utilisateurs",
    allOrganizations: "Toutes les organisations",

    // Menu utilisateur (bas de sidebar)
    userMenu: {
      settings: "Paramètres",
      logout: "Déconnexion",
    },

    // Anciens (pour compatibilité - non utilisés dans sidebar)
    overview: "Vue d'ensemble",
    certifications: "Certifications",
    trainingPlan: "Plan de formation",
    allTrainings: "Toutes les formations",
    completedTrainings: "Formations terminées",
    virtualVisits: "Visites Virtuelles",
    formations: "Formations",
    users: "Utilisateurs",
    organizations: "Organisations",
    myVisits: "Mes visites",
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
      invitationMessage:
        "Connectez-vous pour accepter votre invitation à rejoindre une organisation.",
      errors: {
        invalidCredentials: "Email ou mot de passe incorrect",
        generalError: "Une erreur est survenue. Veuillez réessayer.",
      },
    },
    register: {
      title: "Créer un compte",
      subtitle:
        "Remplissez les informations ci-dessous pour créer votre compte",
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
        generalError: "Une erreur est survenue. Veuillez réessayer.",
      },
    },
    forgotPassword: {
      title: "Mot de passe oublié",
      subtitle:
        "Saisissez votre adresse email pour recevoir un lien de réinitialisation",
      email: "Email",
      emailPlaceholder: "exemple@email.com",
      sendButton: "Envoyer le lien",
      sendingInProgress: "Envoi en cours...",
      rememberPassword: "Vous vous souvenez de votre mot de passe ?",
      backToLogin: "Se connecter",
      success: {
        title: "Email envoyé",
        message:
          "Si votre adresse email est dans notre système, vous recevrez un lien de réinitialisation dans quelques minutes.",
        backToLogin: "Retour à la connexion",
      },
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
        message:
          "Votre mot de passe a été réinitialisé avec succès. Vous allez être redirigé vers la page de connexion.",
        loginNow: "Se connecter maintenant",
      },
      errors: {
        invalidLink: {
          title: "Lien invalide",
          message: "Le lien de réinitialisation est invalide ou manquant.",
          requestNew: "Demander un nouveau lien",
        },
        missingToken:
          "Token manquant. Veuillez utiliser le lien reçu par email.",
        passwordMismatch: "Les mots de passe ne correspondent pas",
      },
    },
  },

  // Tableau de bord
  dashboard: {
    title: "Tableau de bord",
    noSession: "Veuillez vous connecter pour accéder à votre tableau de bord.",
    wisetrainer: {
      title: "WiseTrainer (Formations)",
      completedTrainings: "Formations terminées",
    },
    wisetour: {
      title: "Wisetour (Visites)",
      environmentsVisited: "Environnements visités",
    },
    recentActivity: {
      title: "Activité récente",
      completed: "a terminé",
      you: "Vous",
      training: "Formation",
      visit: "Visite",
      noActivity: "Aucune activité récente. Commencez une formation !",
      errorLoading:
        "Une erreur est survenue lors du chargement des données. Veuillez rafraîchir la page.",
    },
  },

  // Page Activité Récente
  recentActivity: {
    pageTitle: "Activité récente",
    subtitle: "Historique complet de vos formations",
    searchPlaceholder: "Rechercher une formation...",
    table: {
      formation: "Formation",
      type: "Type",
      date: "Date",
      actions: "Actions",
    },
    typeLabels: {
      training: "Formation",
      visit: "Visite",
    },
    relaunchButton: "Relancer",
    stats: {
      activitiesSingular: "activité trouvée",
      activitiesPlural: "activités trouvées",
    },
    pagination: {
      page: "Page",
      of: "sur",
      activitiesSingular: "activité",
      activitiesPlural: "activités",
      previous: "Précédent",
      next: "Suivant",
    },
    empty: {
      noResults: "Aucune activité trouvée pour",
      noActivity: "Aucune activité trouvée",
      getStarted: "Commencez des formations pour voir votre activité ici",
    },
    errors: {
      pleaseLogin: "Veuillez vous connecter",
      loadingError: "Erreur lors du chargement de l'activité:",
    },
  },

  // Certifications
  certifications: {
    title: "Mes Certifications",
    subtitle: "Téléchargez les certificats de vos formations terminées",
    searchPlaceholder: "Rechercher une formation...",
    table: {
      formation: "Formation",
      completionDate: "Date",
      actions: "Actions",
      downloadButton: "Télécharger",
      generating: "Génération...",
    },
    stats: {
      availableSingular: "certification disponible",
      availablePlural: "certifications disponibles",
    },
    pagination: {
      previous: "Précédent",
      next: "Suivant",
      page: "Page",
      of: "sur",
    },
    empty: {
      noResults: "Aucune certification trouvée pour",
      noCertifications: "Aucune certification disponible",
      getStarted:
        "Terminez des formations pour obtenir vos premiers certificats",
    },
    errors: {
      organizationMissing: "Informations d'organisation manquantes",
      downloadFailed: "Erreur lors du téléchargement",
    },
    success: {
      downloadComplete: "Certificat téléchargé avec succès !",
    },
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
      subtitle: "Tableau de bord de votre organisation",
    },
    trends: {
      title: "Activité sur 12 mois",
      subtitle: "Évolution mensuelle des formations terminées",
      evolutionLabel: "Évolution sur 3 mois",
      recentTrainings: "formations récentes",
      training: "formation",
      trainings: "formations",
      ofTraining: "de formation",
      noActivity: "Aucune activité",
      noDataMessage: "Aucune formation terminée pour le moment",
      legend: {
        history: "Historique",
        lastThreeMonths: "3 derniers mois",
        currentMonth: "Mois actuel",
      },
      months: {
        jan: "Jan",
        feb: "Fév",
        mar: "Mar",
        apr: "Avr",
        may: "Mai",
        jun: "Juin",
        jul: "Juil",
        aug: "Août",
        sep: "Sep",
        oct: "Oct",
        nov: "Nov",
        dec: "Déc",
      },
    },
  },

  // Sélecteur d'organisation
  organizationSwitcher: {
    personalSpace: "Espace personnel",
    select: "Sélectionner",
    labels: {
      personal: "Personnel",
      organization: "Organisation",
      spaces: "Espaces",
      organizations: "Organisations",
    },
    actions: {
      createOrganization: "Créer une organisation",
      joinOrganization: "Rejoindre une organisation",
    },
  },

  // Dialogue création d'organisation
  createOrganizationDialog: {
    triggerButton: "Nouvelle organisation",
    title: "Créer une organisation",
    description:
      "Les organisations vous permettent de gérer vos équipes et de partager des ressources.",
    fields: {
      name: "Nom de l'organisation",
      namePlaceholder: "Mon organisation",
      description: "Description (optionnelle)",
      descriptionPlaceholder: "Description de votre organisation...",
    },
    buttons: {
      cancel: "Annuler",
      creating: "Création...",
      create: "Créer l'organisation",
    },
  },

  // Dialogue rejoindre organisation
  joinOrganizationDialog: {
    title: "Rejoindre une organisation",
    description: "Entrez le code d'invitation pour rejoindre une organisation.",
    fields: {
      code: "Code d'invitation",
      codePlaceholder: "ABCD1234",
      codeDescription: "Le code contient 8 caractères (lettres et chiffres)",
    },
    buttons: {
      cancel: "Annuler",
      processing: "Traitement...",
      join: "Rejoindre",
    },
    errors: {
      invalidCode: "Code invalide",
      generalError: "Une erreur est survenue",
    },
  },

  // Membres
  members: {
    title: "Membres de l'organisation",
    subtitle: "Gérez les membres et les invitations de votre organisation",
    searchPlaceholder: "Rechercher un membre...",
    you: "(vous)",
    expiresPrefix: "Expire",
    dateUnknown: "Date inconnue",
    invite: {
      button: "Inviter un membre",
      title: "Inviter un membre",
      description:
        "Envoyez une invitation par email pour rejoindre votre organisation. L'invitation expirera dans 7 jours.",
      email: "Email",
      emailPlaceholder: "membre@example.com",
      emailDescription: "L'adresse email de la personne à inviter",
      role: "Rôle",
      rolePlaceholder: "Sélectionner un rôle",
      roleDescription:
        "Les administrateurs peuvent inviter et gérer les membres",
      roles: {
        member: "Membre",
        admin: "Administrateur",
      },
      cancel: "Annuler",
      send: "Envoyer l'invitation",
      sending: "Envoi...",
      errors: {
        invalidEmail: "Email invalide",
        roleRequired: "Veuillez sélectionner un rôle",
      },
    },
    table: {
      member: "Membre",
      email: "Email",
      role: "Rôle",
      status: "Statut",
      memberSince: "Membre depuis",
      actions: "Actions",
      statuses: {
        active: "Actif",
        invited: "Invité",
        pending: "En attente",
        invitationPending: "Invitation en attente",
      },
      roles: {
        owner: "Propriétaire",
        admin: "Administrateur",
        member: "Membre",
      },
      empty: "Aucun membre trouvé",
      loading: "Chargement des membres...",
    },
    stats: {
      memberSingular: "membre trouvé",
      memberPlural: "membres trouvés",
    },
    actions: {
      changeRole: "Changer le rôle",
      promoteAdmin: "Promouvoir admin",
      demoteMember: "Rétrograder membre",
      remove: "Retirer",
      cancelInvitation: "Annuler l'invitation",
    },
    pagination: {
      page: "Page",
      of: "sur",
      previous: "Précédent",
      next: "Suivant",
    },
    empty: {
      noResultsFor: "Aucun membre trouvé pour",
      noMembers: "Aucun membre trouvé",
      inviteMembers: "Invitez des membres pour commencer",
    },
    errors: {
      error: "Erreur :",
    },
  },

  // Paramètres organisation
  organizationSettings: {
    title: "Paramètres de l'organisation",
    subtitle: "Gérez les paramètres et la configuration de",
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
      noActiveTraining: "Aucune formation active",
    },
    ongoingTrainings: {
      title: "Formations en cours",
      subtitle: "Progression globale par formation",
      completed: "Terminée",
      ongoing: "En cours",
      users: "utilisateurs",
      averageProgress: "Progression moyenne",
    },
    recentActivity: {
      title: "Activité récente",
      subtitle: "Dernières progressions des utilisateurs",
      assignButton: "Assigner des formations",
    },
  },

  // Plan de formation
  trainingPlan: {
    title: "Gestion des plans de formations",
    subtitle: "Gérez les formations de vos membres",
    restrictedAccess: {
      title: "Accès restreint",
      message:
        "Seuls les administrateurs et propriétaires peuvent gérer les formations.",
    },
    selectOrganization:
      "Veuillez sélectionner une organisation pour accéder à la gestion des formations.",
    tabs: {
      dashboard: "Tableau de bord",
      plans: "Gérer mes Plans",
      members: "Associer les membres",
      trainings: "Associer les formations",
    },
  },

  // Gestionnaire de plans (Tags Manager)
  tagsManager: {
    title: "Plans de formation disponibles",
    subtitle: "Gérez tous les plans de formation de votre organisation",
    searchPlaceholder: "Rechercher un plan...",
    table: {
      plan: "Plan de formation",
      description: "Description",
      members: "Membres",
      trainings: "Formations",
      dueDate: "Échéance",
      priority: "Priorité",
      created: "Créé",
      actions: "Actions",
      noDescription: "Pas de description",
      noDueDate: "Aucune",
    },
    priorities: {
      high: "Élevée",
      medium: "Moyenne",
      low: "Faible",
    },
    actions: {
      edit: "Modifier",
      delete: "Supprimer",
    },
    empty: {
      noResults: "Aucun plan trouvé pour cette recherche",
      noPlans: "Aucun plan de formation créé",
    },
    deleteDialog: {
      title: "Supprimer ce plan de formation ?",
      description:
        "Cette action est irréversible. Le plan de formation sera supprimé définitivement, ainsi que :",
      consequence1: "Toutes les assignations aux membres",
      consequence2: "Toutes les assignations aux formations",
      consequence3: "Toutes les données de progression associées",
      cancel: "Annuler",
      confirm: "Supprimer",
    },
    errors: {
      loadingError: "Erreur de chargement",
      cannotLoadPlans: "Impossible de charger les plans",
      retry: "Réessayer",
    },
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
        created: "Créée",
      },
      actions: {
        edit: "Modifier",
        contactOwner: "Contact owner",
        delete: "Supprimer",
      },
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
        registered: "Inscrit",
      },
      actions: {
        contact: "Contact",
        delete: "Supprimer",
      },
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
        missing: "Manquantes",
      },
      actions: {
        edit: "Éditer",
      },
    },
  },

  // Formations Unity
  wisetrainer: {
    title: "Formations disponibles",
    subtitle: "Explorez et lancez les modules de formation Unity",
  },

  wisetour: {
    title: "Visites disponibles",
    subtitle:
      "Explorez et lancez les visites d'environnements industriels Unity",
  },

  // Table des Builds (formations/visites)
  buildsTable: {
    searchPlaceholder: "Rechercher une formation...",
    table: {
      formation: "Formation",
      tags: "Tags",
      difficulty: "Difficulté",
      duration: "Durée",
      version: "Version",
      modified: "Modifié",
      actions: "Actions",
    },
    stats: {
      formationSingular: "formation trouvée",
      formationPlural: "formations trouvées",
    },
    buttons: {
      launch: "Lancer formation",
      relaunch: "Relancer formation",
    },
    time: {
      recently: "récemment",
    },
    pagination: {
      page: "Page",
      of: "sur",
      formationSingular: "formation",
      formationPlural: "formations",
      previous: "Précédent",
      next: "Suivant",
    },
    empty: {
      noResults: "Aucune formation trouvée pour",
      noFormations: "Aucune formation trouvée",
      uploadBuilds: "Uploadez des builds Unity dans le dossier correspondant",
      noStarted: "Vous n'avez pas encore commencé de formations",
    },
    errors: {
      loadingError: "Erreur lors du chargement des builds:",
    },
    placeholders: {
      empty: "-",
    },
  },

  completedTrainings: {
    title: "Formations Terminées",
    subtitle:
      "Consultez l'historique de vos formations terminées ({count} formation{s}) et relancez-les si nécessaire",
  },

  myVisits: {
    title: "Mes Visites",
    subtitle: "Gérez et suivez vos visites industrielles en cours",
  },

  // Formations et environnements
  training: {
    title: "Formations & Environnements",
    subtitle: "Accédez à vos formations et environnements 3D",
    wisetrainer: "WiseTrainer",
  },

  // Progression et certifications
  progress: {
    title: "Progression & Certifications",
    subtitle: "Suivez vos avancements et obtenez vos certifications",
    myDashboard: "Mon tableau de bord",
    myCertifications: "Mes certifications",
  },

  // Paramètres
  settings: {
    title: "Paramètres",
    subtitle: "Gérez vos préférences et paramètres de compte",
    profile: {
      title: "Profil",
      subtitle: "Vos informations personnelles",
    },
    appearance: {
      title: "Apparence",
      subtitle: "Personnalisez l'apparence de l'application",
      theme: "Thème",
      light: "Clair",
      dark: "Sombre",
      system: "Système",
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
        error: "Erreur lors du changement de mot de passe",
      },
    },
    dangerZone: {
      title: "Zone dangereuse",
      subtitle: "Actions irréversibles",
      deleteAccount: {
        title: "Supprimer le compte",
        description:
          "Cette action supprimera définitivement votre compte et toutes vos données. Cette action est irréversible.",
        passwordLabel: "Mot de passe pour confirmer",
        passwordPlaceholder: "Entrez votre mot de passe pour confirmer",
        button: "Supprimer mon compte",
        confirmTitle: "Êtes-vous absolument sûr ?",
        confirmDescription:
          "Cette action est irréversible. Cela supprimera définitivement votre compte, toutes vos données et tous les conteneurs Azure associés.",
        cancel: "Annuler",
        confirmButton: "Supprimer définitivement",
        passwordRequired: "Veuillez entrer votre mot de passe pour confirmer",
        success: "Compte supprimé avec succès",
        error: "Erreur lors de la suppression du compte",
      },
    },
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
      resetting: "Réinitialisation en cours...",
    },
  },
} as const;
