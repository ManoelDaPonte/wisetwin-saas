"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useOrganizationStore, useIsPersonalSpace } from "@/app/stores/organization-store"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { 
  MoreHorizontal, 
  UserPlus, 
  Shield, 
  UserMinus,
  Mail,
  Search,
} from "lucide-react"

// Mock data pour les membres
const mockMembers = [
  {
    id: "1",
    name: "Jean Dupont",
    email: "jean.dupont@example.com",
    role: "owner",
    avatar: "/avatars/01.png",
    joinedAt: "2024-01-15",
  },
  {
    id: "2",
    name: "Marie Martin",
    email: "marie.martin@example.com",
    role: "admin",
    avatar: "/avatars/02.png",
    joinedAt: "2024-02-20",
  },
  {
    id: "3",
    name: "Pierre Bernard",
    email: "pierre.bernard@example.com",
    role: "member",
    avatar: "/avatars/03.png",
    joinedAt: "2024-03-10",
  },
  {
    id: "4",
    name: "Sophie Leblanc",
    email: "sophie.leblanc@example.com",
    role: "member",
    avatar: "/avatars/04.png",
    joinedAt: "2024-03-15",
  },
]

const roleLabels = {
  owner: { label: "Propriétaire", variant: "default" as const },
  admin: { label: "Administrateur", variant: "secondary" as const },
  member: { label: "Membre", variant: "outline" as const },
}

export default function MembersPage() {
  const { activeOrganization } = useOrganizationStore()
  const isPersonalSpace = useIsPersonalSpace()
  const router = useRouter()
  
  useEffect(() => {
    if (isPersonalSpace) {
      router.push('/accueil')
    }
  }, [isPersonalSpace, router])
  
  if (!activeOrganization) {
    return null
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Membres de l'organisation</h1>
        <p className="text-muted-foreground">
          Gérez les membres et leurs permissions dans {activeOrganization.name}
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Membres ({mockMembers.length})</CardTitle>
              <CardDescription>
                Invitez et gérez les membres de votre organisation
              </CardDescription>
            </div>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Inviter un membre
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Barre de recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Rechercher par nom ou email..." 
                className="pl-10"
              />
            </div>

            {/* Liste des membres */}
            <div className="space-y-2">
              {mockMembers.map((member) => (
                <div 
                  key={member.id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback>
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Badge variant={roleLabels[member.role as keyof typeof roleLabels].variant}>
                      {roleLabels[member.role as keyof typeof roleLabels].label}
                    </Badge>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Mail className="h-4 w-4 mr-2" />
                          Envoyer un email
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Shield className="h-4 w-4 mr-2" />
                          Modifier le rôle
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <UserMinus className="h-4 w-4 mr-2" />
                          Retirer de l'organisation
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section invitations en attente */}
      <Card>
        <CardHeader>
          <CardTitle>Invitations en attente</CardTitle>
          <CardDescription>
            Les invitations expirent après 7 jours
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucune invitation en attente</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}