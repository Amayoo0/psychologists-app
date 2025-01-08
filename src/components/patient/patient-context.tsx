'use client'
import { getPatients } from '@/app/actions/patients'
import { Patient } from '@prisma/client'
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'


type PatientContextType = {
	isOpen: boolean
	patients: Patient[]
	setPatients: (patients: Patient[]) => void
	selectedPatient: Patient | null
	openDialog: (patient: Patient) => void
	closeDialog: () => void

}

const PatientContext = createContext<PatientContextType | undefined>(undefined)

export const PatientProvider = ({ children }: { children: ReactNode }) => {
	const [isOpen, setIsOpen] = useState(false)
	const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
	const [patients, setPatients] = useState<Patient[]>([]);
	const [loadingPatients, setLoadingPatients] = useState(false);

	useEffect(() => {
		async function loadPatients() {
			setLoadingPatients(true);
			const patients = await getPatients();
			if (patients) {
				setPatients(patients);
			}else{
				setPatients([
					{ id: 1, name: 'John Doe', initials: 'JD', userId: 101, createdAt: new Date(), lastSession: new Date() },
					{ id: 2, name: 'Jane Smith', initials: 'JS', userId: 102, createdAt: new Date(), lastSession: new Date() },
					{ id: 3, name: 'Alice Johnson', initials: 'AJ', userId: 103, createdAt: new Date(), lastSession: new Date() }
				]);
			}
			console.log('CalendarContext.patients', patients)
			setLoadingPatients(false);
		}
		loadPatients();
	}, []);

	const openDialog = (patient: Patient) => {
		setIsOpen(true)
		setSelectedPatient(patient)
	}

	const closeDialog = () => {
		setIsOpen(false)
		setSelectedPatient(null)
	}

	return (
		<PatientContext.Provider value={{ isOpen, patients, setPatients, selectedPatient, openDialog, closeDialog }}>
			{children}
		</PatientContext.Provider>
	)
}

export const usePatientContext = () => {
	const context = useContext(PatientContext)
	if (context === undefined) {
		throw new Error('usePatientDialog must be used within a PatientDialogProvider')
	}
	return context
}

