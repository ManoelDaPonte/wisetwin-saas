"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { UserPlus } from "lucide-react"
import { useMembers } from "@/app/(app)/organisation/hooks/use-members"
import { useTranslations } from "@/hooks/use-translations"

// Schema will use translations at runtime
const createInviteSchema = (t: ReturnType<typeof useTranslations>) => z.object({
  email: z.string().email(t.members.invite.errors.invalidEmail),
  role: z.enum(["ADMIN", "MEMBER"], {
    required_error: t.members.invite.errors.roleRequired,
  }),
})

type InviteFormValues = z.infer<ReturnType<typeof createInviteSchema>>

interface InviteMemberDialogProps {
  children?: React.ReactNode
}

export function InviteMemberDialog({ children }: InviteMemberDialogProps) {
  const t = useTranslations();
  const [open, setOpen] = useState(false)
  const { inviteMember, isInviting } = useMembers()
  
  const inviteSchema = createInviteSchema(t)

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: "",
      role: "MEMBER",
    },
  })

  async function onSubmit(data: InviteFormValues) {
    try {
      await inviteMember(data.email, data.role)
      setOpen(false)
      form.reset()
    } catch {
      // L'erreur est déjà gérée par le hook
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            {t.members.invite.button}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t.members.invite.title}</DialogTitle>
          <DialogDescription>
            {t.members.invite.description}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.members.invite.email}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t.members.invite.emailPlaceholder}
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {t.members.invite.emailDescription}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.members.invite.role}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t.members.invite.rolePlaceholder} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="MEMBER">{t.members.invite.roles.member}</SelectItem>
                      <SelectItem value="ADMIN">{t.members.invite.roles.admin}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {t.members.invite.roleDescription}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                {t.members.invite.cancel}
              </Button>
              <Button type="submit" disabled={isInviting}>
                {isInviting ? t.members.invite.sending : t.members.invite.send}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}