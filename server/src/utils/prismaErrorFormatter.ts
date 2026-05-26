import { Prisma } from '../generated/prisma/index.js';

export function prismaErrorFormatter(error: Prisma.PrismaClientKnownRequestError): {error: object, statusCode: number} {
    const driverAdaptErr = error.meta?.driverAdapterError as any;
    const nicerMsg = error.message.split('\n');
    const simpleErr =  {
        code: error.code,
        name: driverAdaptErr?.cause.kind ?? error.code,
        // fields: driverAdaptErr?.cause?.constraint?.fields ?? error.meta?.field_name,
        message: nicerMsg[nicerMsg.length - 1] //driverAdaptErr?.cause?.originalMessage ??
    }
    const errObject = {
        error: simpleErr,
        statusCode: 400
    }
    const codeAsNum: number = Number(simpleErr.code.slice(1));
    // Reference: https://www.prisma.io/docs/orm/reference/error-reference
    switch(true){
        // "The record searched for in the where condition ({model_name}.{argument_name} = {argument_value}) does not exist"
        case codeAsNum===2001:
            errObject.statusCode = 404;
            break;

        // "Unique constraint failed on the {constraint}"
        case codeAsNum===2002:
            errObject.statusCode = 409;
            break;

        // "Foreign key constraint failed on the field: {field_name}"
        case codeAsNum===2003:
            errObject.statusCode = 409;
            break;

        //"The change you are trying to make would violate the required relation '{relation_name}' between the {model_a_name} and {model_b_name} models."
        case codeAsNum===2014:
            errObject.statusCode = 409;
            break;

        // "A related record could not be found. {details}"
        case codeAsNum===2015:
            errObject.statusCode = 404;
            break;

        // "The required connected records were not found. {details}"
        case codeAsNum===2018:
            errObject.statusCode = 404;
            break;

        // "The table {table} does not exist in the current database."
        case codeAsNum===2021:
            errObject.statusCode = 404;
            break;

        // "The column {column} does not exist in the current database."
        case codeAsNum===2022:
            errObject.statusCode = 404;
            break;

        // P2024 : "Timed out fetching a new connection from the connection pool.  --> 500
        case codeAsNum===2024:
            errObject.statusCode = 500;
            break;

        // "An operation failed because it depends on one or more records that were required but not found. {cause}"
        case codeAsNum===2025:
            errObject.statusCode= 404;
            break;

        // P2026 : "The current database provider doesn't support a feature that the query used: {feature}" --> 500
        case codeAsNum===2026:
            errObject.statusCode = 500;
            break;

        // P2027 : "Multiple errors occurred on the database during query execution: {errors}" --> 500
        case codeAsNum===2027:
            errObject.statusCode = 500;
            break;

        // P2028 : "Transaction API error: {error}" --> 500
        case codeAsNum===2028:
            errObject.statusCode = 500;
            break;
        // P2030 : "Cannot find a fulltext index to use for the search, try adding a @@fulltext([Fields...]) to your schema" --> 404
        case codeAsNum===2030:
            errObject.statusCode = 404;
            break;

        // any error > P2030 --> 500
        case codeAsNum>2030:
            errObject.statusCode = 500;
            break;
    }
    return errObject;
}