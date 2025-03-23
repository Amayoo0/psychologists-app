import CalendarGrid from "@/components/calendar/calendar-grid";
import CalendarHeader from "@/components/calendar/calendar-header";
import FloatingActionButton from "@/components/FloatingActionButton";
import AppLayout from "../AppLayout";
import InternalPasswordCheck from "@/components/InternalPasswordCheck";

export default function Home() {
    return (
        <AppLayout>
            <CalendarHeader/>
            <CalendarGrid/>
            <FloatingActionButton/>
            <InternalPasswordCheck />
        </AppLayout>
    )
}