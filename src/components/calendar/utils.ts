import { Event } from '@prisma/client'

export type EventGroup = Event[][];

export type EventMap = Map<String, Event[]>;

export function isMultiDay(event: Event) {
  const startDate = event.startTime.toDateString();
  const endDate = event.endTime.toDateString();
  return startDate !== endDate;
};

export function groupOverlappingEvents(events: Event[] | null, view: string = "month"): EventMap {
  const eventMap: EventMap = new Map();

  if (!events) {
    return eventMap;
  }

  events.forEach((event) => {
    const eventStartDate = new Date(event.startTime);
    const eventEndDate = new Date(event.endTime);

    // Iterate through each day of the event
    for (
        let d = new Date(eventStartDate.getFullYear(), eventStartDate.getMonth(), eventStartDate.getDate()); 
        d <= new Date(eventEndDate.getFullYear(), eventEndDate.getMonth(), eventEndDate.getDate()); 
        d.setDate(d.getDate() + 1)
      ) {
      const dateKey = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toDateString(); // Normalize to date only

      if (!eventMap.has(dateKey)) {
        eventMap.set(dateKey, []);
      }

      eventMap.get(dateKey)?.push(event);
    }
  });

  // Ordenar los eventos dentro de cada grupo
  // eventMap.forEach((group, dateKey) => {
  //   group.sort((a, b) => {
  //     // Los multi-day deben ir primero
  //     if (isMultiDay(a) && !isMultiDay(b)) return -1;
  //     if (!isMultiDay(a) && isMultiDay(b)) return 1;
  //     if (isMultiDay(a) && isMultiDay(b)) return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();

  //     // Si ambos son del mismo tipo, ordenar por hora de inicio
  //     return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
  //   });
  // });
  
  
  // Sort events by start time. Single-day events first
  let blankGap = false;
  eventMap.forEach((group, dateKey) => {
    group.sort((a, b) => {
      // Los single-day deben ir primero
      if (isMultiDay(a) && !isMultiDay(b)) {
        if (blankGap){
          blankGap = false;
          return 1;
        } 
        return -1;
      }
      if (!isMultiDay(a) && isMultiDay(b)) {
        if (blankGap){
          blankGap = false;
          return -1;
        } 
        return 1;
      }
      if (isMultiDay(a) && isMultiDay(b)) {
        console.log("b.endTime.getDate()", b.endTime.getDate());
        console.log("a.endTime.getDate()", a.endTime.getDate());
        if (b.endTime.getDate() < a.endTime.getDate() && b.endTime.getMonth() === a.endTime.getMonth()) {
          console.log("blankGap detected");
          blankGap = true;
        }else{
          console.log("blankGap not detected");
        }

      }

      // Si ambos son del mismo tipo, ordenar por hora de inicio
      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    });
  });
  return eventMap;
}



export function getDayEs(date: Date): number {
    const day = date.getDay();
    // If it's Sunday (0), return 6 (the last day of the week)
    // If it's Monday (1), return 0 (the first day of the week)
    return day === 0 ? 6 : day - 1;
}

export function isToday(date: Date): boolean {
    const today = new Date()
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()
};

export const getMonth = (month: number) => {
  const months = [
    "Ene", "Feb", "Mar", "Abr", "May", "Jun",
    "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
  ];
  return months[month];
}


const timeFormatter = new Intl.DateTimeFormat('es', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: false
});
export function formatTime(date: Date): string {
    const formattedTime = timeFormatter.format(date);
    const minutes = date.getMinutes();
    return minutes !== 0 ? formattedTime : formattedTime.replace(/:\d{2}$/, '');
};

