import {Calendar1, LayoutDashboard, User} from 'lucide-react'

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