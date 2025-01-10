import { Avatar } from "@/components/ui/avatar"
import { SignOutButton } from "@clerk/nextjs"
import { Table2 } from "lucide-react"
import Link from "next/link"

const Header = () => {
	const name = 'Amira Domingos'

    return (
        <header className="w-full h-12 bg-foreground text-background flex items-center p-4 gap-1 shadow-lg justify-between">
            <div id="left" className="flex space-x-4">
                <Table2 size={24}/>
                <h1 className="font-medium text-xl">PsyApp</h1>
            </div>

            <div id="right" className="flex items-center pl-4 ">
                <Avatar>
                    <div className="w-full h-full bg-foreground text-background flex items-center justify-center font-medium text-xl float-right">
                        {name.split(' ')[0][0].toUpperCase()}{name.split(' ')[1][0].toUpperCase()}
                    </div>	
                </Avatar>
                <SignOutButton/>
                {/* <div className="p-4 flex flex-col">
                    <h2 className="text-lg font-bold">Amira Domingos</h2>
                    <span className="text-xs italic">Gratis</span>
                </div> */}
            </div>
        </header>
    )
}

export default Header