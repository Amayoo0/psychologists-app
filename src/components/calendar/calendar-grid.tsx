"use client"

import { cn } from "@/lib/utils"
import { useCalendar } from "@/components/calendar/calendar-context"
import React, { useEffect, useRef, useState } from "react"
import { EventDialog } from "@/components/event/EventDialog"
import { getDatesBetween, getDayEs, getMonth, isMultiDay, isToday, normalizeDate  } from "./utils"
import { EventWeekView, EventWeekViewDragged, DragSelection } from "@/components/calendar/EventWeekView"
import TimeMarker from "@/components/calendar/TimeMarker"
import HeaderWeekDays from "@/components/calendar/HeaderWeekDays"
import { Event } from '@prisma/client'
import { EventMonthView } from "./EventMonthView"
import LoadingSpinner from "@/components/LoadingSpinner"
import { addHours } from "date-fns"
import EventWeekViewMultiDay from "@/components/calendar/EventWeekView-MultiDay"


const CalendarGrid = () => {
	const { view, setView, 
		date, 
		showWeekends,
		cellSize, 
		workHours, 
		events, 
		loadMoreEvents,
		loading,
		preferredView,
	} = useCalendar()
	const [showEventDialog, setShowEventDialog] = useState(false)
	const [eventsToShow, setEventsToShow] = useState<Event[]>([])
	const [days, setDays] = useState<Date[]>([])
	const gridRef = useRef<HTMLDivElement>(null)
	const [dragSelection, setDragSelection] = useState<DragSelection>({
		startTime: new Date(),
		endTime: new Date(),
		startY: 0,
		currentY: 0,
		isDragging: false,
		dayIndex: 0
	})
	const [eventDialogData, setEventDialogData] = useState<Partial<Event | null>>(null)
	const minCellSizeMonthView = 100
	const [cellSizeMonthView, setcellSizeMonthView] = useState(minCellSizeMonthView)
	const [showHiddenMultiDays, setShowHiddenMultiDays] = React.useState(false);

	// Scroll to the first work hour when the work hours change
	useEffect(() => {
		if (gridRef.current) {
			const firstWorkHourElement = gridRef.current.querySelector(`[data-hour="${workHours.start/60}"]`);
			if (firstWorkHourElement) {
				const offsetTop = (firstWorkHourElement as HTMLElement).offsetTop;
				gridRef.current.scrollTo({
				top: offsetTop,
				behavior: 'smooth',
				});
			}
		}
	}, [workHours.start, gridRef, date, view]);

	// Calculate cellSizeMonthView height based on the number of days to show
	useEffect(() => {
		const handleResize = () => {
			if ( !days.length ) return
			if (gridRef.current) {
				const gridRect = gridRef.current.getBoundingClientRect()
				let height = gridRect.height / Math.ceil(days.length / 7)
				if (height < minCellSizeMonthView) height = minCellSizeMonthView
				setcellSizeMonthView(height)
			}
		}
		handleResize()
		window.addEventListener('resize', handleResize)
		return () => window.removeEventListener('resize', handleResize)
	}, [days, gridRef])


	// Load events when the date, view or days change
	useEffect(() => {
		if ( !days.length ) return
		function loadEvents() {
			// if days is out of the loadedRange dates it will calculate a new range
			loadMoreEvents(days[0], days[days.length-1])
			const filteredEvents: Event[] = events.filter(event => {
				// Obtenemos todas las fechas del evento y las normalizamos (devuelve timestamp)
				const eventDates = getDatesBetween(event.startTime, event.endTime).map(normalizeDate);
				// Normalizamos el array days para que solo se tenga en cuenta día/mes/año
				const normalizedDays = days.map(normalizeDate);
				
				// Si al menos una de las fechas del evento se encuentra en normalizedDays, filtramos el evento
				return eventDates.some(dateTimestamp => normalizedDays.includes(dateTimestamp));
			  });
			  

			if (filteredEvents) {
				setEventsToShow(filteredEvents);
			}
		}
		loadEvents();
	}, [view, events, days]);


	// Load days when view or date change
	useEffect(() => {
		let newDays = [];
		if (view === "month"){
			const start = new Date(date.getFullYear(), date.getMonth(), 1)
			start.setHours(0, 0, 0, 0)
			const end = new Date(date.getFullYear(), date.getMonth() + 1, 0)
			end.setHours(23, 59, 59, 999)
			
			// Add days from previous month to start on Sunday
			const firstDay = getDayEs(start)
			for (let i = firstDay; i > 0; i--) {
				const prevDate = new Date(start)
				prevDate.setDate(-i + 1)
				newDays.push(prevDate)
			}
			
			// Add days of current month
			for (let i = 1; i <= end.getDate(); i++) {
				newDays.push(new Date(date.getFullYear(), date.getMonth(), i))
			}
			
			// Add days from next month to complete the grid
			const lastDay = getDayEs(end)
			for (let i = 1; i < 7 - lastDay; i++) {
				const nextDate = new Date(end)
				nextDate.setDate(end.getDate() + i)
				newDays.push(nextDate)
			}
		}else{
			newDays = Array.from({ length: 7 }, (_, i) => {
				const day = new Date(date)
				if (i === 0)
					day.setHours(0, 0, 0, 0)
				else if (i === 6)
					day.setHours(23, 59, 59, 999)
				
				day.setDate(date.getDate() - getDayEs(date) + i)
				return day
			})
		}
		setDays(newDays)
		loadMoreEvents(newDays[0], newDays[newDays.length - 1])
	}, [view, date])

	useEffect(() => {
		if (preferredView) {
			setView(preferredView);
		}
	}, [preferredView]);

	const renderMonthView = () => {

		
		return (
			<div 
				id="calendar-grid-month-view" 
				className="flex flex-col z-10"
				style={{
					height: `calc(100vh - 72px)`
				}}
			>
				<div id="month-header" className="grid" style={{
					gridTemplateColumns: `repeat(${showWeekends ? 7 : 5}, 1fr)`,
				}}>
				{["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day) => (
					(!showWeekends && (day === "Sáb" || day === "Dom") ? null :
					<div
						key={day}
						className="text-sm font-medium text-center border-b"
					>
						{day}
					</div>
					)
				))}
				</div>
				
				<div className="flex-1 overflow-y-auto flex relative bg-white">
					<div id="month-grid" className="grid flex-1" ref={gridRef} style={{
						gridTemplateColumns: `repeat(${showWeekends ? 7 : 5}, 1fr)`,
						gridAutoRows: `${cellSizeMonthView}px`
					}}>
					{days.map((day, i) => (
						<div
							key={`monthView-dayIndex-${i}`}
							className={cn(
								`p-2 border-b border-r min-h-[${minCellSizeMonthView}px]`,
								day.getMonth() !== date.getMonth() && "text-muted-foreground bg-muted/5",
								!showWeekends && [5, 6].includes(getDayEs(day)) && "hidden"
							)}
							onClick={() =>{
								const now = new Date()
								const newTime = new Date(day)
                                setEventDialogData({
										startTime: new Date(newTime.setHours(now.getHours(), now.getMinutes())),
										endTime: new Date(newTime.setHours(now.getHours() + 1, now.getMinutes())),
								});
                                setShowEventDialog(true);
							}}
						>
							<div className={cn(
								"w-10 h-5 rounded-full flex flex-col items-center justify-center text-xs",
								isToday(day) && "bg-blue-600 text-white"
							)}>
								{day.getDate() === 1 
									? day.getDate() + ' ' + getMonth(day.getMonth())
									: day.getDate()
								}
							</div>
						</div>
					))}
					</div>

					{eventsToShow && <EventMonthView events={eventsToShow} days={days} showWeekends={showWeekends} cellSize={cellSizeMonthView}/>}
				</div>
				<EventDialog 
					open={showEventDialog}
					onOpenChange={setShowEventDialog}
					eventData={eventDialogData ?? {
						startTime: new Date(),
						endTime: addHours(new Date(), 1),
					}} 
				/>
			</div>
		)
	}


	const renderWeekView = () => {
		const hours = Array.from({ length: 24 }, (_, i) => i)
		const nMultiDaysToShow = 2;

		const multiDayEvents = eventsToShow.filter((e) => isMultiDay(e))

		const getTimeFromMousePosition = (y: number, baseDate: Date) => {
			if (!gridRef.current) return new Date()

			const scrollTop = gridRef.current.scrollTop
			const totalY = y + scrollTop
			const hour = Math.floor(totalY / cellSize)
			const minutes = Math.floor((totalY % cellSize) / cellSize * 60)
			
			const time = new Date(baseDate)
			time.setHours(hour, minutes, 0, 0)
			return time
		}

		const handleMouseDown = (e: React.MouseEvent, dayIndex: number) => {
			if (!gridRef.current) {
				return
			}

			const rect = gridRef.current.getBoundingClientRect()
			const y = e.clientY - rect.top
			
			const startDate = new Date(date)
			startDate.setDate(date.getDate() - getDayEs(date) + dayIndex)
			const startTime = getTimeFromMousePosition(y, startDate)
			
			setDragSelection({
				startTime,
				endTime: startTime,
				startY: y,
				currentY: y,
				isDragging: true,
				dayIndex
			})

			// Prevent text selection while dragging
			e.preventDefault()
		}

		const handleMouseMove = (e: React.MouseEvent) => {
			if (!dragSelection.isDragging || !gridRef.current) return

			const rect = gridRef.current.getBoundingClientRect()
			const y = e.clientY - rect.top
			
			const endTime = getTimeFromMousePosition(y, dragSelection.startTime)

			setDragSelection(prev => ({
				...prev,
				endTime,
				currentY: y
			}))
		}

		const handleMouseUp = () => {
			if (dragSelection.isDragging) {
				// Ensure start time is always before end time
				const finalStartTime = dragSelection.startTime < dragSelection.endTime 
				? dragSelection.startTime 
				: dragSelection.endTime
				const finalEndTime = dragSelection.startTime < dragSelection.endTime 
				? dragSelection.endTime 
				: dragSelection.startTime

				setDragSelection(prev => ({ 
					...prev, 
					isDragging: false,
					startTime: finalStartTime,
					endTime: finalEndTime
				}))
				setEventDialogData({
					startTime: finalStartTime,
					endTime: finalEndTime,
				})

				setShowEventDialog(true)
			}
		}


		return (
			<div 
				id="calendar-grid-week-view"
				className="pb-4 flex flex-col z-10"
				style={{ height: `calc(100vh - 50px)` }}
			>
				{/* Sticky Header */}
				<div id="sticky-header" className="sticky bg-background flex top-0 z-10">
					<div id="header-hours-column" className={`w-16 h-[${cellSize}px] bg-white`}/>
					<HeaderWeekDays showWeekends={showWeekends} days={days} isMobile={window.innerWidth <= 600}/>
				</div>
				<div id="multi-day-events-top" >
					{multiDayEvents && <EventWeekViewMultiDay 
						events={multiDayEvents} 
						date={date} 
						cellSize={cellSize} 
						showWeekends={showWeekends}
						showHidden={showHiddenMultiDays}
						setShowHidden={setShowHiddenMultiDays}
						nMultiDaysToShow={nMultiDaysToShow}
					/>}
				</div>
				

				{/* Scrollable Content */}
				<div 
					id="scrollable-content" 
					className="flex-1 overflow-y-auto flex relative bg-white"
					ref={gridRef}
				>
					
					{/* Hours column */}
					<div className={cn(
						`w-16 h-[${cellSize}] bg-background sticky left-0 z-10`)
					}>
						{hours.map((hour) => (
						<div 
							key={hour} 
							className={cn(
								"border-b border-r pt-1 text-sm  flex justify-end pr-4",
							)}
							style={{height: `${cellSize}px`}}
							data-hour={hour}
						>
							{`${hour.toString().padStart(2, '0')}:00`}
						</div>
						))}
					</div>

					{/* Time grid */}
					<div className="grid flex-1 relative" style={{ 
							gridTemplateColumns: `repeat(${showWeekends ? 7 : 5}, 1fr)`,
							gridAutoRows: `${cellSize}px`
						}}
						onMouseMove={handleMouseMove}
						onMouseUp={handleMouseUp}
						onMouseLeave={handleMouseUp}
					>

						{hours.map((hour) => (
							<React.Fragment key={hour}>
								{days.map((day, dayIndex) => (
								(!showWeekends && [5, 6].includes(getDayEs(day))) ? null : (
									<div 
									key={dayIndex} 
									className={cn(
										"border-r border-b",
									)}
									onMouseDown={(e) => handleMouseDown(e, dayIndex)}
									/>
								)
								))}
							</React.Fragment>
						))}
						{gridRef.current && (
							<EventWeekViewDragged dragSelection={dragSelection} showWeekends={showWeekends} gridRef={gridRef as React.RefObject<HTMLDivElement>} />
						)}

						{/* Time marker */}
						{isToday(date) && (
							<TimeMarker showWeekends={showWeekends} cellSize={cellSize} />
						)}

						{/* Events */}
						{eventsToShow && <EventWeekView events={eventsToShow.filter((e) => !isMultiDay(e))} date={date} cellSize={cellSize} showWeekends={showWeekends}/>}
					</div>

					<EventDialog 
						open={showEventDialog}
						onOpenChange={setShowEventDialog}
						eventData={eventDialogData ?? {
							startTime: new Date(),
							endTime: addHours(new Date(), 1),
						}} 
					/>
				</div>
			</div>
		)
	}

	return (
		<>
		{loading ? (
			<LoadingSpinner message="Cargando eventos..." />
		) : (
			view === "month" ? renderMonthView() : renderWeekView()
		)}

		</>
	)
}

export default CalendarGrid
