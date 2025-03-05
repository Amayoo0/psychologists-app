import { prisma } from "@/lib/prisma"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { NextResponse } from "next/server"

export async function GET(request: Request){
    const user = await currentUser()

    if (!user) {
        return redirect('/sign-in')
    }

    const email = user.emailAddresses[0].emailAddress
    const name = user.fullName

    try {
        const prismaUser = await prisma.user.findUnique({
            where: {
                authId: user.id
            }
        })
        if (prismaUser){
            return NextResponse.redirect(new URL('/dashboard', new URL(request.url).origin))
        }
        const newPrismaUser = await prisma.user.create({
            data: {
                authId: user.id,
                email: email,
                name: name
            },
        })
        await prisma.settings.create({
            data: {
                userId: newPrismaUser.id,
                showWeekends: true,
                preferredView: 'month',
                workDayStart: 540,
                workDayEnd: 1080,
                cellSize: 60,
                internalPassword: '',
            }
        })
        return NextResponse.redirect(new URL('/dashboard', new URL(request.url).origin))
    } catch {
        return new Response('Error creating user', { status: 500 })
    }
}