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
import { Event, File, Patient } from "@prisma/client"
import { useState } from "react"
import { savePatient } from "@/app/actions/patients"
import { format } from "date-fns"


interface PatientDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	patientData?: Partial<Patient>
}

export default function PatientDialog({
	open,
	onOpenChange,
	patientData
}: PatientDialogProps) {
	const [patients, setPatients] = useState<Patient[]>([])
	const [name, setName] = useState(patientData?.name ?? '')
	const [email, setEmail] = useState(patientData?.email ?? '')
	const [phone, setPhone] = useState(patientData?.phone ?? '')
	const [initials, setInitials] = useState(patientData?.initials ?? '')
	const [lastSession, setLastSession] = useState<Date>(patientData?.lastSession ?? new Date())

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		const patient: Partial<Patient> = {
		name,
		email,
		initials,
		lastSession,
		}

		console.log('saving Patient:', patient)

		const savedPatient = await savePatient(patient)
		setPatients([...patients, savedPatient as Patient])

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
						placeholder="Añadir título"
						value={name}
						onChange={(e) => setName(e.target.value)}
						className="border-0 border-b p-0 text-lg font-medium focus-visible:ring-0"
					/>
				</DialogTitle>
			</DialogHeader>

			<div className="grid gap-4 py-4">
                <div className="flex flex-row items-center space-x-2">
					<Input
						type="text"
						placeholder="Iniciales"
						value={initials}
						onChange={(e) => setInitials(e.target.value)}
					/>
				</div>
					<Input
						type="email"
						placeholder="Email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
					/>
					<Input
						type="tel"
						placeholder="Teléfono"
						value={phone}
						onChange={(e) => setPhone(e.target.value)}
					/>
					<Input
						type="date"
						value={format(lastSession, "yyyy-MM-dd")}
						className="w-30"
						onChange={(e) => {
							setLastSession((prev) => new Date(new Date(e.target.value).setHours(prev.getHours(), prev.getMinutes())))
						}}
					/>
					<Input
						type="text"
						placeholder="Ficheros"
					/>
			</div>
			
			<DialogFooter>
				<Button type="submit">Guardar</Button>
			</DialogFooter>
			</form>
		</DialogContent>
		</Dialog>
	)
}

