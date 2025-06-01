import { LoginForm } from "@/app/(auth)/components/login-form"
import { Suspense } from "react"

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <LoginForm />
    </Suspense>
  )
} 