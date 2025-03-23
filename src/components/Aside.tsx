'use client'

import { useState, useEffect } from 'react'

import { cn } from '@/lib/utils';
import { NavItems } from '@/components/NavItems';
import { ChevronLeft, ChevronRight, LogOutIcon, Settings } from 'lucide-react';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from "@/components/ui/separator"
import { usePathname } from 'next/navigation';
import { Avatar } from '@/components/ui/avatar';
import { useClerk, useUser } from '@clerk/nextjs'
import { Portal } from '@radix-ui/react-tooltip';
import { SettingsDialog } from '@/components/SettingsDialog';

const Aside = () => {
	const navItems = NavItems();
	const pathname = usePathname();
	const { signOut } = useClerk();

	const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
	const [showSettingsDialog, setShowSettingsDialog] = useState(false);

	useEffect(() => {
		const saved = window.localStorage.getItem('sidebarExpanded');
		if (saved !== null) {
		  setIsSidebarExpanded(JSON.parse(saved));
		}
	  }, []);

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
	const { user } = useUser()
	  return (
		<>
			<div
			className={cn(
				isSidebarExpanded ? 'basis-1/3 lg:basis-1/4 xl:basis-1/5' : '200px',
				'border-r transition-all duration-300 ease-in-out transform hidden sm:flex h-full bg-accent',
			)}
			>
				<aside className="flex h-full flex-col w-full break-words px-4 overflow-x-hidden columns-1 z-40">
					{/* Top */}
					<div id="right" className="flex flex-row items-center pt-3 py-2">
						<Avatar>
							<div className="w-full h-full bg-foreground text-background flex items-center justify-center font-medium text-xl">
								{user?.emailAddresses?.toString().slice(0, 2).toUpperCase()}
							</div>	
						</Avatar>
						{isSidebarExpanded && user?.emailAddresses ? (() => {
							const emailStr = user.emailAddresses.toString();
							const emailName = emailStr.split('@')[0];
							// Si emailName es undefined o vacío, se le asigna un fallback
							const displayName = emailName 
								? emailName.charAt(0).toUpperCase() + emailName.slice(1) 
								: 'Usuario';
							return (
								<div className="pl-2 flex flex-col">
									<h2 className="text-md font-bold">{displayName}</h2>
									<span className="text-xs italic">Gratis</span>
								</div>
							);
						})() : ''}

					</div>
					{isSidebarExpanded && (
						<Separator className='w-full'/>
					)}

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
					<div className='py-2' onClick={() => signOut()}>
						<SideNavItem
							label="Cerrar Sesión"
							icon={LogOutIcon}
							path='#'
							active={false}
							isSidebarExpanded={isSidebarExpanded}
						/>
					</div>
					

					{/* Bottom */}
					<div id="settings" className='sticky mt-auto whitespace-nowrap mb-4 transition duration-200 block'>
						<SideNavItem
							label="Configuración"
							icon={Settings}
							path={pathname}
							active= {false}
							isSidebarExpanded={isSidebarExpanded}
							onClick={() => setShowSettingsDialog(true)}
						/>
					</div>
				</aside>

				<div className="mt-[20px] relative">
					<button
						type="button"
						className="z-50 absolute right-[-12px] flex h-6 w-6 items-center justify-center
						rounded-full shadow-xl transition-all duration-300 ease-in-out
						bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500
						hover:from-blue-500 hover:via-purple-500 hover:to-pink-500
						border-2 border-white animate-pulse ring-2 ring-blue-400/50 hover:ring-pink-400/70"
						onClick={toggleSidebar}
					>
						{isSidebarExpanded ? (
							<ChevronLeft size={16} className="stroke-white drop-shadow-lg" />
						) : (
							<ChevronRight size={16} className="stroke-white drop-shadow-lg" />
						)}
					</button>
				</div>
			</div>
			<SettingsDialog
				open={showSettingsDialog}
				onOpenChange={setShowSettingsDialog}
				selectedTab="general"
			/>
		</>
	  );
	}
	
	export const SideNavItem: React.FC<{
	  label: string;
	  icon: React.ElementType;
	  path: string;
	  active: boolean;
	  isSidebarExpanded: boolean;
	  onClick?: () => void;
	}> = ({ label, icon: Icon, path, active, isSidebarExpanded, onClick }) => {	  
	  return (
		<>
		  {isSidebarExpanded ? (
			<a
			  href={onClick ? '#' : path}
			  className={`h-full relative flex items-center whitespace-nowrap rounded-md ${
				active
				  ? 'font-base bg-neutral-200 shadow-sm text-neutral-700 dark:bg-neutral-800 dark:text-white'
				  : 'hover:bg-neutral-200 hover:text-neutral-700 text-neutral-500 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white'
			  }`}
			  onClick={(e) => {
				if (onClick) {
				  e.preventDefault();
				  onClick();
				}
			  }}
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
					href={onClick ? '#' : path}
					className={`h-full relative flex items-center whitespace-nowrap rounded-md ${
					  active
						? 'font-base text-[19px] bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-white'
						: 'hover:bg-neutral-200 hover:text-neutral-700 text-neutral-500 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white'
					}`}
					onClick={(e) => {
						if (onClick) {
						  e.preventDefault();
						  onClick();
						}
					}}
				  >
					<div className="relative font-base py-1.5 px-2 flex flex-row items-center rounded-md duration-100">
						<Icon/>
					</div>
				  </a>
				</TooltipTrigger>
				<Portal>
					<TooltipContent
						side="left"
						className="px-3 py-1.5 text-[15px] bg-white"
						sideOffset={10}
					>
						<span className='z-40'>{label}</span>
					</TooltipContent>
				</Portal>
				
			  </Tooltip>
			</TooltipProvider>
		  )}
		</>
	  );
	};


	 
export default Aside