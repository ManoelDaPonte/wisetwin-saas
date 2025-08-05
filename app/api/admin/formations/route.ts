import { NextResponse } from "next/server";
import { withSuperAdmin, SuperAdminRequest } from "@/lib/admin/auth";
import { getAllFormations } from "@/lib/admin/formations";

export const GET = withSuperAdmin(async (req: SuperAdminRequest) => {
  try {
    const formations = await getAllFormations();
    
    return NextResponse.json({ 
      formations,
      total: formations.length,
      requestedBy: req.user.email 
    });
  } catch (error) {
    console.error("Erreur récupération formations admin:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des formations" },
      { status: 500 }
    );
  }
});