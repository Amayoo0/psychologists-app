import AppLayout from '../AppLayout'
import { PatientProvider } from '@/components/patient/patient-context'
import PatientList from '@/components/patient/PatientList'


export default function Home() {
  
  return (
    <AppLayout>
      <PatientProvider>
        <PatientList/>
        <PatientDialog />
      </PatientProvider>
    </AppLayout>
  )
}

