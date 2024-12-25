import { CalendarProvider } from "@/components/calendar/calendar-context";
import CalendarGrid from "@/components/calendar/calendar-grid";
import CalendarHeader from "@/components/calendar/calendar-header";

export default function Home() {
    return (
        <>
            <CalendarProvider>
                <CalendarHeader/>
                <CalendarGrid/>
            </CalendarProvider>
        </>
    )
}