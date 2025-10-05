import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

// Clé secrète pour signer les tokens (devrait être dans les variables d'environnement)
const JWT_SECRET = process.env.UNITY_JWT_SECRET || "unity-token-secret-change-me";

/**
 * Payload du token Unity
 */
export interface UnityTokenPayload {
  userId: string;
  containerId: string;
  buildName: string;
  buildType: string;
  organizationId?: string;
  iat?: number;
  exp?: number;
}

/**
 * Génère un token JWT pour Unity contenant les informations utilisateur
 */
export function generateUnityToken(payload: Omit<UnityTokenPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '24h', // Token valide 24h
  });
}

/**
 * Vérifie et décode un token Unity
 */
export function verifyUnityToken(token: string): UnityTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UnityTokenPayload;
    return decoded;
  } catch (error) {
    console.error("Invalid Unity token:", error);
    return null;
  }
}

/**
 * Valide que le token correspond bien à l'utilisateur et au container
 */
export async function validateUnityToken(token: string): Promise<{
  valid: boolean;
  userId?: string;
  organizationId?: string;
  error?: string;
}> {
  const payload = verifyUnityToken(token);

  if (!payload) {
    return { valid: false, error: "Token invalide ou expiré" };
  }

  // Vérifier que l'utilisateur existe
  const user = await prisma.user.findUnique({
    where: { id: payload.userId }
  });

  if (!user) {
    return { valid: false, error: "Utilisateur non trouvé" };
  }

  // Vérifier l'accès au container
  if (payload.containerId.startsWith("personal-")) {
    // Container personnel
    if (user.azureContainerId !== payload.containerId) {
      return { valid: false, error: "Accès non autorisé au container personnel" };
    }
    return { valid: true, userId: user.id };
  } else {
    // Container d'organisation
    const org = await prisma.organization.findFirst({
      where: { azureContainerId: payload.containerId }
    });

    if (!org) {
      return { valid: false, error: "Organisation non trouvée" };
    }

    // Vérifier que l'utilisateur est membre de l'organisation
    const membership = await prisma.organizationMember.findFirst({
      where: {
        userId: user.id,
        organizationId: org.id
      }
    });

    if (!membership && org.ownerId !== user.id) {
      return { valid: false, error: "Non membre de l'organisation" };
    }

    return { valid: true, userId: user.id, organizationId: org.id };
  }
}