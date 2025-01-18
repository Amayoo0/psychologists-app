"use server"
import { prisma } from "@/lib/prisma"
import { currentUser } from "@clerk/nextjs/server"
import { PsyFile } from "@prisma/client"
import { dirname, join } from "path"
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
    if (!prismaUser) {
        return []
    }
    const files = await prisma.psyFile.findMany(
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

export async function getFilesByEvent(eventId: string | null): Promise<PsyFile[]> {
  try {
    if (!eventId) return []

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
    const files = await prisma.psyFile.findMany({
      where: {
        userId: prismaUser.id,
        eventId: eventId
      }
    })
    return files
  } catch (error) {
    console.error('Error fetching files by event:', error)
    return []
  }
}

export async function saveFiles(fileList: File[], eventId: string, patientId: number): Promise<PsyFile[]> {
  const savedFiles: PsyFile[] = []
  try {
    const user = await currentUser()
    if (!user) {
      alert('saveFiles.!user.return[]')
      return []
    }
    const prismaUser = await prisma.user.findUnique({
      where: {
        authId: user.id
      }
    })

    if (!prismaUser) {
      alert('saveFiles.!prismaUser.return[]')
      return []
    }

    console.log("action.file.saveFiles.filelist: ", fileList)

    for (const file of fileList) {
      if (!file) {
        console.log('No file to save')
        continue
      } else {
        console.log('File to save', file)
      }

      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const path = join('/', 'files', eventId, file.name)

      console.log('writing file', path)
      const dir = dirname(path);
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(path, buffer)
      const fileToSave: Omit<PsyFile, 'id'> = {
        filename: file.name,
        url: path,
        eventId: eventId,
        patientId: patientId,
        userId: prismaUser.id,
        uploadedAt: new Date()
      }
      console.log('saving file', file)
      const savedFile = await prisma.psyFile.create({ data: fileToSave })
      savedFiles.push(savedFile)
    }

    return savedFiles
  } catch (error) {
    console.error('Error saving files:', error)
    return []
  }
}

export async function deleteFiles(fileIds: number[]): Promise<boolean> {
  try {
    const user = await currentUser()
    if (!user) {
      return false
    }
    const prismaUser = await prisma.user.findUnique({
      where: {
        authId: user.id
      }
    })

    if (!prismaUser) {
      return false
    }

    for (const fileId of fileIds) {
      const existingFile = await prisma.psyFile.findUnique({
        where: {
          id: fileId
        }
      })

      if (!existingFile || existingFile.userId !== prismaUser.id) {
        continue
      }

      try {
        await fs.unlink(existingFile.url)
      } catch (error) {
        continue
      }

      await prisma.psyFile.delete({
        where: {
          id: fileId
        }
      })
    }

    return true
  } catch (error) {
    console.error('Error deleting files:', error)
    return false
  }
}
