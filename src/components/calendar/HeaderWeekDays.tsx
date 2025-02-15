import { cn } from "@/lib/utils"
import { getDayEs, isToday } from "@/components/calendar/utils"

const HeaderWeekDays = ({
    showWeekends,
    days,
    isMobile,
}: {showWeekends: boolean, days: Date[], isMobile: boolean}) => {
    return (
        <div className={`grid flex-1 ${isMobile ? 'pr-[4px]': 'pr-[15px]'}`} style={{ gridTemplateColumns: `repeat(${showWeekends ? 7 : 5}, 1fr)` }}>
        {days.map((day, i) => (
            (!showWeekends && [5, 6].includes(getDayEs(day))) ? null : (
            <div key={i} className={`border-r border-l border-2 border-gray-400 border-strong-color text-center py-2 ${i === 0 ? 'rounded-l-lg' : i === days.length - 1 || !showWeekends && i === 4? 'rounded-r-lg' : ''}`}>
                <div className="text-sm">
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