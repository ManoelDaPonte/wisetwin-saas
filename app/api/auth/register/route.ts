import { NextResponse } from "next/server";
import { registerSchema, isPasswordStrong } from "@/app/validators";
import { prisma } from "@/lib/prisma";
import { createUserContainer } from "@/lib/azure";
import { hash } from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Valider les données avec Zod
    const validationResult = registerSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: "Données invalides",
          errors: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { name, email, password } = validationResult.data;

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

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Un compte existe déjà avec cet email" },
        { status: 400 }
      );
    }

    // Hasher le mot de passe
    const hashedPassword = await hash(password, 12);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Créer le container Azure personnel
    try {
      const containerId = await createUserContainer(user.email, user.id);
      await prisma.user.update({
        where: { id: user.id },
        data: { azureContainerId: containerId },
      });
    } catch (azureError) {
      console.error("Failed to create Azure container:", azureError);
      // On continue quand même, le container pourra être créé plus tard
    }

    return NextResponse.json(
      { message: "Compte créé avec succès" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}
