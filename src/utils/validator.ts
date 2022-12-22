import { User } from "../types/User.type"
import { validationResult } from "../types/validationResult"


function verifybyRegex(toVerify:unknown,regex:RegExp):boolean{
	return regex.test(String(toVerify))
}

const emailRegex=/^(?:[A-Z\d][A-Z\d_-]{5,10}|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4})$/i
const usernameRegex=/^[a-z0-9]+$/i



function verifynewUserData(newUser:User):validationResult{

	let newValidationResult={
		error:false,
		email:"",
		username:"",
		firstname:"",
		lastname:"",
		password:"",
		bio:""
	}

	if( ! verifybyRegex(newUser.email, emailRegex) ){
		newValidationResult.error=true
		newValidationResult.email="This Email is not valid !"
	}

	if( ! newUser.password || String(newUser.password).length < 8 ){
		newValidationResult.error=true
		newValidationResult.password="This Password is To Short !"
	}

	
	if( ! newUser.username || ! verifybyRegex(newUser.username, usernameRegex) ){
		newValidationResult.error=true
		newValidationResult.username="This Username is not valid !"	
	}

	if( ! newUser.firstname || String(newUser.firstname).length > 32 ){
		newValidationResult.error=true
		newValidationResult.firstname="This Firstname Length is not valid !"
	}
	
	if(  ! newUser.lastname  && String(newUser.lastname).length > 32 ){	
		newValidationResult.error=true
		newValidationResult.lastname="This Lastname Length is not valid !"
	}

	if( !  newUser.bio ||  String(newUser.bio).length > 150 ){
		newValidationResult.error=true
		newValidationResult.bio="This Bio Length is too Big !"
	}
	



	return newValidationResult

}


export { verifynewUserData } 

