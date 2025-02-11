"use client"

import * as React from "react"
import { Calendar, Clock, Lock } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCalendar, ViewType } from "./calendar/calendar-context"
import { useEffect, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { saveSettings } from "@/app/actions/settings"
import { createHash } from 'crypto';
import LoadingSpinner from "./LoadingSpinner"

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
    
    const [settings, setSettings] = useState({
        showWeekends: showWeekends, 
        cellSize: cellSize,
        workDayStart: workHours.start,
        workDayEnd: workHours.end,
        preferredView: preferredView,
        internalPassword: internalPassword
    })

    const handleSave = async () => {
        setShowWeekends(settings.showWeekends)
        setCellSize(settings.cellSize)
        setWorkHours({ start: settings.workDayStart, end: settings.workDayEnd })
        setPreferredView(settings.preferredView)

        await saveSettings(settings)

        console.log(settings)
    }
    useEffect(() => {
        if (!open) {
            handleSave();
        }
    }, [open]);
    
    async function updateInternalPassword(newPassword: string) {
        const hash = createHash('sha256');
        hash.update(newPassword + salt);
        const hashedPassword = hash.digest('hex');
        setInternalPassword(hashedPassword)
        await saveSettings({internalPassword: hashedPassword})
        console.log("Password updated", hashedPassword)
        console.log("settings.internalPassword", settings.internalPassword)
        open = false;
    }

    const formatTime = (time: number) => {
        const hours = Math.floor(time / 60).toString().padStart(2, '0');
        const minutes = (time % 60).toString().padStart(2, '0');
        console.log("time", time)
        console.log("hours", hours)
        console.log("minutes", minutes )
        return `${hours}:${minutes}`;
    }

    const parseTime = (time: string) => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] sm:min-h-[456px]">
                <DialogHeader>
                    <DialogTitle>Configuración del Calendario</DialogTitle>
                    <DialogDescription>Configure sus preferencias de calendario y configuraciones de seguridad.</DialogDescription>
                </DialogHeader>

                <Tabs defaultValue={selectedTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="general">
                            <span className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                General
                            </span>
                        </TabsTrigger>
                        <TabsTrigger value="weekly">
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
                                        checked={settings.showWeekends}
                                        onCheckedChange={(checked) => setSettings({ ...settings, showWeekends: checked })}
                                        />
                                </div>
                                <div className="space-y-2">
                                <Label htmlFor="prefered-view" className="text-right">
                                    Vista Preferida
                                </Label>
                                <Select value={settings.preferredView} onValueChange={(value: any) => setSettings({ ...settings, preferredView: value })}>
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
                                <Button onClick={() => open=false}>Guardar</Button>
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
                                            value={formatTime(settings.workDayStart)}
                                            onChange={(e) => setSettings({ ...settings, workDayStart: parseTime(e.target.value) })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="end">Fin de jornada laboral</Label>
                                        <Input
                                            id="end"
                                            type="time"
                                            value={formatTime(settings.workDayEnd)}
                                            onChange={(e) => setSettings({ ...settings, workDayEnd: parseTime(e.target.value) })}
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
                                        value={settings.cellSize}
                                        onChange={(e) =>
                                            setSettings({
                                                ...settings,
                                                cellSize: Number.parseInt(e.target.value, 10),
                                            })
                                        }
                                        />
                                    <div className="text-sm text-muted-foreground">
                                        Ajuste la altura de cada celda de hora en la vista semanal (40-120px)
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <Button onClick={() => open=false}>Guardar</Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="security" className="space-y-4 py-4">
                            <div className="space-y-4 rounded-lg border p-4">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="current">Contraseña actual</Label>
                                        <Input id="current" type="password" />
                                    </div>
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
                                        <Button onClick={() => {
                                                const currentPasswordInput = document.getElementById('current') as HTMLInputElement;
                                                const currentPassword = currentPasswordInput.value;
                                                
                                                const hash = createHash('sha256');
                                                hash.update(currentPassword + salt);
                                                const hashedCurrentPassword = hash.digest('hex');
                                                console.log("hashedCurrentPassword", hashedCurrentPassword)

                                                if (hashedCurrentPassword !== internalPassword) {
                                                    alert("Contraseña actual incorrecta");
                                                    return;
                                                }
                                                const newPasswordInput = document.getElementById('new') as HTMLInputElement;
                                                const confirmPasswordInput = document.getElementById('confirm') as HTMLInputElement;
                                                const newPassword = newPasswordInput.value;
                                                const confirmPassword = confirmPasswordInput.value;
                                                
                                                console.log("newPassword", newPassword)
                                                console.log("confirmPassword", confirmPassword)
                                                
                                                if (newPassword !== confirmPassword) {
                                                    alert("Nueva contraseña y confirmación no coinciden");
                                                    return;
                                                }

                                                updateInternalPassword(newPassword)
                                                currentPasswordInput.value = '';
                                                newPasswordInput.value = '';
                                                confirmPasswordInput.value = '';
                                            }
                                        }>Guardar</Button>
                                    </div>
                        </TabsContent>
                    </>
                    }
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
