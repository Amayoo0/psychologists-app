"use client"

import * as React from "react"
import { Calendar, Clock, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogOverlay,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCalendar, ViewType } from "@/components/calendar/calendar-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { saveSettings } from "@/app/actions/settings"
import { createHash } from 'crypto';
import LoadingSpinner from "@/components/LoadingSpinner"

type PreferredView = "weekly" | "general" | "security"

export function SettingsDialog({
        open,
        onOpenChange,
        selectedTab,
}: {
        open: boolean
        onOpenChange: (open: boolean) => void
        selectedTab: PreferredView
}) {

    const { 
        preferredView, setPreferredView,
        cellSize, setCellSize,
        showWeekends, setShowWeekends,
        workHours, setWorkHours,
        internalPassword, setInternalPassword,
        salt,
        loading
    } = useCalendar()
    
    const handleSave = async (newPassword?: string) => {
        const settings = {
            showWeekends: showWeekends, 
            cellSize: cellSize,
            workDayStart: workHours.start,
            workDayEnd: workHours.end,
            preferredView: preferredView,
            internalPassword: newPassword,
        }
        await saveSettings(settings)

        onOpenChange(false)
    }
    
    async function updateInternalPassword(newPassword: string) {
        const hash = createHash('sha256');
        hash.update(newPassword + salt);
        const hashedPassword = hash.digest('hex');
        setInternalPassword(hashedPassword)
        handleSave(hashedPassword);
    }

    function onSavePasswordClick() {
        const currentPasswordInput = document.getElementById('current') as HTMLInputElement;
        
        if (selectedTab !== "security") {
            const currentPassword = currentPasswordInput.value;
            const hash = createHash('sha256');
            hash.update(currentPassword + salt);
            const hashedCurrentPassword = hash.digest('hex');

            if (hashedCurrentPassword !== internalPassword) {
                alert("Contraseña actual incorrecta");
                return;
            }
        }
        const newPasswordInput = document.getElementById('new') as HTMLInputElement;
        const confirmPasswordInput = document.getElementById('confirm') as HTMLInputElement;
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        if (!newPassword || !confirmPassword) {
            alert("Por favor, cree una nueva contraseña y confírmela");
            return;
        }
        
        if (newPassword !== confirmPassword) {
            alert("Nueva contraseña y confirmación no coinciden");
            return;
        }

        updateInternalPassword(newPassword)
    }

    const formatTime = (time: number) => {
        const hours = Math.floor(time / 60).toString().padStart(2, '0');
        const minutes = (time % 60).toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    const parseTime = (time: string) => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    }

    return (
        <Dialog 
            open={open}
            onOpenChange={(isOpen) => {
                // SOLO permitir cerrar si NO estamos en la pestaña de seguridad
                if (selectedTab !== "security") {
                    onOpenChange(isOpen);
                }
            }}
        >
            <DialogOverlay 
                className="fixed inset-0 bg-black/50" 
                onClick={(e) => {
                    if (selectedTab === "security") {
                        e.preventDefault(); // Prevenir el comportamiento predeterminado
                        e.stopPropagation(); // Detener la propagación del evento
                    } else {
                        onOpenChange(false); // Cerrar el modal si NO está en "security"
                    }
                }}
            />
            <DialogContent 
                className="sm:max-w-[500px] sm:min-h-[456px]"
                onEscapeKeyDown={(e) => {
                    if (selectedTab === "security") {
                        e.preventDefault(); // Bloquea el cierre con la tecla Escape
                        alert('Debes crear una nueva contraseña antes de continuar');
                    }
                }}
            >
                <DialogHeader>
                    <DialogTitle>{selectedTab !== "security" 
                        ? "Configuración del Calendario"
                        : "¡Bienvenid@ a PsyApp!"}
                    </DialogTitle>
                    <DialogDescription>
                        {selectedTab !== "security" 
                        ? "Configure sus preferencias de calendario y configuraciones de seguridad."
                        : "Antes de continuar. Crea una clave segura para proteger la información de tus pacientes."}
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue={selectedTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="general" disabled={selectedTab === "security"}>
                            <span className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                General
                            </span>
                        </TabsTrigger>
                        <TabsTrigger value="weekly" disabled={selectedTab === "security"}>
                            <span className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Semanal
                            </span>
                        </TabsTrigger>
                        <TabsTrigger value="security">
                            <span className="flex items-center gap-2">
                                <Lock className="h-4 w-4" />
                                Seguridad
                            </span>
                        </TabsTrigger>
                    </TabsList>
                    {loading 
                        ? <LoadingSpinner /> 
                        : <>
                        <TabsContent value="general" className="space-y-4 py-4">
                            <div className="space-y-4 rounded-lg border p-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Mostrar fines de semana</Label>
                                        <div className="text-sm text-muted-foreground">Mostrar días de fin de semana en el calendario</div>
                                    </div>
                                    <Switch
                                        checked={showWeekends}
                                        onCheckedChange={(checked) => setShowWeekends(checked)}
                                        />
                                </div>
                                <div className="space-y-2">
                                <Label htmlFor="prefered-view" className="text-right">
                                    Vista Preferida
                                </Label>
                                <Select value={preferredView} onValueChange={(value: ViewType) => setPreferredView(value)}>
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
                            <div className="flex justify-end pt-[74px]">
                                <Button onClick={() => handleSave()}>Guardar</Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="weekly" className="space-y-4 py-4">
                            <div className="space-y-4 rounded-lg border p-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="start">Inicio de jornada laboral</Label>
                                        <Input
                                            id="start"
                                            type="time"
                                            value={formatTime(workHours.start)}
                                            onChange={(e) => setWorkHours({ start: parseTime(e.target.value), end: workHours.end })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="end">Fin de jornada laboral</Label>
                                        <Input
                                            id="end"
                                            type="time"
                                            value={formatTime(workHours.end)}
                                            onChange={(e) => setWorkHours({ start: workHours.start, end: parseTime(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cell-size">Tamaño de celda (píxeles)</Label>
                                    <Input
                                        id="cell-size"
                                        type="number"
                                        min={40}
                                        max={120}
                                        value={cellSize}
                                        onChange={(e) =>
                                            setCellSize(Number.parseInt(e.target.value, 10))
                                        }
                                        />
                                    <div className="text-sm text-muted-foreground">
                                        Ajuste la altura de cada celda de hora en la vista semanal (40-120px)
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <Button onClick={() => handleSave()}>Guardar</Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="security" className="space-y-4 py-4">
                            <div className="space-y-4 rounded-lg border p-4">
                                <div className="space-y-4">
                                    {selectedTab !== "security" && (
                                        <div className="space-y-2">
                                            <Label htmlFor="current">Contraseña actual</Label>
                                            <Input id="current" type="password" />
                                        </div>
                                    )}
                                    <div className="space-y-2">
                                        <Label htmlFor="new">Nueva contraseña</Label>
                                        <Input id="new" type="password" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirm">Confirmar nueva contraseña</Label>
                                        <Input id="confirm" type="password" />
                                    </div>

                                </div>
                            </div>
                            <div className="flex justify-end">
                                <Button onClick={() => onSavePasswordClick()}>Guardar</Button>
                            </div>
                        </TabsContent>
                    </>
                    }
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
