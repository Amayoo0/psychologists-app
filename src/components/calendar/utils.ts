import { Event } from '@prisma/client'

export type EventGroup = Event[][];

export type EventMap = Map<string, Event[]>;

export function isMultiDay(event: Event) {
  const startDate = event.startTime.toDateString();
  const endDate = event.endTime.toDateString();
  return startDate !== endDate;
};

/**
 * Applies prioritization of a single-day event in each array of events,
 * according to the information in the `priorityDays` map.
 *
 * @param eventsMap A Map with string keys (Date.toDateString()) and Event[] values
 * @param priorityDays A Map where the key is the day from which to start prioritization
 *                     and the value is the number of days (including that day) that should have prioritization.
 *
 * The idea is that for each day that is within a prioritization window,
 * the first single-day event (i.e., for which isMultiDay is false) is found
 * and reordered to be at the head of the array.
 */
export function applyPrioritization(
  eventsMap: Map<string, Event[]>,
  priorityDays: Map<string, number>
): Map<string, Event[]> {
  // Iterate through each day (key and array of events)
  for (const [dateStr, events] of eventsMap.entries()) {
    const currentDay = new Date(dateStr);
    let shouldPrioritize = false;

    // Check if the current day is within any prioritization window
    for (const [startStr, daysCount] of priorityDays.entries()) {
      const startDay = new Date(startStr);
      const endDay = new Date(startStr);
      // The window is from [startDay, startDay + (daysCount - 1) days]
      endDay.setDate(endDay.getDate() + daysCount - 1);
      if (currentDay >= startDay && currentDay <= endDay) {
        shouldPrioritize = true;
        break;
      }
    }

    // If this day should have prioritization…
    if (shouldPrioritize) {
      // Find the first event that is single-day (isMultiDay === false)
      const indexSingleDay = events.findIndex(event => !isMultiDay(event));
      if (indexSingleDay !== -1) {
        // Remove the event from its current position
        const [prioritizedEvent] = events.splice(indexSingleDay, 1);
        // And insert it at the beginning of the array
        events.unshift(prioritizedEvent);
      }
      // If there are no single-day events, leave the array unchanged
    }
  }
  return eventsMap;
}

export function applyMultiplePrioritization(
  eventsMap: Map<string, Event[]>,
  priorityDays: Map<string, Set<number>>
): Map<string, Event[]> {
  console.log("applyMultiplePrioritization.eventMap", eventsMap)
  console.log("applyMultiplePrioritization.priorityDays", priorityDays)
  // Recorremos cada grupo (fecha) en el eventsMap
  for (const [dateKey, events] of eventsMap.entries()) {
    // Si no hay prioridades definidas para este día, lo dejamos como está
    if (!priorityDays.has(dateKey)) continue;
    
    // Obtenemos las posiciones prioritarias (huecos) ordenadas de menor a mayor
    const priorityPositions = Array.from(priorityDays.get(dateKey)!).sort((a, b) => a - b);
    
    // Para cada posición prioritaria, intentamos colocar un single-day event
    for (const pos of priorityPositions) {
      // Solo actuamos si la posición está dentro del array
      if (pos < events.length) {
        // Si ya hay un evento single-day en esa posición, no hacemos nada
        if (!isMultiDay(events[pos])) continue;
        
        // Buscamos, a partir de pos+1, el primer evento single-day
        let candidateIndex = -1;
        for (let j = pos + 1; j < events.length; j++) {
          if (!isMultiDay(events[j])) {
            candidateIndex = j;
            break;
          }
        }
        
        // Si encontramos un candidato, lo movemos a la posición prioritaria
        if (candidateIndex !== -1) {
          const [candidate] = events.splice(candidateIndex, 1);
          events.splice(pos, 0, candidate);
        }
      }
    }
    
    // El array "events" ya quedó modificado en su orden para esta fecha
  }
  console.log("applyMultiplesPriorization.eventMap", eventsMap)
  return eventsMap;
}



export function groupOverlappingEvents(events: Event[] | null, view: string = "month"): EventMap {
  let eventMap: EventMap = new Map();

  if (!events) {
    return eventMap;
  }

  events.forEach((event) =>   {
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
  
  // Sort events by start time. Multi-day events first
  eventMap.forEach((group) => {
    group.sort((a, b) => {
      if (isMultiDay(a) && !isMultiDay(b)) return -1;
      if (!isMultiDay(a) && isMultiDay(b)) return 1;
      if (isMultiDay(a) && isMultiDay(b) && a.startTime.toDateString() === b.startTime.toDateString()) return new Date(b.endTime).getTime() - new Date(a.endTime).getTime()
      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    });
  });

  let groupThatAllowPriorization: Map<string, Set<number>> = new Map()
  eventMap.forEach((group) => {
    const multiDayEvents = group.filter(event => isMultiDay(event));
    for (let i = 0; i < multiDayEvents.length; i++){
      for (let j = i; j < multiDayEvents.length; j++){
        const a = new Date(multiDayEvents[i].endTime.toDateString())
        const b = new Date(multiDayEvents[j].endTime.toDateString())

        let diffEnds: number = Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
        if (diffEnds < 0){
          // The second event ends before the first one. Not interested in this case.
          continue
        }
        // Adds priorization in next days starting at the end of a
        let dayToPrior = new Date(a)
        dayToPrior.setDate(dayToPrior.getDate() + 1);
        while( diffEnds > 0 && getDayEs(dayToPrior) > 0 ){
          if (!groupThatAllowPriorization.has(dayToPrior.toDateString())) {
            groupThatAllowPriorization.set(dayToPrior.toDateString(), new Set<number>());
          }
          groupThatAllowPriorization.get(dayToPrior.toDateString())?.add(i)
          diffEnds--;
          dayToPrior.setDate(dayToPrior.getDate() + 1);
        }
      } 
    }
  });
  console.log("groupThatAllowPriorization23:",groupThatAllowPriorization)
  eventMap = applyMultiplePrioritization(eventMap, groupThatAllowPriorization);
  console.log("EventMap", eventMap);
  return eventMap;
}

export function groupOverlappingEventsWeek(events: Event[] | null): EventGroup {
  // Sort events by start date to facilitate grouping
  const groups: EventGroup = [];
  
  if (!events) return groups;
  
  const sortedEvents = [...events].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  // Function to check if two events overlap
  const doEventsOverlap = (e1: Event, e2: Event): boolean => {
    return (
      e1.startTime < e2.endTime && // e1 starts before e2 ends
      e1.endTime > e2.startTime // e1 ends after e2 starts
    );
  };

  // Iterate over events and group overlapping ones
  sortedEvents.forEach((event) => {
    let addedToGroup = false;

    // Try to add the event to an existing group
    for (const group of groups) {
      if (group.some((e) => doEventsOverlap(e, event))) {
        group.push(event);
        addedToGroup = true;
        break;
      }
    }

    // If it couldn't be added to any group, create a new one
    if (!addedToGroup) {
      groups.push([event]);
    }
  });

  return groups;
};



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

