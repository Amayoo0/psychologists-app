"use server"
import { prisma } from "@/lib/prisma"
import { currentUser } from "@clerk/nextjs/server"
import { PsyFile } from "@prisma/client"
import { promises as fs } from "fs"
import { S3Client, GetObjectCommand, S3, PutObjectCommand, DeleteObjectCommand, waitUntilObjectNotExists } from "@aws-sdk/client-s3";
import { createCipheriv, randomBytes, createDecipheriv } from "crypto"
import { Readable } from "stream";

const s3 = new S3({
  region: process.env.NEXT_PUBLIC_AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION,
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
    let files = await prisma.psyFile.findMany(
      {
        where: {
          userId: prismaUser.id
        }
      }
    )

    files.forEach(file => {
      file.filename = file.filename.split('}')[1]
    });

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
    let files = await prisma.psyFile.findMany({
      where: {
        userId: prismaUser.id,
        eventId: eventId
      }
    })

    files.forEach(file => {
      file.filename = file.filename.split('}')[1]
    });

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
    let files = await prisma.psyFile.findMany({
      where: {
        userId: prismaUser.id,
        patientId: patientId
      }
    })
    
    files.forEach(file => {
      file.filename = file.filename.split('}')[1]
    });

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

    for (const file of fileList) {
      if (!file) {
        continue
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      //Encrypt data
      const algorithm = 'aes-256-cbc';
      const key = randomBytes(32);
      const iv = randomBytes(16);
  
      const cipher = createCipheriv(algorithm, key, iv);
      let encrypted = cipher.update(buffer);
      encrypted = Buffer.concat([encrypted, cipher.final()]);
      //End Encrypt

      const filename = eventId ? `{${patientId}-${eventId}}${file.name}` : `{${patientId}}${file.name}`

      const params = {
        Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME ?? '',
        Key: filename,
        Body: encrypted,
        ContentType: file.type
      };


      try {
          const response = await s3.send(new PutObjectCommand(params));
      } catch (err) {
          console.error(err);
      }
      const fileToSave: Omit<PsyFile, 'id'> = {
        filename: filename,
        url: 'psycho-app',
        eventId: eventId,
        patientId: patientId,
        userId: prismaUser.id,
        uploadedAt: new Date(),
        encrypted_key: key,
        encrypted_iv: iv,
      }

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
    const filesToDelete = await prisma.psyFile.findMany({
      where: {
        id: {
          in: fileIds
        }
      }
    });
    
    for (const file of filesToDelete) {
      if (file.userId !== prismaUser.id) {
        continue
      }
      const command = new DeleteObjectCommand({
        Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME!,
        Key: file.filename,
      });

      await s3.send(command);
      
      await waitUntilObjectNotExists(
        {
          client: s3,
          maxWaitTime: 10
        },
        { 
          Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME!, 
          Key: file.filename 
        },
      );

      const result = await prisma.psyFile.delete({
        where: {
          id: file.id
        }
      })
      if (result) deletedFilesIds.push(file.id)
    }

    return deletedFilesIds
  } catch (error) {
    console.error('Error deleting files:', error)
    return []
  }
}

export async function downloadFileFromS3(fileId: number, keyBuffer: Buffer, ivBuffer: Buffer) {
  try {
    const file = await prisma.psyFile.findUnique({
      where: {
        id: fileId
      }
    });
    if (!file) {
      return { success: false, error: "Archivo no encontrado" };
    }

    const command = new GetObjectCommand({
      Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME!,
      Key: file.filename,
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


    const decipher = createDecipheriv("aes-256-cbc", keyBuffer, ivBuffer);
    let decrypted = Buffer.concat([decipher.update(fileBuffer), decipher.final()]);


    // Convertir a Base64 para enviarlo al frontend
    const fileBase64 = decrypted.toString("base64");

    return {
      success: true,
      fileBase64: fileBase64,
      contentType: ContentType || "application/octet-stream",
      filename: file.filename.split('}')[1],
    };
  } catch (error) {
    console.error("Error descargando archivo de S3:", error);
    return { success: false, error: "Error al descargar el archivo" };
  }
}
