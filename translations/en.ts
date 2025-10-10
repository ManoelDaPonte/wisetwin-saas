export const en = {
  // Navigation et interface générale
  home: {
    welcome: "Hello",
    subtitle: "Welcome to Wise Twin, your immersive training platform.",
    signature: "Safety • Training • Immersion • Excellence",
    onboarding: {
      title: "Start your journey",
      step1: "Join or create",
      step1Desc: "Join an existing organization or create your own",
      step2: "Explore trainings",
      step2Desc: "Discover available WiseTrainer modules",
      step3: "Track your progress",
      step3Desc: "View your statistics and certifications",
    },
    concepts: {
      title: "How Wise Twin works ?",
      multitenant: {
        title: "Multi-organization system",
        description:
          "Work in your personal space or join multiple organizations",
        detail1: "Each organization has its own isolated data",
        detail2: "Invite and manage your team members",
        detail3: "Switch between multiple organizations easily",
      },
      spaces: {
        title: "Workspaces",
        description: "Easily switch between your different work contexts",
        detail1: "Personal space for your individual trainings",
        detail2: "Organization spaces for team collaboration",
        detail3: "Permissions adapted to your role",
      },
      trainings: {
        title: "Immersive training",
        description: "Access 3D Unity simulations for your learning",
        detail1: "Interactive 3D simulations with Unity WebGL",
        detail2: "Real-time progress tracking",
        detail3: "Certifications upon training completion",
      },
    },
    contextualMessages: {
      newUser: "Welcome to Wise Twin! Let's start by setting up your space",
      personalSpace: "You are in your personal space",
      organizationSpace: "You are working in organization",
    },
    quickActions: {
      title: "Quick actions",
      personalDescription: "Manage your personal space and trainings",
      orgDescription: "Actions available in",
      manageOrganizations: "Manage your organizations",
      viewOrganizations: "View my organizations",
      orgManagement: "Organization management",
      administerOrg: "Administer",
      trainingPlans: "Training plans",
      settings: "Settings",
      orgTrainings: "Organization trainings",
      accessResources: "Access shared resources",
      availableTrainings: "Available trainings",
      myProgress: "My progress",
      trackProgress: "Track your personal progress",
    },
    personalSpace: {
      title: "Your personal space",
      description:
        "This space is available by default to allow you to freely test the platform features and discover our demos before any commercial commitment.",
      invitation: {
        title: "Received an invitation?",
        description:
          "Join your organization by entering the invitation code provided by your administrator.",
        cta: "Join with a code",
      },
      create: {
        title: "Create your organization",
        description:
          "Create your own workspace to manage your teams and trainings.",
        cta: "Create an organization",
      },
      discover: {
        title: "Simply explore",
        description:
          "Take advantage of your personal space to explore our demos and freely test the platform before any commercial commitment.",
        cta: "Contact us",
        contactSubject: "Commercial information request",
        contactBody:
          "Hello,\n\nI am currently discovering Wise Twin and would like to get more information about your immersive training solutions.\n\nBest regards,",
      },
    },
    faq: {
      title: "Frequently asked questions",
      subtitle: "Quickly find answers to your questions",
      questions: {
        password: {
          question: "How do I change my password?",
          answer:
            "You can change your password in your account settings. Click the link below to access it directly.",
          linkText: "Go to settings",
        },
        organization: {
          question: "How do I join or create an organization?",
          answer:
            "To join an organization, you need an invitation code provided by an administrator. To create your own organization, go to the Organization section.",
          linkText: "Manage my organizations",
        },
        trainings: {
          question: "Where can I find available trainings?",
          answer:
            "All WiseTrainer trainings are accessible from the trainings page. You will find all modules available for your current space.",
          linkText: "View trainings",
        },
        certification: {
          question: "How do I get my certifications?",
          answer:
            "Once a training is completed, your certificate is automatically generated. You can download it from your certifications dashboard.",
          linkText: "My certifications",
        },
        switching: {
          question:
            "How do I switch between my personal space and my organizations?",
          answer:
            "Use the organization selector in the sidebar (top left). You can easily switch between your personal space and your different organizations. You will be automatically redirected to the home page when switching.",
        },
      },
    },
    contact: {
      title: "Need help?",
      description:
        "Our team is here to support you. Choose the type of request that best fits your needs.",
      commercial: {
        title: "Sales inquiries",
        description: "For any information request, demonstration or quote",
        cta: "Contact sales team",
      },
      support: {
        title: "Technical support",
        description: "For any technical question or issue encountered",
        cta: "Contact support",
      },
      emailSubject: "Commercial information request",
      emailBody:
        "Hello,\n\nI would like to get more information about your solutions.\n\nBest regards,",
      supportSubject: "Technical support request",
      supportBody:
        "Hello,\n\nI am experiencing a technical issue and would need assistance.\n\nProblem description:\n\n\nBest regards,",
    },
  },

  // Navigation sidebar
  navigation: {
    // Labels des sections
    personal: "Personal",
    application: "Applications",
    organization: "Organization",
    superAdmin: "Super Admin",

    // Section Personal
    home: "Home",
    myDashboard: "My Dashboard",
    myActivity: "My Activity",
    myCertifications: "My Certifications",

    // Section Application
    wisetrainer: "WiseTrainer",
    wisetour: "Wisetour",

    // Section Organization
    organizationOverview: "My organization",
    members: "Members",
    trainingPlans: "Training Plans",
    analytics: "Analytics",
    settings: "Settings",

    // Section Super Admin
    trainingCatalog: "Training Catalog",
    allUsers: "All Users",
    allOrganizations: "All Organizations",

    // Anciens (pour compatibilité - non utilisés dans sidebar)
    overview: "Overview",
    certifications: "Certifications",
    trainingPlan: "Training Plan",
    allTrainings: "All Trainings",
    completedTrainings: "Completed Trainings",
    virtualVisits: "Virtual Visits",
    formations: "Trainings",
    users: "Users",
    organizations: "Organizations",
    myVisits: "My Visits",
  },

  // Authentication
  auth: {
    login: {
      title: "Sign in to your account",
      subtitle: "Enter your email to sign in to your account",
      email: "Email",
      password: "Password",
      emailPlaceholder: "example@email.com",
      forgotPassword: "Forgot password?",
      loginButton: "Sign in",
      loginInProgress: "Signing in...",
      noAccount: "Don't have an account?",
      signUp: "Sign up",
      invitationMessage:
        "Sign in to accept your invitation to join an organization.",
      errors: {
        invalidCredentials: "Invalid email or password",
        generalError: "An error occurred. Please try again.",
      },
    },
    register: {
      title: "Create account",
      subtitle: "Fill in the information below to create your account",
      firstName: "First name",
      firstNamePlaceholder: "John",
      lastName: "Last name",
      lastNamePlaceholder: "Doe",
      email: "Email",
      emailPlaceholder: "example@email.com",
      password: "Password",
      confirmPassword: "Confirm password",
      createButton: "Create account",
      creatingInProgress: "Creating account...",
      hasAccount: "Already have an account?",
      signIn: "Sign in",
      errors: {
        passwordMismatch: "Passwords do not match",
        generalError: "An error occurred. Please try again.",
      },
    },
    forgotPassword: {
      title: "Forgot password",
      subtitle: "Enter your email address to receive a reset link",
      email: "Email",
      emailPlaceholder: "example@email.com",
      sendButton: "Send reset link",
      sendingInProgress: "Sending...",
      rememberPassword: "Remember your password?",
      backToLogin: "Sign in",
      success: {
        title: "Email sent",
        message:
          "If your email address is in our system, you will receive a reset link in a few minutes.",
        backToLogin: "Back to sign in",
      },
    },
    resetPassword: {
      title: "New password",
      subtitle: "Enter your new password",
      newPassword: "New password",
      confirmPassword: "Confirm password",
      resetButton: "Reset password",
      resettingInProgress: "Resetting password...",
      backToLogin: "Back to sign in",
      success: {
        title: "Password reset",
        message:
          "Your password has been reset successfully. You will be redirected to the sign in page.",
        loginNow: "Sign in now",
      },
      errors: {
        invalidLink: {
          title: "Invalid link",
          message: "The reset link is invalid or missing.",
          requestNew: "Request new link",
        },
        missingToken: "Missing token. Please use the link received by email.",
        passwordMismatch: "Passwords do not match",
      },
    },
  },

  // Dashboard
  dashboard: {
    title: "Dashboard",
    noSession: "Please sign in to access your dashboard.",
    wisetrainer: {
      title: "WiseTrainer (Training)",
      completedTrainings: "Completed trainings",
    },
    wisetour: {
      title: "Wisetour (Visits)",
      environmentsVisited: "Environments visited",
    },
    recentActivity: {
      title: "Recent activity",
      completed: "completed",
      you: "You",
      training: "Training",
      visit: "Visit",
      noActivity: "No recent activity. Start a training!",
      errorLoading:
        "An error occurred while loading data. Please refresh the page.",
    },
  },

  // Certifications
  certifications: {
    title: "My Certifications",
    subtitle: "Download certificates for your completed trainings",
    searchPlaceholder: "Search for a training...",
    table: {
      formation: "Training",
      completionDate: "Completion date",
      actions: "Actions",
      downloadButton: "Download",
      generating: "Generating...",
    },
    stats: {
      availableSingular: "certification available",
      availablePlural: "certifications available",
    },
    pagination: {
      previous: "Previous",
      next: "Next",
      page: "Page",
      of: "of",
    },
    empty: {
      noResults: "No certification found for",
      noCertifications: "No certifications available",
      getStarted: "Complete trainings to get your first certificates",
    },
    errors: {
      organizationMissing: "Organization information missing",
      downloadFailed: "Download error",
    },
    success: {
      downloadComplete: "Certificate downloaded successfully!",
    },
  },

  // Organization
  organization: {
    title: "Organization",
    joinWithCode: "Join with a code",
    createOrganization: "Create an organization",
    manageMembers: "Manage members",
    dashboard: "Dashboard",
    joinOrCreate: "Join an organization or create your own",
    manage: "Manage",
    overview: {
      title: "Overview",
      subtitle: "Your organization dashboard",
    },
  },

  // Members
  members: {
    title: "Members",
    subtitle: "Manage members and their permissions in",
    invite: {
      button: "Invite member",
      title: "Invite member",
      description:
        "Send an email invitation to join your organization. The invitation will expire in 7 days.",
      email: "Email",
      emailPlaceholder: "member@example.com",
      emailDescription: "The email address of the person to invite",
      role: "Role",
      rolePlaceholder: "Select a role",
      roleDescription: "Administrators can invite and manage members",
      roles: {
        member: "Member",
        admin: "Administrator",
      },
      cancel: "Cancel",
      send: "Send invitation",
      sending: "Sending...",
      errors: {
        invalidEmail: "Invalid email",
        roleRequired: "Please select a role",
      },
    },
    table: {
      name: "Name",
      email: "Email",
      role: "Role",
      status: "Status",
      joinedAt: "Joined",
      actions: "Actions",
      statuses: {
        active: "Active",
        invited: "Invited",
        pending: "Pending",
      },
      roles: {
        owner: "Owner",
        admin: "Administrator",
        member: "Member",
      },
      empty: "No members found",
      loading: "Loading members...",
    },
    actions: {
      changeRole: "Change role",
      remove: "Remove",
      cancelInvitation: "Cancel invitation",
    },
  },

  // Organization settings
  organizationSettings: {
    title: "Organization settings",
    subtitle: "Manage settings and configuration of",
  },

  // Training dashboard
  trainingDashboard: {
    title: "Training dashboard",
    subtitle: "Track your teams' training progress",
    stats: {
      activeUsers: "Active users",
      activeTrainings: "Active trainings",
      completionRate: "Completion rate",
      averageTime: "Average time",
      perTraining: "Per training",
      noData: "No data available",
      noActiveTraining: "No active training",
    },
    ongoingTrainings: {
      title: "Ongoing trainings",
      subtitle: "Global progress per training",
      completed: "Completed",
      ongoing: "Ongoing",
      users: "users",
      averageProgress: "Average progress",
    },
    recentActivity: {
      title: "Recent activity",
      subtitle: "Latest user progress",
      assignButton: "Assign trainings",
    },
  },

  // Training plan
  trainingPlan: {
    title: "Training plans management",
    subtitle: "Manage your members' trainings",
    restrictedAccess: {
      title: "Restricted access",
      message: "Only administrators and owners can manage trainings.",
    },
    selectOrganization:
      "Please select an organization to access training management.",
    tabs: {
      dashboard: "Dashboard",
      plans: "Manage my trainings plans",
      members: "Link members",
      trainings: "Link trainings",
    },
  },

  // Administration
  admin: {
    organizations: {
      title: "All organizations",
      subtitle: "Supervise and manage organizations and their members",
      searchPlaceholder: "Search for an organization...",
      emptyMessage: "No organization found",
      table: {
        organization: "Organization",
        owner: "Owner",
        noName: "No name",
        members: "Members",
        trainings: "Trainings",
        invitations: "Invitations",
        containerId: "Container ID",
        created: "Created",
      },
      actions: {
        edit: "Edit",
        contactOwner: "Contact owner",
        delete: "Delete",
      },
    },
    users: {
      title: "All users",
      subtitle: "Manage and supervise user accounts on the platform",
      searchPlaceholder: "Search for a user...",
      emptyMessage: "No user found",
      table: {
        user: "User",
        emailVerified: "Email verified",
        verified: "Verified",
        notVerified: "Not verified",
        organizations: "Organizations",
        followedTrainings: "Followed trainings",
        container: "Container",
        created: "Created",
        none: "None",
        registered: "Registered",
      },
      actions: {
        contact: "Contact",
        delete: "Delete",
      },
    },
    trainings: {
      title: "All trainings",
      subtitle: "Manage metadata and configurations for Unity trainings",
      searchPlaceholder: "Search for a training...",
      emptyMessage: "No training found",
      table: {
        formation: "Training",
        type: "Type",
        container: "Container",
        organization: "Organization",
        lastModified: "Last modified",
        unknown: "Unknown",
        metadata: "Metadata",
        present: "Present",
        missing: "Missing",
      },
      actions: {
        edit: "Edit",
      },
    },
  },

  // Unity trainings
  wisetrainer: {
    title: "Available trainings",
    subtitle: "Explore and launch Unity training modules",
  },

  wisetour: {
    title: "Available visits",
    subtitle: "Explore and launch Unity industrial environment visits",
  },

  completedTrainings: {
    title: "Completed Trainings",
    subtitle:
      "View your completed trainings history ({count} training{s}) and restart them if needed",
  },

  myVisits: {
    title: "My Visits",
    subtitle: "Manage and track your ongoing industrial visits",
  },

  // Training & environments
  training: {
    title: "Training & Environments",
    subtitle: "Access your training programs and 3D environments",
    wisetrainer: "WiseTrainer",
  },

  // Progress & certifications
  progress: {
    title: "Progress & Certifications",
    subtitle: "Track your progress and earn your certifications",
    myDashboard: "My dashboard",
    myCertifications: "My certifications",
  },

  // Settings
  settings: {
    title: "Settings",
    subtitle: "Manage your preferences and account settings",
    profile: {
      title: "Profile",
      subtitle: "Your personal information",
    },
    appearance: {
      title: "Appearance",
      subtitle: "Customize the application's appearance",
      theme: "Theme",
      light: "Light",
      dark: "Dark",
      system: "System",
    },
    account: {
      title: "Account",
      subtitle: "Manage your account information",
      firstName: "First name",
      firstNamePlaceholder: "Your first name",
      name: "Name",
      namePlaceholder: "Your name",
      save: "Save",
      updateSuccess: "Information updated successfully",
      updateError: "Error updating information",
      changePassword: {
        title: "Change password",
        current: "Current password",
        currentPlaceholder: "Enter your current password",
        new: "New password",
        newPlaceholder: "Enter your new password",
        confirm: "Confirm new password",
        confirmPlaceholder: "Confirm your new password",
        button: "Change password",
        success: "Password changed successfully",
        error: "Error changing password",
      },
    },
    dangerZone: {
      title: "Danger zone",
      subtitle: "Irreversible actions",
      deleteAccount: {
        title: "Delete account",
        description:
          "This action will permanently delete your account and all your data. This action is irreversible.",
        passwordLabel: "Password to confirm",
        passwordPlaceholder: "Enter your password to confirm",
        button: "Delete my account",
        confirmTitle: "Are you absolutely sure?",
        confirmDescription:
          "This action is irreversible. This will permanently delete your account, all your data and all associated Azure containers.",
        cancel: "Cancel",
        confirmButton: "Delete permanently",
        passwordRequired: "Please enter your password to confirm",
        success: "Account deleted successfully",
        error: "Error deleting account",
      },
    },
  },

  // Commons
  common: {
    user: "User",
    loading: "Loading...",
    loadingStates: {
      generating: "Generating...",
      creating: "Creating...",
      sending: "Sending...",
      connecting: "Connecting...",
      resetting: "Resetting...",
    },
  },
} as const;
