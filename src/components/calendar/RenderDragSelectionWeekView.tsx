
export interface DragSelection {
    startTime: Date
    endTime: Date
    startY: number
    currentY: number
    isDragging: boolean
    dayIndex: number
  }
  
export const RenderDragSelectionWeekView = ({
    dragSelection,
    showWeekends,
    gridRef
}: {dragSelection: DragSelection, showWeekends: boolean, gridRef: React.RefObject<HTMLDivElement>}) => {
    
    if (!dragSelection.isDragging) return null

    console.log('renderizando drag selection')

    const scrollTop = gridRef.current?.scrollTop || 0;

    const top = Math.min(dragSelection.startY, dragSelection.currentY) + scrollTop;

    const height = Math.abs(dragSelection.currentY - dragSelection.startY)
    const leftOffset = `${dragSelection.dayIndex * (100 / (showWeekends ? 7 : 5))}%`
    const width = `${100 / (showWeekends ? 7 : 5)}%`

    console.log('top', top, 'height', height, 'leftOffset', leftOffset, 'width', width)

    const timeFormatter = new Intl.DateTimeFormat('es', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
    });

    const startTimeFormatted = timeFormatter.format(
    dragSelection.startTime < dragSelection.endTime ? dragSelection.startTime : dragSelection.endTime
    );

    const endTimeFormatted = timeFormatter.format(
    dragSelection.startTime < dragSelection.endTime ? dragSelection.endTime : dragSelection.startTime
    );

    return (
    <div
        className="absolute pointer-events-none z-50"
        style={{
        top: `${top}px`,
        height: `${height}px`,
        left: leftOffset,
        width: width,
        }}
    >
        <div className="absolute inset-1 bg-blue-500 rounded-lg shadow-lg">
        <div className="p-1 text-white">
            <div className="text-sm font-medium">(Sin título)</div>
            <div className="text-xs">
            {startTimeFormatted} - {endTimeFormatted}
            </div>
        </div>
        </div>
    </div>
    )
}
  