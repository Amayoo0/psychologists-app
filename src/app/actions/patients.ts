"use server"
import { prisma } from '@/lib/prisma'
import { currentUser, User } from '@clerk/nextjs/server'
export async function getPatients() {
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
    const patients = await prisma.patient.findMany({
      where: {
        userId: prismaUser?.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return patients
  } catch (error) {
    console.error('Error fetching patients:', error)
    return []
  }
}

export async function getPatientById(patientId: number) {
  try {
    const patient = await prisma.patient.findUnique({
      where: {
        id: patientId
      }
    })

    return patient
  } catch (error) {
    console.error('Error fetching patient:', error)
    return null
  }
}
