
import AppLayout from '../AppLayout'
import PatientList from '@/components/patient/PatientList'
import { CalendarProvider } from '@/components/calendar/calendar-context'


export default function Home() {
  return (
    <AppLayout>
      <CalendarProvider>
        <PatientList/>
      </CalendarProvider>
    </AppLayout>
  )
}

