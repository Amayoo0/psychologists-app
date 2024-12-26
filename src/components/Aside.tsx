'use client'

import { useState, useEffect } from 'react'

import { cn } from '@/lib/utils';
import { NavItems } from '@/components/NavItems';
import { ChevronLeft, ChevronRight, Plus, Settings } from 'lucide-react';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Separator } from "./ui/separator"
import { usePathname } from 'next/navigation';
import { Avatar } from './ui/avatar';

const Aside = () => {
	const name = 'Amira Domingos'
	const navItems = NavItems();
	const pathname = usePathname();

	const [isSidebarExpanded, setIsSidebarExpanded] = useState(() => {
		if (typeof window !== 'undefined'){
			const saved = window.localStorage.getItem('sidebarExpanded');
			if (saved === null){
				return true;
			}
			return JSON.parse(saved);
		}
		return true; // default state if window is not defined
	});

	useEffect(() => {
		if (typeof window !== 'undefined') {
		  window.localStorage.setItem(
			'sidebarExpanded',
			JSON.stringify(isSidebarExpanded),
		  );
		}
	  }, [isSidebarExpanded]);
	
	  const toggleSidebar = () => {
		setIsSidebarExpanded(!isSidebarExpanded);
	  };
	  
	  return (
		<div
		className={cn(
			isSidebarExpanded ? 'basis-1/3 lg:basis-1/4 xl:basis-1/5' : '200px',
			'border-r transition-all duration-300 ease-in-out transform hidden sm:flex h-full bg-accent',
		)}
		>
			<aside className="flex h-full flex-col w-full break-words px-4 overflow-x-hidden columns-1">
				{/* Top */}
				<div id="right" className="flex flex-row items-center pt-3 py-2">
					<Avatar>
						<div className="w-full h-full bg-foreground text-background flex items-center justify-center font-medium text-xl">
							{name.split(' ')[0][0].toUpperCase()}{name.split(' ')[1][0].toUpperCase()}
						</div>	
					</Avatar>
					{isSidebarExpanded ? (
						<div className="pl-2 flex flex-col">
							<h2 className="text-md font-bold">Amira Domingos</h2>
							<span className="text-xs italic">Gratis</span>
						</div>
					): ('') }
				</div>
				{isSidebarExpanded ? (
					<Separator className='w-full'/>
				): ('')}

				{/* NavItems */}
				<div id="navItems" className='py-2'>
					{navItems.map((item, idx) => {
						return (
							<div className="space-y-1" key={idx}>
								<SideNavItem
									label={item.name}
									icon={item.icon}
									path={item.href}
									active= {pathname === item.href}
									isSidebarExpanded={isSidebarExpanded}
								/>
							</div>
						);
					})}
				</div>
				<Separator/>

				{/* Bottom */}
				<div id="settings" className='sticky mt-auto whitespace-nowrap mb-4 transition duration-200 block'>
					<SideNavItem
						label="Configuración"
						icon={Settings}
						path="/settings"
						active= {pathname === "/settings"}
						isSidebarExpanded={isSidebarExpanded}
					/>
				</div>
			</aside>

			<div className="mt-[calc(calc(90vh)-40px)] relative">
				<button
				type="button"
				className="absolute bottom-32 right-[-12px] flex h-6 w-6 items-center justify-center border border-muted-foreground/20 rounded-full bg-accent shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out"
				onClick={toggleSidebar}
				>
				{isSidebarExpanded ? (
					<ChevronLeft size={16} className='stroke-foreground'/>
				) : (
					<ChevronRight size={16} className='stroke-foreground'/>
				)}
				</button>
			</div>
		</div>
	  );
	}
	
	export const SideNavItem: React.FC<{
	  label: string;
	  icon: React.ElementType;
	  path: string;
	  active: boolean;
	  isSidebarExpanded: boolean;
	}> = ({ label, icon: Icon, path, active, isSidebarExpanded }) => {	  
	  return (
		<>
		  {isSidebarExpanded ? (
			<a
			  href={path}
			  className={`h-full relative flex items-center whitespace-nowrap rounded-md ${
				active
				  ? 'font-base bg-neutral-200 shadow-sm text-neutral-700 dark:bg-neutral-800 dark:text-white'
				  : 'hover:bg-neutral-200 hover:text-neutral-700 text-neutral-500 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white'
			  }`}
			>
			  <div className="relative font-base text-[17px] py-1.5 px-2 flex flex-row items-center space-x-2.5 rounded-md duration-100">
					<Icon/>
					<span>{label}</span>
			  </div>
			</a>
		  ) : (
			<TooltipProvider delayDuration={70}>
			  <Tooltip>
				<TooltipTrigger>
				  <a
					href={path}
					className={`h-full relative flex items-center whitespace-nowrap rounded-md ${
					  active
						? 'font-base text-[19px] bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-white'
						: 'hover:bg-neutral-200 hover:text-neutral-700 text-neutral-500 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white'
					}`}
				  >
					<div className="relative font-base py-1.5 px-2 flex flex-row items-center rounded-md duration-100">
						<Icon/>
					</div>
				  </a>
				</TooltipTrigger>
				<TooltipContent
				  side="left"
				  className="px-3 py-1.5 text-[15px]"
				  sideOffset={10}
				>
				  <span>{label}</span>
				</TooltipContent>
			  </Tooltip>
			</TooltipProvider>
		  )}
		</>
	  );
	};


	 
export default Aside