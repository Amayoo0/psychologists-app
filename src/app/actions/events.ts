"use server"
import { EventData } from '@/components/EventDialog'
import { prisma } from '@/lib/prisma'
import { currentUser, User } from '@clerk/nextjs/server'
import { Event } from '@prisma/client'
import { addDays } from 'date-fns'

export async function getEvents(startDate: Date, endDate: Date) {
  try {
    console.log('user', await currentUser())
    console.log('user is commented in so all events are shown')
    // if (!user) {
    //   return []
    // }
    // const prismaUser = await prisma.user.findUnique({
    //     where: {
    //         authId: user.id
    //     }
    // })
    const events = await prisma.event.findMany({
      where: {

        AND: [
          // { userId: prismaUser?.id },
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

export async function saveEvent(event: EventData, repeat: string, repetitionCount: number): Promise<Event[]> {
  try {
    // const user = await currentUser()
    // if (!user) {
    //   throw new Error('User not authenticated')
    // }
    // const prismaUser = await prisma.user.findUnique({
    //   where: {
    //     authId: user.id
    //   }
    // })
    // if (!prismaUser) {
    //   throw new Error('User not found in database')
    // }
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
            startTime: addDays(event.startTime, shiftTimeInDays * i),
            endTime: addDays(event.endTime, shiftTimeInDays * i),
            sessionUrl: event.sessionUrl,
            patientId: event.patientId,
            // userId: prismaUser.Id   // TODO: change this when user fix comes
            userId: 1,
          }
        })
      )
    )
    return savedEvents

  } catch (error) {
    console.error('Error saving events:', error)
    return []
  }
}
