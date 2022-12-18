import {BCRYPT_PEPPER,SALT_ROUND} from "../config"
import {hashSync,compareSync} from "bcrypt"

function hashPass(plainPassword:string):string{
	plainPassword=plainPassword.concat(BCRYPT_PEPPER as string)
	return hashSync(plainPassword,parseInt(SALT_ROUND as string))
}

function checkPass(plainPassword:string,hashedPassword:string):boolean{
	plainPassword=plainPassword.concat((BCRYPT_PEPPER as string))
	return compareSync(plainPassword,hashedPassword)
}

export {hashPass,checkPass}



