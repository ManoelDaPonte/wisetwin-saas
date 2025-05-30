import { useState } from "react"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"

interface UpdateUserData {
  name: string
}

interface ChangePasswordData {
  currentPassword: string
  newPassword: string
}

interface DeleteAccountData {
  password: string
}

export function useUserActions() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const updateUser = async (data: UpdateUserData) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Erreur lors de la mise à jour")
      }

      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : "Une erreur est survenue"
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const changePassword = async (data: ChangePasswordData) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch("/api/user/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Erreur lors du changement de mot de passe")
      }

      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : "Une erreur est survenue"
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const deleteAccount = async (data: DeleteAccountData) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch("/api/user/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Erreur lors de la suppression du compte")
      }

      // Déconnexion et redirection après suppression réussie
      await signOut({ redirect: false })
      router.push("/login")
      
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : "Une erreur est survenue"
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    updateUser,
    changePassword,
    deleteAccount,
    isLoading,
    error,
    setError,
  }
}