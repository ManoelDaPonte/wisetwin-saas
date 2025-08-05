import { NextResponse } from "next/server";
import { withSuperAdmin, SuperAdminRequest } from "@/lib/admin/auth";
import { getAllOrganizations } from "@/lib/admin/organizations";

export const GET = withSuperAdmin(async (req: SuperAdminRequest) => {
  try {
    const organizations = await getAllOrganizations();
    
    return NextResponse.json({ 
      organizations,
      total: organizations.length,
      requestedBy: req.user.email 
    });
  } catch (error) {
    console.error("Erreur récupération organisations admin:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des organisations" },
      { status: 500 }
    );
  }
});