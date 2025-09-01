"use client";

import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useState } from "react";

interface ThemeLogoProps {
  size: "small" | "large";
  className?: string;
  variant?: "normal" | "inverted"; // normal = même couleur que le thème, inverted = couleur opposée
}

export function ThemeLogo({ size, className, variant = "inverted" }: ThemeLogoProps) {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Pour éviter l'hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Afficher le logo light par défaut pendant le chargement
    return (
      <Image
        alt="WiseTwin Logo"
        src="/logo_wisetwin_light.svg"
        width={size === "small" ? 10 : 200}
        height={size === "small" ? 10 : 200}
        className={className}
      />
    );
  }

  // Utiliser resolvedTheme pour gérer le thème 'system'
  const currentTheme = resolvedTheme || theme;
  const isDark = currentTheme === 'dark';

  // Logique pour choisir le logo
  let logoSrc: string;
  if (variant === "normal") {
    // Normal: light logo en light mode, dark logo en dark mode
    logoSrc = isDark ? "/logo_wisetwin_dark.svg" : "/logo_wisetwin_light.svg";
  } else {
    // Inverted: dark logo en light mode, light logo en dark mode (pour contraster)
    logoSrc = isDark ? "/logo_wisetwin_light.svg" : "/logo_wisetwin_dark.svg";
  }

  return (
    <Image
      alt="WiseTwin Logo"
      src={logoSrc}
      width={size === "small" ? 10 : 200}
      height={size === "small" ? 10 : 200}
      className={className}
    />
  );
}