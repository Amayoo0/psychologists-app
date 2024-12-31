import { CalendarProvider } from "@/components/calendar/calendar-context";
import CalendarGrid from "@/components/calendar/calendar-grid";
import CalendarHeader from "@/components/calendar/calendar-header";
import FloatingActionButton from "@/components/FloatingActionButton";
import AppLayout from "../AppLayout";

export default function Home() {
    return (
        <AppLayout>
            <div className="">
                <CalendarProvider>
                    <div>
                        <CalendarHeader/>
                    </div>
                    <div className="">
                        <CalendarGrid/>
                    </div>
                </CalendarProvider>
                <FloatingActionButton/>
            </div>
        </AppLayout>
    )
}