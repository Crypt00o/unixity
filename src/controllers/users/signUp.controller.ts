import {Users} from "../../models/Users.model"
import {User} from "../../types/User.type"
import {signUpConnectionMessage} from "../../types/Connections/signUpConnectionMessage"
import {verifynewUserData} from "../../utils/validator"
import {UnixityWsSocket} from "unixityelite-ws"



async function signUp(clientSocket:UnixityWsSocket,userInfo:signUpConnectionMessage){

	try{
		const user = new Users()
		const newUser:User={
			username:userInfo.username,
			email:userInfo.email,
			password:userInfo.password,
			firstname:userInfo.password,
			lastname:userInfo.lastname,
			bio:(userInfo.bio? userInfo.bio:null)
		}
		
		const validateResult=verifynewUserData(newUser)
		if(validateResult.error ){
			clientSocket.sendJson(validateResult)	
			return
		}
		else{
			await user.createUser(newUser)
			clientSocket.sendJson({
				Message:"Success, You Can Now LogIn With Your New UserName or Email"
			})
		}
	}
	catch(err){
			clientSocket.sendJson({"error":"true","error-type":"SIGNUP ERROR","error-message":"User Or Email Exists"})
	}
}
export { signUp }
