import { ZodError } from "zod";
import {zodError} from "../types/index.js";

export function parseZodError(error: ZodError): zodError[] {
    return error.issues.map(issue => ({
        field: issue.path.join("."),
        code: issue.code,
        message: issue.message,
    } satisfies zodError));
}
