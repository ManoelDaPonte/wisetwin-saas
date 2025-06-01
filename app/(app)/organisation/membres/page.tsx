"use client"

import { useOrganizationStore } from "@/app/stores/organization-store"
import { useMembers } from "@/app/(app)/organisation/hooks/use-members"
import { MembersTable } from "./components/members-table"
import { InviteMemberDialog } from "./components/invite-member-dialog"

export default function MembersPage() {
  const { activeOrganization } = useOrganizationStore()

  const {
    members,
    invitations,
    isLoading,
    error,
    fetchMembers,
    inviteMember,
    updateMemberRole,
    removeMember,
    cancelInvitation,
    isUpdating,
    isRemoving,
    isCancelling,
  } = useMembers()

  const canInvite = activeOrganization?.role === "OWNER" || activeOrganization?.role === "ADMIN"

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Membres</h1>
          <p className="text-muted-foreground">
            Gérez les membres et leurs permissions dans {activeOrganization?.name}
          </p>
        </div>
        {canInvite && <InviteMemberDialog />}
      </div>

      <MembersTable
        members={members}
        invitations={invitations}
        isLoading={isLoading}
        error={error}
        onUpdateRole={updateMemberRole}
        onRemoveMember={removeMember}
        onCancelInvitation={cancelInvitation}
        isUpdating={isUpdating}
        isRemoving={isRemoving}
        isCancelling={isCancelling}
      />
    </div>
  )
}