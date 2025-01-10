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

export async function saveFile(file: File, eventId: string, patientId: number): Promise<PsyFile | null> {
  try {
    const user = await currentUser()
    if (!user) {
      return null
    }
    const prismaUser = await prisma.user.findUnique({
        where: {
            authId: user.id
        }
    })

    if (!prismaUser) {
      return null
    }

    if (!file) {
        console.log('No file to save')
        return null
    } else {
        console.log('File to save', file)
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const path = join('/', 'files', file.name)
  
    console.log('writing file', path)
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
    const savedFile = await prisma.psyFile.create({data: fileToSave})

    return savedFile
  } catch (error) {
    console.error('Error fetching events:', error)
    return null
  }
}


export async function updateFile(fileId: number, updatedFile: File): Promise<PsyFile | null> {
  try {
    const user = await currentUser()
    if (!user) {
      return null
    }
    const prismaUser = await prisma.user.findUnique({
      where: {
        authId: user.id
      }
    })

    if (!prismaUser) {
      return null
    }

    const existingFile = await prisma.psyFile.findUnique({
      where: {
        id: fileId
      }
    })

    if (!existingFile || existingFile.userId !== prismaUser.id) {
      return null
    }

    const bytes = await updatedFile.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const path = join('/', 'files', updatedFile.name)

    await fs.writeFile(path, buffer)

    const updatedFileData: Omit<PsyFile, 'id'> = {
      filename: updatedFile.name,
      url: path,
      eventId: existingFile.eventId,
      patientId: existingFile.patientId,
      userId: prismaUser.id,
      uploadedAt: new Date()
    }

    const result = await prisma.psyFile.update({
      where: {
        id: fileId
      },
      data: updatedFileData
    })

    return result
  } catch (error) {
    console.error('Error updating file:', error)
    return null
  }
}
