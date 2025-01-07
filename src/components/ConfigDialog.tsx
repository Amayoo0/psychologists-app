"use client"

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { useCalendar } from './calendar/calendar-context'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

interface ConfigDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const ConfigDialog: React.FC<ConfigDialogProps> = ({ open, onOpenChange }) => {
  const {view, cellSize, setCellSize, showWeekends, setShowWeekends, workHours, setWorkHours } = useCalendar()
  const [startHour, setStartHour] = React.useState(workHours.start.toString())
  const [endHour, setEndHour] = React.useState(workHours.end.toString())
  const [localCellSize, setLocalCellSize] = React.useState(cellSize.toString())
  const [preferedView, setPreferedView] = React.useState(view)

  const handleSave = () => {
    setCellSize(Number(localCellSize))
    setShowWeekends(showWeekends)
    setWorkHours({ start: Number(startHour), end: Number(endHour) })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configuración del Calendario</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="cellSize" className="text-right">
              Tamaño de celda
            </Label>
            <Input
              id="cellSize"
              value={localCellSize}
              onChange={(e) => setLocalCellSize(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="showWeekends" className="text-right">
              Mostrar fines de semana
            </Label>
            <Switch
              id="showWeekends"
              checked={showWeekends}
              onCheckedChange={setShowWeekends}
            />
          </div>
          {view === "week" &&
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="startHour" className="text-right">
                  Hora de inicio
                </Label>
                <Input
                  id="startHour"
                  value={startHour}
                  onChange={(e) => setStartHour(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="endHour" className="text-right">
                  Hora de fin
                </Label>
                <Input
                  id="endHour"
                  value={endHour}
                  onChange={(e) => setEndHour(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </>
          }
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="prefered-view" className="text-right">
              Vista Preferida
            </Label>
            <Select value={preferedView} onValueChange={(value: any) => setPreferedView(value)}>
                <SelectTrigger>
                    <SelectValue placeholder="Elige vista" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="week">Semana</SelectItem>
                    <SelectItem value="month">Mes</SelectItem>
                </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={handleSave}>Guardar cambios</Button>
      </DialogContent>
    </Dialog>
  )
}

export default ConfigDialog

