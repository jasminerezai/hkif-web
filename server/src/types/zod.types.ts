/**
 * A bit simpler than an entire ZodError.
 * NOTE THAT THE FIRST LETTER IS A SMALL Z!!!!
 * ONLY DIFFERENCE TO THE ORIGINAL ZodError
 */
export interface zodError {
    field: string,
    code: string,
    message: string
}