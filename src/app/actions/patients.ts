"use server"
import { prisma } from '@/lib/prisma'
import { currentUser, User } from '@clerk/nextjs/server'
import { Patient } from '@prisma/client'
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

export async function savePatient(patient: Partial<Patient>) {
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

    const savedPatient = await prisma.patient.create({
      data: {
        name: patient.name ?? '',
        initials: patient.initials ?? '',
        email: patient.email ?? null,
        phone: patient.phone ?? null,
        lastSession: patient.lastSession,

        userId: prismaUser?.id
      }
    })

    return savedPatient
  } catch (error) {
    console.error('Error saving patient:', error)
    return null
  }
}

export async function updatePatient(patientId: number, patientData: Partial<Patient>) : Promise<Patient | null> {
  try {
    const existingPatient = await prisma.patient.findUnique({
      where: {
      id: patientId
      }
    })

    if (!existingPatient) {
      return null
    }

    const updatedData = { ...existingPatient, ...patientData }

    const updatedPatient: Patient = await prisma.patient.update({
      where: {
      id: patientId
      },
      data: updatedData
    })

    return updatedPatient
  } catch (error) {
    console.error('Error updating patient:', error)
    return null
  }
}
