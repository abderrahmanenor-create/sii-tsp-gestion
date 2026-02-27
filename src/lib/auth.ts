import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { db } from "./db"
import { Role } from "@prisma/client"
import bcrypt from "bcryptjs"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      nom: string
      prenom: string
      role: Role
      photo?: string | null
      equipeId?: string | null
      zoneId?: string | null
    }
  }

  interface User {
    id: string
    email: string
    nom: string
    prenom: string
    role: Role
    photo?: string | null
    equipeId?: string | null
    zoneId?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    email: string
    nom: string
    prenom: string
    role: Role
    photo?: string | null
    equipeId?: string | null
    zoneId?: string | null
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.actif) {
          return null
        }

        const passwordMatch = await bcrypt.compare(credentials.password, user.password)

        if (!passwordMatch) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          nom: user.nom,
          prenom: user.prenom,
          role: user.role,
          photo: user.photo,
          equipeId: user.equipeId,
          zoneId: user.zoneId
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.nom = user.nom
        token.prenom = user.prenom
        token.role = user.role
        token.photo = user.photo
        token.equipeId = user.equipeId
        token.zoneId = user.zoneId
      }
      return token
    },
    async session({ session, token }) {
      session.user = {
        id: token.id,
        email: token.email,
        nom: token.nom,
        prenom: token.prenom,
        role: token.role,
        photo: token.photo,
        equipeId: token.equipeId,
        zoneId: token.zoneId
      }
      return session
    }
  }
}

// Helper to hash passwords
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

// Helper to verify passwords
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}
