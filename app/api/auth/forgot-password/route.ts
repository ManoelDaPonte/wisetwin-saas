import { NextResponse } from "next/server";
import { forgotPasswordSchema } from "@/validators";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email-service";
import { randomBytes } from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Valider les données avec Zod
    const validationResult = forgotPasswordSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: "Email invalide",
          errors: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email } = validationResult.data;

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Pour des raisons de sécurité, on retourne toujours le même message
      return NextResponse.json(
        {
          message: "Si cet email existe, vous recevrez un lien de réinitialisation",
        },
        { status: 200 }
      );
    }

    // Supprimer les anciens tokens de réinitialisation pour cet utilisateur
    await prisma.passwordReset.deleteMany({
      where: { userId: user.id },
    });

    // Créer un nouveau token de réinitialisation
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 heure

    await prisma.passwordReset.create({
      data: {
        email,
        token,
        userId: user.id,
        expiresAt,
      },
    });

    // Envoyer l'email de réinitialisation
    try {
      await sendPasswordResetEmail(email, token, user.firstName);
    } catch (emailError) {
      console.error("Failed to send password reset email:", emailError);
      return NextResponse.json(
        {
          message: "Erreur lors de l'envoi de l'email. Veuillez réessayer.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Si cet email existe, vous recevrez un lien de réinitialisation",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { message: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}