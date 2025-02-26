"use server"
import { prisma } from '@/lib/prisma'
import { currentUser, User } from '@clerk/nextjs/server'
import { Event } from '@prisma/client'
import { addDays } from 'date-fns'

export async function getEvents(startDate: Date, endDate: Date): Promise<Event[]> {
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
    const events = await prisma.event.findMany({
      where: {

        AND: [
          { userId: prismaUser?.id },
          { startTime: { gte: startDate } },
          { endTime: { lte: endDate } }
        ]
      },
      orderBy: {
        startTime: 'asc'
      }
    })
    return events
  } catch (error) {
    console.error('Error fetching events:', error)
    return []
  }
}

export async function getEventsByPatient(patientId: number): Promise<Event[]> {
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
    const events = await prisma.event.findMany({
      where: {
        AND: [
          { userId: prismaUser.id },
          { patientId: patientId },
        ]
      },
      orderBy: {
        startTime: 'asc'
      }
    })
    return events
  } catch (error) {
    console.error('Error fetching events by patient:', error)
    return []
  }
}

export async function saveEvent(event: Partial<Event>, repeat: string, repetitionCount: number): Promise<Event[]> {
  try {
    const user = await currentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }
    const prismaUser = await prisma.user.findUnique({
      where: {
        authId: user.id
      }
    })
    if (!prismaUser) {
      throw new Error('User not found in database')
    }
    let shiftTimeInDays = 0;
    switch (repeat) {
      case "weekly":
          shiftTimeInDays = 7;
          break
      case "biweekly":
          shiftTimeInDays = 14;
          break
      case "monthly":
          shiftTimeInDays = 30;
          break
      default:
          break
    }
    
    let savedEvents: Event[] = await Promise.all(
      Array.from({ length: repetitionCount }, (_, i) => {
        const startTime = addDays(event.startTime ?? new Date(), shiftTimeInDays * i)
        const endTime = addDays(event.endTime ?? new Date(), shiftTimeInDays * i)
        return prisma.event.create({
          data: {
            title: event.title ? event.title : "",
            type: event.type,
            description: event.description,
            startTime: startTime,
            endTime: endTime,
            sessionUrl: event.sessionUrl,
            patientId: event.patientId ?? 0,
            userId: prismaUser.id
          }
        })
      }
      )
    )
    return savedEvents

  } catch (error) {
    console.error('Error saving events:', error)
    return []
  }
}

export async function deleteEvent(eventId: string): Promise<boolean> {
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

    await prisma.event.delete({
      where: {
        id: eventId,
        userId: prismaUser.id
      }
    })
    return true
  } catch (error) {
    console.error('Error deleting event:', error)
    return false
  }
}

export async function updateEvent(eventId: string, event: Partial<Event>): Promise<Event | null> {
  try {
    const existingEvent = await prisma.event.findUnique({
      where: {
        id: eventId
      }
    })

    if (!existingEvent) {
      return null
    }

    const updatedData = { ...existingEvent, ...event }

    const updatedEvent = await prisma.event.update({
      where: {
        id: eventId
      },
      data: updatedData
    })
    return updatedEvent
  } catch (error) {
    console.error('Error updating event:', error)
    return null
  }
}

export async function getPatientIdBySessionUrl(sessionUrl: string): Promise<number[] | null> {
  try {
    const event = await prisma.event.findMany({
      where: {
        sessionUrl: sessionUrl
      },
      select: {
        patientId: true
      }
    })

    if (!event) {
      return null
    }

    return event.map(e => e.patientId)
  } catch (error) {
    console.error('Error fetching patient ID by session URL:', error)
    return null
  }
}