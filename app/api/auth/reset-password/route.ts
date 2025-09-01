import { NextResponse } from "next/server";
import { resetPasswordSchema, isPasswordStrong } from "@/validators";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Valider les données avec Zod
    const validationResult = resetPasswordSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: "Données invalides",
          errors: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { token, password } = validationResult.data;

    // Additional business logic validation
    if (!isPasswordStrong(password)) {
      return NextResponse.json(
        {
          message:
            "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre",
        },
        { status: 400 }
      );
    }

    // Vérifier le token de réinitialisation
    const resetRequest = await prisma.passwordReset.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetRequest) {
      return NextResponse.json(
        { message: "Token invalide ou expiré" },
        { status: 400 }
      );
    }

    // Vérifier si le token n'est pas expiré
    if (resetRequest.expiresAt < new Date()) {
      // Supprimer le token expiré
      await prisma.passwordReset.delete({
        where: { id: resetRequest.id },
      });
      
      return NextResponse.json(
        { message: "Token expiré. Veuillez faire une nouvelle demande." },
        { status: 400 }
      );
    }

    // Vérifier si le token n'a pas déjà été utilisé
    if (resetRequest.used) {
      return NextResponse.json(
        { message: "Token déjà utilisé" },
        { status: 400 }
      );
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await hash(password, 12);

    // Mettre à jour le mot de passe de l'utilisateur
    await prisma.user.update({
      where: { id: resetRequest.userId },
      data: { password: hashedPassword },
    });

    // Marquer le token comme utilisé
    await prisma.passwordReset.update({
      where: { id: resetRequest.id },
      data: { used: true },
    });

    return NextResponse.json(
      { message: "Mot de passe réinitialisé avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { message: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}