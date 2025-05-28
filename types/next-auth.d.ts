import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      azureContainerId?: string
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    azureContainerId?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    azureContainerId?: string
  }
}