import {NODE_ENV} from "../config"
import {clientSocket} from "../controllers/Main"
function onCloseConnection(disconnectionCode:number,disconnectionReason:Buffer){
	if(NODE_ENV=="dev"){
		console.log(`[-] client ${clientSocket.connectionId} disconnected ,code :${disconnectionCode} , disconnectionReason :${disconnectionReason.toString()} `)
	}
	else{
		
		// another code for production

	}
	
}

export {onCloseConnection}
