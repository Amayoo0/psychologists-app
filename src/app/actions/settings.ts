'use server'
import { prisma } from '@/lib/prisma'
import { currentUser, User } from '@clerk/nextjs/server'
import { Settings } from '@prisma/client'

export async function getSettings(): Promise<Settings | null> {
    try {
        const user = await currentUser()
        if (!user) {
          return null
        }
        const prismaUser = await prisma.user.findUnique({
            where: {
                authId: user.id
            }
        })
        if (!prismaUser) {
            return null
        }
        const settings = await prisma.settings.findUnique({
            where: {
                userId: prismaUser.id,
            },
        });
        return settings;
    } catch (error) {
        console.error('Error retrieving settings:', error);
        throw new Error('Could not retrieve settings');
    }
}

export async function saveSettings(newSettings: Partial<Settings>): Promise<Settings> {
    try {
        const user = await currentUser()
        if (!user) {
            throw new Error('User not authenticated')
        }
        const prismaUser = await prisma.user.findUnique({
            where: {
                authId: user.id
            }
        })
        if (!prismaUser) {
            throw new Error('User not found')
        }
        const updatedSettings = await prisma.settings.update({
            where: {
                userId: prismaUser.id,
            },
            data: newSettings,
        });
        console.log('updatedSettings', updatedSettings);
        return updatedSettings;
    } catch (error) {
        console.error('Error saving settings:', error);
        throw new Error('Could not save settings');
    }
}