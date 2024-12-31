'use server'
import { getEventsByDateRange } from '@/app/actions/events'
import { currentUser } from '@clerk/nextjs/server'

export async function getEvents(startDate: Date, endDate: Date) {
  return getEventsByDateRange(startDate, endDate)
}


