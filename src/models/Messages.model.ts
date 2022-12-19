import {Message} from "../types/Message.type"
import {PoolConnection} from "mysql2/promise"
import {client} from "../database"
import { sqlParser } from "sql-map-easy"
import { v4 } from "uuid"

class Messages {

	async MessageCount(connection:PoolConnection,fromUser:string,toUser:string):Promise<number>{

		try{	
			const sqlQuery=sqlParser("SELECT COUNT(message_id) WHERE from_user=$1 AND to_user=$2 OR from_user=$2 AND to_user=$1  AS MessageCount ;",[fromUser,toUser])
			const messagesCounter= await connection.query(sqlQuery) as unknown as  Array<Array<{MessageCount:string}>>
			return parseInt(messagesCounter[0][0].MessageCount)  
		}
		catch(err){
			throw new Error(`[-] Error While Counting Messages : ${err}`)
		}
	}



	async indexAllMessages(offset: number =0,fromUser:string ,toUser:string ):Promise<Message[]>{
		try{
			const connection = await client.getConnection();
			const sqlQuery=sqlParser("SELECT LOWER(CONCAT(SUBSTR(HEX(message_id), 1, 8), '-',SUBSTR(HEX(message_id), 9, 4), '-',SUBSTR(HEX(message_id), 13, 4), '-',SUBSTR(HEX(message_id), 17, 4), '-',SUBSTR(HEX(message_id), 21))) as message_id	,from_user,to_user,message_body,message_time,is_edited FROM Messages WHERE to_user=$1 AND from_user=$2 OR to_user=$2 AND from_user=$1 ORDER BY message_time DESC LIMIT $3,20 ; ",[fromUser,toUser,offset])
			const messages=await connection.query(sqlQuery)	as Array<Array<unknown>>
			connection.release()
			return messages[0] as Message[]
		}
		catch(err){
			throw new Error(`[-] Error While Indexing Messages : ${err}`)
		}
	}

	async isMessageExists(connection:PoolConnection,messageId:string):Promise<boolean>{
		try{
			const sqlQuery=sqlParser("SELECT LOWER(CONCAT(SUBSTR(HEX(message_id), 1, 8), '-',SUBSTR(HEX(message_id), 9, 4), '-',SUBSTR(HEX(message_id), 13, 4), '-',SUBSTR(HEX(message_id), 17, 4), '-',SUBSTR(HEX(message_id), 21))) as message_id	FROM Messages WHERE message_id=UNHEX(REPLACE($1,'-','')) ;",[messageId])
			const result= await connection.query(sqlQuery ) as Array<Array<unknown>>
			if (result[0].length==0){
				return false
			}
			else{
				return true
			}
		}
		catch(err){
			throw new Error(`[-] Error While Checking If Message Sended or Not : ${err}`)
		}
	}


	async showMessage(messageId:string):Promise<Message>{
		try{
			const connection = await client.getConnection();
			const sqlQuery=sqlParser("SELECT LOWER(CONCAT( SUBSTR(HEX(message_id),1,8),'-',SUBSTR(HEX(message_id),9,4),'-',SUBSTR(HEX(message_id),13,4),'-',SUBSTR(HEX(message_id),17,4),'-',SUBSTR(HEX(message_id),21,12)  )) AS message_id ,from_user,to_user,message_body,message_time,is_edited  FROM Messages WHERE  message_id=UNHEX(REPLACE($1,'-','')) ; ",[messageId])
			const Message= await connection.query(sqlQuery) as Array<Array<unknown>>
			connection.release()
			return Message[0][0] as Message
		}
		catch(err){
			throw new Error(`[-] Error While Getting Message  Info: ${err} `)
		}
	}


	async sendMessage(messageBody:string,fromUser:string,toUser:string):Promise<boolean>{
		try{
			const connection = await client.getConnection();
			if(true /* replace me with isUserBlocked? Function */){
				const newMessageId=v4()
				const sqlQuery =sqlParser("INSERT INTO Messages(from_user,to_user,message_body,message_id) VALUES($1,$2,$3,UNHEX(REPLACE($4,'-','')) ) ; ",[fromUser,toUser,messageBody,newMessageId])
				await connection.query(sqlQuery);
				if (await this.isMessageExists(connection, newMessageId)){
					connection.release()
					return true;
				}
				else{
					connection.release()
					return false
				}
			}
			else{
				connection.release()
				return false
			}
		}
		catch(err){
			throw new Error(`[-] Error While Sending  Message : ${err} `)
		}
	}

	async updateMessageBody(newMessageBody:string,messageId:string):Promise<Message|false>{
		try{
			const connection = await client.getConnection()
			if(await this.isMessageExists(connection, messageId)){	
				const sqlQuery= sqlParser("UPDATE Messages SET message_body=$1,is_edited=1 WHERE message_id=UNHEX(REPLACE($2,'-',''));",[newMessageBody,messageId])
				await connection.query(sqlQuery)
				connection.release()
				return (await this.showMessage(messageId)) 
			}
			else{
				return false
			}
		}
		catch(err){
			throw new Error(`[-] Error While Updateing Messageing Body : ${err}`)
		}
	}


	async deleteMessage(messageId:string):Promise<boolean>{
		try{
			const connection = await client.getConnection();
			if (await this.isMessageExists(connection, messageId)){
				const sqlQuery=sqlParser(`DELETE FROM Messages WHERE message_id=UNHEX(REPLACE($1,'-','')) ;`,[messageId])
				await connection.query(sqlQuery);
				return true
				connection.release()
			}
			else{		
				connection.release()
				return false
			}
		}
		catch(err){
			throw new Error(`[-] Error While Deleting   Message : ${err} `)
		}

	}

}


export { Messages}

