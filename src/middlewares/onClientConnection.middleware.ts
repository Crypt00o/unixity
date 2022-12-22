import {NODE_ENV} from "../config"
import {clientSocket} from "../controllers/Main"
function onClientConnection(){
	if(NODE_ENV=="dev"){
		console.log(`[+] Connection Successfull from ${clientSocket.connectionId}`)
	}
	else{
		
		// another code for production

	}
	
}

export {onClientConnection}
