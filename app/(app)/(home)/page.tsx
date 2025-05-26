import { getServerSession } from "next-auth"

export default async function HomePage() {
  const session = await getServerSession()

  return (
    <></>
  )
} 