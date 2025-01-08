'use client'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { Event, File } from "@prisma/client"
import { useState } from "react"
import { usePatientContext } from "./patient/patient-context"

export type PatientData = {
  id?: number
  name: string
  initials: string
  email: string
  lastSession: Date | null 
  events: Event[]
  file: File[]
}

interface NewPatientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patientData?: PatientData
}

export default function NewPatientDialog({
  open,
  onOpenChange,
  patientData
}: NewPatientDialogProps) {
  const { patients, setPatients } = usePatientContext()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [initials, setInitials] = useState('')
  const [lastSession, setLastSession] = useState<Date | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [file, setFile] = useState<File[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const patient: PatientData = {
      name,
      email,
      initials,
      lastSession,
      events,
      file,
    }

    const savedPatients: Promise<Patient[]> = savePatient(patient)
    setPatients(savedPatients)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nuevo Paciente</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ingrese el nombre" />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" placeholder="Ingrese el email" />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono</FormLabel>
                  <FormControl>
                    <Input {...field} type="tel" placeholder="Ingrese el teléfono" />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Guardar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

