import {PrismaClientKnownRequestError} from "@prisma/client/runtime/client";

export function prismaErrorFormatter(error: PrismaClientKnownRequestError) {
    const driverAdaptErr = error.meta?.driverAdapterError as any;
    const simpleErr =  {
        code: error.code,
        name: driverAdaptErr.cause.kind,
        fields: driverAdaptErr.cause.constraint.fields,
        table: error.meta?.modelName,
        message: driverAdaptErr.cause.originalMessage
    }
    return simpleErr;
}