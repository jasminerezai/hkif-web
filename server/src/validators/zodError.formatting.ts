import { ZodError } from "zod";

export function parseZodError(error: ZodError): zodError[] {
    return error.issues.map(issue => ({
        field: issue.path.join("."),
        code: issue.code,
        message: issue.message,
    } satisfies zodError));
}

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



/*
function defineError(error: zodeError[]){
    let errMsg: string = "Bad Input: ";
    let errObj = {
        numOfErr: error.length,
        errors: []
    }
    error.forEach( err => {
        if( err.field === 'password'){
            if(err.code === 'too_small'){
                errMsg += "Password must be at least 8 characters!";
                errObj.errors.push( {field: err.field, type: err.code, message: "Password must be at least 8 characters!"})
            }
            if(err.code === 'invalid_type'){//means undefined in this case
                errMsg += "Please enter a Password";
            }
        }
        else if (err.field === 'email'){
            if(err.code === 'invalid_type'){//means undefined in this case
                errMsg += "Please enter an Email address";
            }
            if( err.code === 'invalid_format'){
                errMsg += "Please enter an Email address in the valid format: another@example.com"
            }
        }
    });
}*/
