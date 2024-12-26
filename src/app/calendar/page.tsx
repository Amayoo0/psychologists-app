import { CalendarProvider } from "@/components/calendar/calendar-context";
import CalendarGrid from "@/components/calendar/calendar-grid";
import CalendarHeader from "@/components/calendar/calendar-header";
import FloatingActionButton from "@/components/FloatingActionButton";

export default function Home() {
    return (
        <div className="space-y-4">
            <CalendarProvider>
                <CalendarHeader/>
                <CalendarGrid/>
            </CalendarProvider>
            <FloatingActionButton/>
        </div>
    )
}