'use client'
import { ChevronLeft, ChevronRight, Menu } from "lucide-react";
import { useCalendar, ViewType } from "@/components/calendar/calendar-context";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { SettingsDialog } from "@/components/SettingsDialog";


const CalendarHeader = () => {
    const {
        view,
        setView,
        date,
        setDate,
    } = useCalendar()

    const [isConfigOpen, setIsConfigOpen] = useState(false)


    const navigateToday = () => setDate(new Date())
    const navigatePrevious = () => {
        const newDate = new Date(date)
        switch( view ){
            case "week":
                newDate.setDate(date.getDate() - 7)
                break 
            case "month":
                newDate.setMonth(date.getMonth() -1)
                break 
        }
        setDate(newDate)
    }
    const navigateNext = () => {
        const newDate = new Date(date)
        switch( view ){
            case "week":
                newDate.setDate(date.getDate() + 7)
                break 
            case "month":
                newDate.setMonth(date.getMonth() +1)
                break 
        }
        setDate(newDate)
    }

    
    const capitalize = (s: string) => {
        return s.charAt(0).toUpperCase() + s.slice(1);
    };
    

    const formatDate = () => {
        if (view === "week") {
            const weekStart = new Date(date)
            weekStart.setDate(date.getDate() - date.getDay())
            const weekEnd = new Date(weekStart)
            weekEnd.setDate(weekStart.getDate() + 6)

            const formatter = new Intl.DateTimeFormat("es", { month: "short", year: "numeric"})
            const formatterWithoutYear = new Intl.DateTimeFormat("es", { month: "short"})
            if (weekStart.getFullYear() !== weekEnd.getFullYear()){
                return capitalize(formatter.format(weekStart)) + ' - ' + capitalize(formatter.format(weekEnd))
            } else if(weekStart.getMonth() !== weekEnd.getMonth()) {
                return capitalize(formatterWithoutYear.format(weekStart)) + ' - ' + capitalize(formatter.format(weekEnd))
            }
        }
        const genericFormatter = new Intl.DateTimeFormat("es", {
            month: "short",
            year: "numeric",
        })
        return capitalize(genericFormatter.format(date))
    }

    return (
        <div id="calendar-header" className="flex justify-between pb-1 z-40 top-0 pl-6">        
            <div id="calendar-header-navigation" className="flex gap-2 items-center">
                <Button size="icon" variant="outline" onClick={navigateToday}>
                    Hoy
                </Button>
                <Button size="icon" variant="ghost" onClick={navigatePrevious}>
                    <ChevronLeft className="h-4 w-4"/>
                </Button>
                <Button size="icon" variant="ghost" onClick={navigateNext}>
                    <ChevronRight className="h-4 w-4"/>
                </Button>
                <h1 className="text-xl font-semibold">{formatDate()}</h1>
            </div>
            <div id="calendar-header-view-and-settings" className="flex gap-2 items-center pr-2">
                <Select value={view} onValueChange={(value: ViewType) => setView(value)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Elige vista" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="week">Semana</SelectItem>
                        <SelectItem value="month">Mes</SelectItem>
                    </SelectContent>
                </Select>
                <Button size="icon" variant="ghost" onClick={() => setIsConfigOpen(true)}>
                    <Menu className="h-4 w-4"/>
                </Button>
                <SettingsDialog open={isConfigOpen} onOpenChange={setIsConfigOpen} selectedTab="weekly"/>
            </div>
        </div>
    )
}

export default CalendarHeader;