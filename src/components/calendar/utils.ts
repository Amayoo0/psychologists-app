import { Event } from '@prisma/client'

type EventGroup = Event[][];

export function groupOverlappingEvents(events: Event[]): EventGroup {
    // Sort events by start date to facilitate grouping
    const sortedEvents = [...events].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  
    const groups: EventGroup = [];
  
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