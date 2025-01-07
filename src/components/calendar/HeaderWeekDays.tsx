import { cn } from "@/lib/utils"
import { getDayEs, isToday } from "./utils"

const HeaderWeekDays = ({
    showWeekends,
    days,
}: {showWeekends: boolean, days: Date[]}) => {
    return (
        <div className="grid flex-1 pr-[14px]" style={{ gridTemplateColumns: `repeat(${showWeekends ? 7 : 5}, 1fr)` }}>
        {days.map((day, i) => (
            (!showWeekends && [5, 6].includes(getDayEs(day))) ? null : (
            <div key={i} className="border-r border-l text-center py-2">
                <div className="text-sm text-muted-foreground">
                    {new Intl.DateTimeFormat("es", { weekday: "short" }).format(day).toUpperCase()}
                </div>
                <div className={cn(
                    "mt-1 w-8 h-8 rounded-full flex items-center justify-center mx-auto text-sm",
                    isToday(day) && "bg-blue-600 text-white"
                )}>
                    {day.getDate()}
                </div>
            </div>
            )
        ))}
        </div>
    )
}

export default HeaderWeekDays;