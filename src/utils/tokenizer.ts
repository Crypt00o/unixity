import { verify,sign } from "jsonwebtoken";
import {JWT_SECRET} from "../config"


function createToken(identity:string):string|false{
	try{
		return sign({identity:identity},JWT_SECRET as string)
	}
	catch(err){
		console.log(`[-] Error While Createing JWT token : {err}`)
		return false
	}
}


function verifyToken(token:string,identity:string):true|false{
	try{	
		const tokendentity:{identity:string}=verify(token,JWT_SECRET as string ) as {identity:string}
		if( tokendentity.identity == identity){
			return true
		}
		else{
			return false
		}

	}
	catch(err){
		return false
	}

}

export{verifyToken,createToken}
