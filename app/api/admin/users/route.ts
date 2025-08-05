import { NextResponse } from "next/server";
import { withSuperAdmin, SuperAdminRequest } from "@/lib/admin/auth";
import { getAllUsers } from "@/lib/admin/users";

export const GET = withSuperAdmin(async (req: SuperAdminRequest) => {
  try {
    const users = await getAllUsers();
    
    return NextResponse.json({ 
      users,
      total: users.length,
      requestedBy: req.user.email 
    });
  } catch (error) {
    console.error("Erreur récupération utilisateurs admin:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des utilisateurs" },
      { status: 500 }
    );
  }
});