import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

// Crea el cliente libsql usando las variables de entorno de Turso
const libsql = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
})
  
// Instancia el adaptador de Turso para Prisma
const adapter = new PrismaLibSQL(libsql)

// Crea una función que devuelve una instancia de PrismaClient pasando el adaptador
const prismaClientSingleton = () => {
	if (process.env.NODE_ENV === 'production') {
		return new PrismaClient({ adapter })
	} else {
		return new PrismaClient()
	}
}

const prismaClient = prismaClientSingleton();

export const extendedPrisma = prismaClient.$extends({
    query: {
      async $allOperations({ operation, model, args, query }) {
        const start = performance.now()
        const result = await query(args)
        const end = performance.now()
        const duration = end - start
        
        const writeOperations = ['create', 'update', 'delete'];
        if (model !== 'History' && 
            writeOperations.includes(operation)
        ) {
            // UserId should be propagated injecting this data in a context
            const currentUser = args?.where?.userId || args?.data?.userId || 'unknown';

            // Create a registry in History table
            await prismaClient.history.create({
                data: {
                    model:      model ?? 'unknown',
                    action:     operation,
                    affectedId: result?.id ? String(result.id) : 'unknown',
                    userId:     String(currentUser),
                    duration,
                },
            });

        }
        return result
      },
    },
});

export const prisma = extendedPrisma