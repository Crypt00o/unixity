import {onCloseConnection} from "../middlewares/onCloseConnection.middleware"
import {onClientConnection} from "../middlewares/onClientConnection.middleware"


import { router } from "../routes"
import { UnixityWsSocket } from "unixityelite-ws"

import {createUnixityWs} from "unixityelite-ws"
import {WebSocketServer} from "ws"

let clientSocket:UnixityWsSocket

function main(server:WebSocketServer){
	
	server.on("connection",(socket:UnixityWsSocket)=>{
		
		clientSocket=createUnixityWs(socket)
		
		onClientConnection()

		socket.on("message",router)
		
		socket.on("close",onCloseConnection)

	})




}

export { main ,clientSocket}
