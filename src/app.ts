import express, { Application} from 'express'
import * as dotenv from 'dotenv'
import {myCustomizedLogger} from './middlewares/mylogger.middleware'
import helmet from 'helmet'
import router from './routes/index'
import bodyParser from 'body-parser'
import {client} from "./database"

dotenv.config()

const app: Application = express()

// Useing BodyParser

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


//Secure Http Headers With By Setting Some  Verious Values And Xss Filter

//app.use(helmet())
app.use(helmet({contentSecurityPolicy:false}))

//Logging Http Requests With My Customized MiddleWare

if(process.env.NODE_ENV='dev'){

app.use(myCustomizedLogger)

}

// Useing Routes And Api

app.use(router)

// starting Server

const PORT: string | number = process.env.PORT || 3000 ;





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
app.listen(PORT, () => {
  console.log(`[+] Server Listening Now at Port : ${PORT} `)
})

export default app



