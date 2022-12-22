import { ConnectionMessage } from "../types/Connections/ConnectionMessage"
import { clientSocket } from "../controllers/Main"
import { Binary2Json } from "unixityelite-ws"
import {connectionMessageMapper} from "./ConnectionMapper"




async function router(connectionMessage:Buffer|ArrayBuffer|Buffer[]){

	try{
		const parsedConnectionMessage:ConnectionMessage<object> =Binary2Json(connectionMessage)
	
		if(parsedConnectionMessage.connectionMessageType &&  connectionMessageMapper.has(parsedConnectionMessage.connectionMessageType)){
			(connectionMessageMapper.get(parsedConnectionMessage.connectionMessageType) as Function) (clientSocket,parsedConnectionMessage.connectionMessageBody)	
			}
		else{
			clientSocket.sendJson({message:"Welcome To Unixity Chat Server "})
		}
	}
	catch(err){
		clientSocket.sendJson({error:true,message:String(err)})
	}
}

export {router }
