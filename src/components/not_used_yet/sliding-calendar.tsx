'use client'

import * as React from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { es } from 'date-fns/locale'

interface Event {
  time: string
  title: string
  details: string
}

interface DayEvents {
  date: Date
  events: Event[]
}

// Example events data
const EVENTS: DayEvents[] = [
  {
    date: new Date(2024, 11, 27),
    events: [
      {
        time: '9:30',
        title: 'F2G - Daily meeting',
        details: 'Microsoft Teams Meeting'
      }
    ]
  },
  {
    date: new Date(2024, 11, 28),
    events: [
      {
        time: '9:30',
        title: 'F2G - Daily meeting',
        details: 'Microsoft Teams Meeting'
      },
      {
        time: '11:30',
        title: 'Sprint Retrospective',
        details: 'Microsoft Teams Meeting'
      }
    ]
  }
]

export function SlidingCalendar() {
  const [date, setDate] = React.useState<Date>(new Date())
  const [isOpen, setIsOpen] = React.useState(false)

  const todayEvents = EVENTS.find(
    dayEvent => dayEvent.date.toDateString() === new Date().toDateString()
  )?.events || []

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="fixed right-4 top-4">
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-bold">
              {date.toLocaleDateString('es', { month: 'long', year: 'numeric' })}
            </SheetTitle>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Calendar
            mode="single"
            selected={date}
            onSelect={(newDate) => newDate && setDate(newDate)}
            className="rounded-md border"
            locale={es}
            weekStartsOn={1}
          />
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Today</h3>
            {todayEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                You have nothing else scheduled today.
              </p>
            ) : (
              <div className="space-y-4">
                {todayEvents.map((event, index) => (
                  <EventCard key={index} event={event} />
                ))}
              </div>
            )}
          </div>

          {EVENTS.map((dayEvent, index) => (
            <div key={index}>
              <h3 className="font-semibold mb-2">
                {dayEvent.date.toLocaleDateString('es', { weekday: 'long' })}
              </h3>
              <div className="space-y-4">
                {dayEvent.events.map((event, eventIndex) => (
                  <EventCard key={eventIndex} event={event} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}

function EventCard({ event }: { event: Event }) {
  return (
    <div className="flex gap-4">
      <div className="w-12 text-sm text-muted-foreground">{event.time}</div>
      <div className="flex-1 border-l-2 border-blue-500 pl-4">
        <div className="font-medium">{event.title}</div>
        <div className="text-sm text-muted-foreground">{event.details}</div>
      </div>
    </div>
  )
}

