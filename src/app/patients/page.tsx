
import AppLayout from '../AppLayout'
import PatientList from '@/components/patient/PatientList'
import FloatingActionButton from '@/components/FloatingActionButton'
import InternalPasswordCheck from '@/components/InternalPasswordCheck'


export default function Home() {
  return (
    <AppLayout>
        <PatientList/>
        <FloatingActionButton/>
        <InternalPasswordCheck />
    </AppLayout>
  )
}

