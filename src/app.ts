import {config}  from 'dotenv'
import {client} from "./database/index"
import {NODE_ENV,PORT} from './config'
import {WebSocketServer,WebSocket} from "ws"

import {main} from "./controllers/Main"


import {v4} from "uuid"


config()



async function testDatabaseConnection(){
	try {
		const connection= await  client.getConnection();
		const connectionTime=await (connection.query( "SELECT now() as TestConnectionTime;")) as unknown as Array<Array<{TestConnectionTime:string}>> ;
		connection.release();
		console.log(`[+] Connected Successfully To Database at ${connectionTime[0][0].TestConnectionTime } `)
	
	}
	catch(err){
		console.log(`[-] Error Connection Not Success To Database , Error : ${err}  `)
		console.log("[+] Retrying to Connect Database after 5 Seconds")
		setTimeout(testDatabaseConnection,5000) 

	}
}

testDatabaseConnection();




const server= new WebSocketServer({
	port:parseInt(PORT as string),
	clientTracking:true
	})

main(server)

export {server}




