import { Separator } from "../ui/separator"
import { getDayEs } from "./utils"


const TimeMarker = ({
    showWeekends, 
    cellSize
} : {showWeekends: boolean, cellSize: number}) => {
    const now = new Date()
    if (!showWeekends && getDayEs(now) > 4) return null
    return (
        <div 
        id="time-marker" 
        className="absolute left-0 right-0 z-40"
        style={{
            top: `${((now.getHours() + now.getMinutes() / 60)-0.09) * cellSize}px`,
            left: `${getDayEs(now) * (100 / (showWeekends ? 7 : 5))}%`,
            width: `${100 / (showWeekends ? 7 : 5)}%`,
        }}
        >
        <div className="flex items-center w-full">
            <span className="h-2 w-2 bg-red-600 rounded-full -ml-1"/>
            <Separator className="flex-1 bg-red-600 h-[2px]"/>
        </div>
        </div>
    )
}

export default TimeMarker;