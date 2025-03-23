'use client'
import { useState } from "react";
import PatientDialog from "./PatientDialog";
import { useCalendar } from "@/components/calendar/calendar-context";
import { Patient } from "@prisma/client";
import { PasswordProtect } from "./PasswordProtect";
import { deletePatient } from "@/app/actions/patients";
import PatientTable from "@/components/patient/PatientsTable";
import LoadingSpinner from "@/components/LoadingSpinner";

const PatientList = () => {
    const { patients, setPatients, isAuthenticated, loading } = useCalendar()
	const [showPatientDialog, setShowPatientDialog] = useState(false)
	const [showPasswordDialog, setShowPasswordDialog] = useState(false)
	const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)

	const onEditPatient = (patient: Patient) => {
		if (isAuthenticated) {
			setSelectedPatient(patient)
			setShowPatientDialog(true)
		} else {
			setSelectedPatient(patient)
			setShowPasswordDialog(true)
		}
	}

	const onDeletePatient = async (patient: Patient) => {
		await deletePatient(patient.id)
		setPatients(patients.filter(p => p.id !== patient.id))
	}
	
    return (
		<>
		{loading ? (
        	<LoadingSpinner message="Cargando pacientes..." />
		) : (
			<div className="overflow-x-auto ">
				<h1 className="px-6 py-1 text-3xl font-bold mb-6">Pacientes</h1>
				{((patients.length > 0) 
					?   <>
						<PatientTable 
							patients={patients}
							onEditPatient={onEditPatient} 
							onDeletePatient={onDeletePatient} 
						/>

						<PasswordProtect 
							open={showPasswordDialog} 
							onOpenChange={setShowPasswordDialog}
							onAuthenticated={() => setShowPatientDialog(true)}
						>
							<PatientDialog 
								open={showPatientDialog}
								onOpenChange={setShowPatientDialog}
								patientData={selectedPatient ?? undefined}
							/>
						</PasswordProtect>
						</>
					:   <p className="px-6 text-gray-500 text-sm">No hay pacientes registrados.</p>
				)}
			</div>
		)}
		</>
    )
}

export default PatientList;