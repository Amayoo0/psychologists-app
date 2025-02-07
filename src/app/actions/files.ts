"use server"
import { prisma } from "@/lib/prisma"
import { currentUser } from "@clerk/nextjs/server"
import { PsyFile } from "@prisma/client"
import { promises as fs } from "fs"
import { S3Client, GetObjectCommand, S3, PutObjectCommand, DeleteObjectCommand, waitUntilObjectNotExists } from "@aws-sdk/client-s3";
import { createCipheriv, randomBytes, createDecipheriv } from "crypto"
import { Readable } from "stream";

const s3 = new S3({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
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

export async function getFilesByPatient(patientId: number): Promise<PsyFile[]> {
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
    const files = await prisma.psyFile.findMany({
      where: {
        userId: prismaUser.id,
        patientId: patientId
      }
    })
    return files
  } catch (error) {
    console.error('Error fetching files by patient:', error)
    return []
  }
}

export async function saveFiles(fileList: File[], eventId: string | null, patientId: number): Promise<PsyFile[]> {
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
      console.log("SaveFile.buffer", buffer);

      //Encrypt data
      const algorithm = 'aes-256-cbc';
      const key = randomBytes(32);
      const iv = randomBytes(16);
  
      const cipher = createCipheriv(algorithm, key, iv);
      let encrypted = cipher.update(buffer);
      encrypted = Buffer.concat([encrypted, cipher.final()]);
      console.log("SaveFile.encryptedBuffer", encrypted);
      //End Encrypt

      const params = {
        Bucket: process.env.AWS_BUCKET_NAME ?? '',
        Key: file.name,
        Body: encrypted,
        ContentType: file.type
      };

      console.log("trying to send putobjectcommand")

      try {
          const response = await s3.send(new PutObjectCommand(params));
          console.log("SaveFile.send.response", response);
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
        uploadedAt: new Date(),
        encrypted_key: key,
        encrypted_iv: iv,
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

export async function deleteFiles(fileIds: number[]): Promise<number[]> {
  let deletedFilesIds: number[] = []
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

    for (const fileId of fileIds) {
      const existingFile = await prisma.psyFile.findUnique({
        where: {
          id: fileId
        }
      })

      if (!existingFile || existingFile.userId !== prismaUser.id) {
        continue
      }

      //Delete s3 file
      const command = new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: existingFile.filename,
      });

      await s3.send(command);
      
      await waitUntilObjectNotExists(
        {
          client: s3,
          maxWaitTime: 10
        },
        { 
          Bucket: process.env.AWS_BUCKET_NAME!,
          Key: existingFile.filename 
        },
      );

      //Delete prisma instance
      const result = await prisma.psyFile.delete({
        where: {
          id: fileId
        }
      })
      if (result) deletedFilesIds.push(fileId)

    }

    return deletedFilesIds
  } catch (error) {
    console.error('Error deleting files:', error)
    return []
  }
}

export async function downloadFileFromS3(filename: string, key: string, iv: string) {
  console.log("Downloading: ", filename, key, iv)
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: filename,
    });

    const { Body, ContentType } = await s3.send(command);

    if (!Body || !(Body instanceof Readable)) {
      throw new Error("El archivo no se pudo descargar correctamente");
    }

    // Convertir el stream a un Buffer
    const chunks: Buffer[] = [];
    for await (const chunk of Body) {
      chunks.push(chunk as Buffer);
    }
    const fileBuffer = Buffer.concat(chunks);

    console.log("File Readed from S3: ", fileBuffer)

    const decipher = createDecipheriv("aes-256-cbc", Buffer.from(key, "hex"), Buffer.from(iv, "hex"));
    let decrypted = Buffer.concat([decipher.update(fileBuffer), decipher.final()]);
    console.log("File decrypted: ", decrypted)


    // Convertir a Base64 para enviarlo al frontend
    const fileBase64 = decrypted.toString("base64");

    return {
      success: true,
      fileBase64,
      contentType: ContentType || "application/octet-stream",
      filename,
    };
  } catch (error) {
    console.error("Error descargando archivo de S3:", error);
    return { success: false, error: "Error al descargar el archivo" };
  }
}
