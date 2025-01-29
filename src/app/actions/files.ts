"use server"
import { prisma } from "@/lib/prisma"
import { currentUser } from "@clerk/nextjs/server"
import { PsyFile } from "@prisma/client"
import { promises as fs } from "fs"
import { S3 } from "aws-sdk"

const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'eu-north-1',
});

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

    for (const file of fileList) {
      if (!file) {
        console.log('No file to save')
        continue
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const params = {
        Bucket: 'spycho-app-bucket',
        Key: file.name,
        Body: buffer,
        ContentType: file.type
      };

      try {
          const upload = s3.upload(params);
          upload.on('httpUploadProgress', (p) => {
              console.log(p.loaded / p.total);
          });
          await upload.promise();
          console.log(`File uploaded successfully: ${file.name}`);
      } catch (err) {
          console.error(err);
      }

      const fileToSave: Omit<PsyFile, 'id'> = {
        filename: file.name,
        url: 'psycho-app-bucket',
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
