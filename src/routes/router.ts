import { ConnectionMessage } from "../types/Connections/ConnectionMessage"
import { signUp } from "../controllers/users/signUp.controller"
import {signUpConnectionMessage} from "../types/Connections/signUpConnectionMessage"
import { clientSocket } from "../controllers/Main"
import { Binary2Json } from "unixityelite-ws"

async function router(connectionMessage:Buffer|ArrayBuffer|Buffer[]){
	try{
		const parsedConnectionMessage:ConnectionMessage=Binary2Json(connectionMessage)
		if(parsedConnectionMessage.connectionMessageType){
			switch(String(parsedConnectionMessage.connectionMessageType).toUpperCase()){
			case("SIGNUP"):
				console.log(parsedConnectionMessage)
				await signUp(clientSocket,parsedConnectionMessage.connectionMessageBody as signUpConnectionMessage)					
				break
			default: //

			}

			}
		
		else{


		}
	}
	catch(err){
		clientSocket.sendJson({"error":"true",message:String(err)})
	}
}

export {router }
