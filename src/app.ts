import express, { Application} from 'express'
import * as dotenv from 'dotenv'
import {myCustomizedLogger} from './middlewares/mylogger.middleware'
import helmet from 'helmet'
import router from './routes/index'
import bodyParser from 'body-parser'
import {client} from "./database/index"
import { createServer } from 'http'
import { Server } from 'socket.io'
import {NODE_ENV,PORT} from './config'
import {Socket} from 'socket.io'
import {allowOrigins} from './middlewares/AllowOrigins.middleware'

dotenv.config()

const app: Application = express()


// Useing BodyParser

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())



//Logging Http Requests With My Customized MiddleWare

if(NODE_ENV=='dev'){

app.use(myCustomizedLogger)

app.use(allowOrigins)

}
else{
	//Secure Http Headers & Filters 
    	app.use(helmet())

}

// Useing Routes And Api

app.use(router)

// starting Server







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

// Createing An Htto Server Useing  Express App Instance

const server = createServer(app)

// Createing An Websocket Instance over Http Server 

const webSocketServer=new Server(server)

webSocketServer.on("connection",(socket:Socket)=>{
	
	if(NODE_ENV=="dev"){
		console.log(`[+] Haveing A New Connection : ${socket.id}`)
		socket.on("disconnect",()=>{
			console.log(`${socket.id} Has Been disconnected [-] `)
		})
	}
})



server.listen(PORT || 3000, () => {
  console.log(`[+] Server Listening Now at Port : ${PORT} `)
})

export default app



