import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      firstName?: string | null
      azureContainerId?: string
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    firstName?: string | null
    azureContainerId?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    firstName?: string | null
    azureContainerId?: string
  }
}