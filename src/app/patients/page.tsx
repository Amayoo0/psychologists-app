
import AppLayout from '../AppLayout'
import PatientList from '@/components/patient/PatientList'
import FloatingActionButton from '@/components/FloatingActionButton'
import InternalPasswordCheck from '@/components/InternalPasswordCheck'


export default function Home() {
  return (
    <AppLayout>
      <div className='px-4'>
        <PatientList/>
        <FloatingActionButton/>
        <InternalPasswordCheck />
      </div>
    </AppLayout>
  )
}

