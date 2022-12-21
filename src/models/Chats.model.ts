import {PoolConnection} from "mysql2/promise"
import { client } from "../database" 
import { Chat } from "../types/Chat.type"
import { Messages } from "./Messages.model"
import { Message } from "../types/Message.type"
import {sqlParser} from "sql-map-easy"





class Chats extends Messages {

	async indexAllChatForSpeficUser(userId:string):Promise<Array<Chat>>{
		try{
			const connection = await client.getConnection()
			const sqlQuery = sqlParser("SELECT LOWER(CONCAT( SUBSTR(HEX(chat_id),1,8),'-',SUBSTR(HEX(chat_id),9,4),'-',SUBSTR(HEX(chat_id),13,4),'-',SUBSTR(HEX(chat_id),17,4),'-',SUBSTR(HEX(chat_id),21,12) ))  AS chat_id , LOWER(CONCAT( SUBSTR(HEX(last_message_id),1,8),'-',SUBSTR(HEX(last_message_id),9,4),'-',SUBSTR(HEX(last_message_id),13,4),'-',SUBSTR(HEX(last_message_id),17,4),'-',SUBSTR(HEX(last_message_id),21,12) )) AS last_message_id, from_user,to_user FROM Chats WHERE from_user=$1 OR to_user=$1 ; ",[userId])
			const chats = await connection.query(sqlQuery) as Array<Array<unknown>>
			return chats[0] as Array<Chat>
		}
		catch(err){
			throw new Error(`[-] Error While Indexing Chat for User ${userId} : ${err}`)
		}
	}
/*

	async getChatInfo(chatId:string):Promise<Chat>{
		
		try {
		const connection = await client.getConnection()
		const sqlQuery = sqlParser("SELECT LOWER(CONCAT( SUBSTR(HEX(chat_id),1,8),'-',SUBSTR(HEX(chat_id),9,4),'-',SUBSTR(HEX(chat_id),13,4),'-',SUBSTR(HEX(chat_id),17,4),'-',SUBSTR(HEX(chat_id),21,12) ))  AS chat_id , LOWER(CONCAT( SUBSTR(HEX(last_message_id),1,8),'-',SUBSTR(HEX(last_message_id),9,4),'-',SUBSTR(HEX(last_message_id),13,4),'-',SUBSTR(HEX(last_message_id),17,4),'-',SUBSTR(HEX(last_message_id),21,12) )) AS last_message_id, from_user,to_user FROM Chats  WHERE chat_id=UNHEX(REPLACE($1,'-',''))  ; ",[chatId])
		const chatInfo=await connection.query(sqlQuery) as Array<Array<unknown>>
		return ge
		}
	}

	
*/
}
