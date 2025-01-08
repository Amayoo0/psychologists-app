'use client'
import { Button } from "../ui/button";
import { usePatientContext } from "./patient-context";

const PatientList = () => {
    const { isOpen, patients, selectedPatient, openDialog, closeDialog } = usePatientContext()
    
    return (
        <ul className="space-y-2">
			{patients.map((patient) => (
				<li key={patient.id} className="flex items-center justify-between p-2 bg-white rounded-lg shadow">
				<span>{patient.name}</span>
				<Button onClick={() => openDialog(patient)}>
					Ver detalles
				</Button>
				</li>
			))}
        </ul>
    )
}

export default PatientList;