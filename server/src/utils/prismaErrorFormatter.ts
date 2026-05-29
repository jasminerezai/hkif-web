import { Prisma } from '../generated/prisma/index.js';

export function prismaErrorFormatter(error: Prisma.PrismaClientKnownRequestError): {error: string, statusCode: number} {
    const nicerMsg = error.message.split('\n');
    const simpleErr =  {
        code: error.code,
        message: nicerMsg[nicerMsg.length - 1] ?? error.message
    }
    const errObject = {
        error: `${simpleErr.code} : ${simpleErr.message}`,
        statusCode: 400
    }
    const codeAsNum: number = Number(simpleErr.code.slice(1));

    // Reference: https://www.prisma.io/docs/orm/reference/error-reference
    const statusMap: Record<number, number> = {
        2001: 404, 2002: 409, 2003: 400, 2014: 409,
        2015: 404, 2016: 404, 2018: 404, 2021: 404, 2022: 404,
        2024: 500, 2025: 404, 2026: 500, 2027: 500, 2028: 500, 2030: 404,
    };
    errObject.statusCode = statusMap[codeAsNum] ?? (codeAsNum > 2030 ? 500 : 400);
    return errObject;
}
