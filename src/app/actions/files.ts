"use server"
import { prisma } from "@/lib/prisma"
import { currentUser } from "@clerk/nextjs/server"
import { File } from "@prisma/client"



export async function getFiles(): Promise<File[]> {
  try {
    const user = await currentUser()
    if (!user) {
      return []
    }
    const prismaUser = await prisma.user.findUnique({
        where: {
            authId: user.id
        }
    })
    console.warn("gettings all files withouth filtering by user")
    const files = await prisma.file.findMany()
    return files
  } catch (error) {
    console.error('Error fetching events:', error)
    return []
  }
}