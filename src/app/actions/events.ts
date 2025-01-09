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
      Array.from({ length: repetitionCount }, (_, i) => 
        prisma.event.create({
          data: {
            title: event.title ? event.title : "",
            type: event.type,
            description: event.description,
            startTime: addDays(event.startTime ?? new Date(), shiftTimeInDays * i),
            endTime: addDays(event.endTime ?? new Date(), shiftTimeInDays * i),
            sessionUrl: event.sessionUrl,
            patientId: event.patientId ?? 0,
            userId: prismaUser.id
          }
        })
      )
    )
    console.log('savedEvents[]: ', savedEvents)
    return savedEvents

  } catch (error) {
    console.error('Error saving events:', error)
    return []
  }
}

export async function deleteEvent(event: Event): Promise<boolean> {
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
        id: event.id,
        userId: prismaUser.id
      }
    })
    return true
  } catch (error) {
    console.error('Error deleting event:', error)
    return false
  }
}
