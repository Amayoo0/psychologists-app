import { Event } from '@prisma/client'

export type EventGroup = Event[][];

export type ExtendedEvent = Event & {isHidden: boolean};

export type EventMap = Map<string, ExtendedEvent[]>;

export function isMultiDay(event: Event) {
	const startDate = event.startTime.toDateString();
	const endDate = event.endTime.toDateString();
	return startDate !== endDate;
};

export function applyMultiplePrioritization(
	eventsMap: Map<string, ExtendedEvent[]>,
	priorityDays: Map<string, Set<number>>
): Map<string, ExtendedEvent[]> {
	// Iterate through each group (date) in the eventsMap
	for (const [dateKey, events] of eventsMap.entries()) {
	// If there are no priorities defined for this day, leave it as is
	if (!priorityDays.has(dateKey)) continue;
	
	// Get the priority positions (slots) sorted in ascending order
	const priorityPositions = Array.from(priorityDays.get(dateKey)!).sort((a, b) => a - b);
	
	// For each priority position, try to place a single-day event
	for (const pos of priorityPositions) {
		// Only act if the position is within the array
		if (pos < events.length) {
		// If there is already a single-day event in that position, do nothing
		if (!isMultiDay(events[pos])) continue;
		
		// Search, starting from pos+1, for the first single-day event
		let candidateIndex = -1;
		for (let j = pos + 1; j < events.length; j++) {
			if (!isMultiDay(events[j]) || (isMultiDay(events[j]) && events[j].startTime.toDateString() === dateKey)) {
				candidateIndex = j;
				break;
			}
		}
		
			// If a candidate is found, move it to the priority position
			if (candidateIndex !== -1) {
				const [candidate] = events.splice(candidateIndex, 1);
				events.splice(pos, 0, candidate);
			}
		}
	}
	
	// The "events" array has already been modified in its order for this date
	}
	return eventsMap;
}



export function groupOverlappingEvents(events: ExtendedEvent[] | null): EventMap {
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

  const groupThatAllowPriorization: Map<string, Set<number>> = new Map()
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
        const dayToPrior = new Date(a)
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
  eventMap = applyMultiplePrioritization(eventMap, groupThatAllowPriorization);
  return eventMap;
}

export function groupOverlappingEventsWeek(events: Event[] | null): EventGroup {
  // Sort events by start date to facilitate grouping
  const groups: EventGroup = [];
  
  if (!events) return groups;
  
  const sortedEvents = events.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

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

