"use server"
import { prisma } from '@/lib/prisma'
import { currentUser, User } from '@clerk/nextjs/server'
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

export async function saveEvents(events: any[]) {
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
    const savedEvents = await prisma.$transaction(
      events.map(event => 
        prisma.event.create({
          data: {
            ...event,
            // userId: prismaUser.id
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