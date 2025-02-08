'use client'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Event, Patient } from "@prisma/client"
import { useEffect, useState } from "react"
import { savePatient, updatePatient } from "@/app/actions/patients"
import { format } from "date-fns"
import { AtSign, File, Phone, User } from "lucide-react"
import EventTable from "./EventsTable"
import { useCalendar } from "./calendar/calendar-context"


interface PatientDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	patientData?: Partial<Patient>
}

export default function PatientDialog({
	open,
	onOpenChange,
	patientData,
}: PatientDialogProps) {
	const {patients, setPatients} = useCalendar()
	const [name, setName] = useState(patientData?.name ?? '')
	const [email, setEmail] = useState(patientData?.email ?? '')
	const [phone, setPhone] = useState(patientData?.phone ?? '')
	const [initials, setInitials] = useState(patientData?.initials ?? '')

	useEffect(() => {
		if (patientData) {
			setName(patientData.name ?? '');
			setEmail(patientData.email ?? '');
			setPhone(patientData.phone ?? '');
			setInitials(patientData.initials ?? '');
		}
	}, [patientData]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		const patient: Partial<Patient> = {
			name,
			email,
			phone,
			initials,
		}

		if (patientData?.id) {
			const updatedPatient = await updatePatient(patientData.id, patient)
			const updatedPatients = patients.map(p => p.id === updatedPatient?.id ? updatedPatient : p)
			setPatients(updatedPatients)
		} else {
			const savedPatient = await savePatient(patient)
			setPatients([...patients, savedPatient as Patient])
		}


		onOpenChange(false)
	}

  	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
		<DialogContent className="sm:max-w-[425px]">
			<form onSubmit={handleSubmit}>
			<DialogHeader>
				<DialogTitle>
					<Input
						type="text"
						placeholder="Nombre del paciente"
						value={name}
						onChange={(e) => setName(e.target.value)}
						className="border-0 border-b pb-0 w-[95%] text-lg font-medium focus-visible:ring-0"
					/>
				</DialogTitle>
			</DialogHeader>

			<div className="grid gap-4 py-4">
                <div className="flex items-center gap-4">
					<User className="h-4 w-4 text-muted-foreground" />
					<Input
						type="text"
						placeholder="Iniciales"
						value={initials}
						onChange={(e) => setInitials(e.target.value)}
					/>
				</div>
				<div className="flex items-center gap-4">
					<AtSign className="h-4 w-4 text-muted-foreground" />
					<Input
						type="email"
						placeholder="Email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
					/>
				</div>
				<div className="flex items-center gap-4">
					<Phone className="h-4 w-4 text-muted-foreground" />
					<Input
						type="tel"
						placeholder="Teléfono"
						value={phone}
						onChange={(e) => setPhone(e.target.value)}
					/>
				</div>
			</div>
			
			<DialogFooter>
				<Button type="submit">Guardar</Button>
			</DialogFooter>
			</form>
		</DialogContent>
		</Dialog>
	)
}

