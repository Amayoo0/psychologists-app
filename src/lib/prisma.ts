import { Prisma, PrismaClient } from '@prisma/client'
import { DynamicClientExtensionThis } from '@prisma/client/runtime/library';

const prismaClientSingleton = () => {
    return new PrismaClient();
}

declare const globalThis: {
    prismaGlobal: DynamicClientExtensionThis<
        Prisma.TypeMap<
            {
                result: {};
                model: {};
                query: {};
                client: {};
            },
            Prisma.PrismaClientOptions
        >,
        Prisma.TypeMapCb,
        {
            result: {};
            model: {};
            query: {};
            client: {};
        },
        {}
    >;
} & typeof global;

const prismaClient = globalThis.prismaGlobal ?? prismaClientSingleton();

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

if (process.env.NODE_ENV !== 'production' && !globalThis.prismaGlobal) {
    globalThis.prismaGlobal = extendedPrisma;
}
