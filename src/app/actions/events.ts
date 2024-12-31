import { prisma } from '@/lib/prisma'
import { currentUser, User } from '@clerk/nextjs/server'
export async function getEventsByDateRange(startDate: Date, endDate: Date) {
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

// 'use server'

// import { prisma } from '@/lib/prisma'
// import { auth } from '@/lib/auth' // Asumiendo que usas NextAuth o similar

// export async function getEventsByDateRange(startDate: Date, endDate: Date) {
//   try {
//     const session = await auth()
    
//     if (!session?.user?.id) {
//       throw new Error('No autorizado')
//     }

//     const events = await prisma.event.findMany({
//       where: {
//         AND: [
//           { startTime: { gte: startDate } },
//           { endTime: { lte: endDate } },
//           { userId: session.user.id }
//         ]
//       },
//       orderBy: {
//         startTime: 'asc'
//       }
//     })
    
//     return events
//   } catch (error) {
//     console.error('Error fetching events:', error)
//     return []
//   }
// }

