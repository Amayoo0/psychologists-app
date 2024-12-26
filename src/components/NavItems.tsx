import {Calendar1, LayoutDashboard, LucideLogOut, User} from 'lucide-react'
import NewPatientDialog from './NewPatientDialog';
import ScheduleAppointmentDialog from './ScheduleAppointmentDialog';

export const NavItems = () => {
    return [
        {
            name: 'Tablero',
            href: '/dashboard',
            icon: LayoutDashboard,
        },
        {
            name: 'Calendario',
            href: '/calendar',
            icon: Calendar1,
        },
        {
            name: 'Pacientes',
            href: '/patients',
            icon: User,
        },
    ];
};