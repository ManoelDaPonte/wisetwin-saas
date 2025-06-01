"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { MoreHorizontal, Shield, ShieldCheck, UserMinus, UserX } from "lucide-react"
import { Member, Invitation } from "@/app/(app)/organisation/hooks/use-members"
import { useSession } from "next-auth/react"
import { useOrganizationStore } from "@/app/stores/organization-store"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

interface MembersTableProps {
  members: Member[]
  invitations: Invitation[]
  isLoading: boolean
  error: string | null
  onUpdateRole: (memberId: string, role: "ADMIN" | "MEMBER") => void
  onRemoveMember: (memberId: string) => void
  onCancelInvitation: (invitationId: string) => void
  isUpdating?: boolean
  isRemoving?: boolean
  isCancelling?: boolean
}

export function MembersTable({
  members,
  invitations,
  isLoading,
  error,
  onUpdateRole,
  onRemoveMember,
  onCancelInvitation,
  isUpdating,
  isRemoving,
  isCancelling,
}: MembersTableProps) {
  const { data: session } = useSession()
  const { activeOrganization } = useOrganizationStore()
  const currentUserRole = activeOrganization?.role

  const canManageMembers = currentUserRole === "OWNER" || currentUserRole === "ADMIN"

  if (isLoading) {
    return <MembersTableSkeleton />
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            Erreur : {error}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Membres de l'organisation</CardTitle>
        <CardDescription>
          Gérez les membres et les invitations de votre organisation
        </CardDescription>
      </CardHeader>
      <CardContent>
        {members.length === 0 && invitations.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Aucun membre dans cette organisation
          </p>
        ) : (
          <div className="space-y-4">
            {/* Liste des membres */}
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={member.avatarUrl || undefined} />
                    <AvatarFallback>
                      {member.name?.[0]?.toUpperCase() || member.email[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {member.name || member.email}
                      {member.id === session?.user?.id && (
                        <span className="text-muted-foreground ml-2">(vous)</span>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                    {member.joinedAt && (
                      <p className="text-xs text-muted-foreground">
                        Membre depuis {formatDistanceToNow(new Date(member.joinedAt), { 
                          addSuffix: true, 
                          locale: fr 
                        })}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <RoleBadge role={member.role} />
                  {canManageMembers && !member.isOwner && member.id !== session?.user?.id && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={isUpdating || isRemoving}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {member.role !== "ADMIN" && (
                          <DropdownMenuItem onClick={() => onUpdateRole(member.id, "ADMIN")}>
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            Promouvoir admin
                          </DropdownMenuItem>
                        )}
                        {member.role === "ADMIN" && (
                          <DropdownMenuItem onClick={() => onUpdateRole(member.id, "MEMBER")}>
                            <Shield className="mr-2 h-4 w-4" />
                            Rétrograder membre
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onRemoveMember(member.id)}
                          className="text-destructive"
                        >
                          <UserMinus className="mr-2 h-4 w-4" />
                          Retirer de l'organisation
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            ))}

            {/* Liste des invitations en attente */}
            {invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex items-center justify-between p-4 rounded-lg border border-dashed opacity-60"
              >
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarFallback>
                      {invitation.email[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{invitation.email}</p>
                    <p className="text-sm text-muted-foreground">
                      Invitation en attente • Expire {formatDistanceToNow(new Date(invitation.expiresAt), { 
                        addSuffix: true, 
                        locale: fr 
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <RoleBadge role={invitation.role} />
                  <Badge variant="secondary">En attente</Badge>
                  {canManageMembers && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onCancelInvitation(invitation.id)}
                      disabled={isCancelling}
                    >
                      <UserX className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function RoleBadge({ role }: { role: "OWNER" | "ADMIN" | "MEMBER" }) {
  const variants = {
    OWNER: { label: "Propriétaire", variant: "default" as const },
    ADMIN: { label: "Admin", variant: "secondary" as const },
    MEMBER: { label: "Membre", variant: "outline" as const },
  }

  const { label, variant } = variants[role]

  return <Badge variant={variant}>{label}</Badge>
}

function MembersTableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64 mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48 mt-2" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}