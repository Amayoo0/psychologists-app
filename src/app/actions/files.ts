"use server"
import { prisma } from "@/lib/prisma"
import { currentUser } from "@clerk/nextjs/server"
import { PsyFile } from "@prisma/client"
import { join } from "path"
import { promises as fs } from "fs"



export async function getFiles(): Promise<PsyFile[]> {
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
    const files = await prisma.PsyFile.findMany(
      {
        where: {
          userId: prismaUser.id
        }
      }
    )
    return files
  } catch (error) {
    console.error('Error fetching events:', error)
    return []
  }
}

export async function saveFile(filesList: FileList, eventId: string, patientId: number): Promise<PsyFile[]> {
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

    if (!prismaUser) {
      return []
    }

    if (!filesList) {
        console.log('No file to save')
    } else {
        console.log('File to save', filesList)
    }

    const bytes = await Promise.all(Array.from(filesList || []).map(async (f) => {
        return f.arrayBuffer()
    }))

    const buffers = bytes.map((b) => Buffer.from(b))

    const paths = Array.from(filesList || []).map((f) => {
        return join('/', 'files', f.name)
    })
    const savedFiles: PsyFile[] = []
    for (let i = 0; i < paths.length; i++) {
        console.log('writing file', paths[i])
        await fs.writeFile(paths[i], buffers[i])
        const file: Partial<PsyFile> = {
            filename: filesList?.[i].name,
            url: paths[i],
            eventId: eventId,
            patientId: patientId,
            userId: prismaUser.id
        }
        console.log('saving file', file)
        const result = await prisma.PsyFile.create({data: file})
        savedFiles.push(result)
    }

    return savedFiles
  } catch (error) {
    console.error('Error fetching events:', error)
    return []
  }
}
