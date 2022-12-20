import {Message} from "../types/Message.type"
import {PoolConnection} from "mysql2/promise"
import {client} from "../database"
import { sqlParser } from "sql-map-easy"
import { v4 } from "uuid"
import { BlockLists} from "./BlockLists.model";


class Messages extends BlockLists {

	async MessageCount(connection:PoolConnection,fromUser:string,toUser:string):Promise<number>{
		
		// @Counting Messages Between 2 Users  
		
		try{	
			const sqlQuery=sqlParser("SELECT COUNT(message_id) WHERE from_user=$1 AND to_user=$2 OR from_user=$2 AND to_user=$1  AS MessageCount ;",[fromUser,toUser])
			const messagesCounter= (await connection.query(sqlQuery) as unknown as  Array<Array<{MessageCount:string}>>[0][0]).MessageCount
			return parseInt(messagesCounter)  
		}
		catch(err){
			throw new Error(`[-] Error While Counting Messages : ${err}`)
		}
	}

	async seenMessageStatusHook(connection:PoolConnection,userWhoWillSeeMessage:string,theAnotherUser:string):Promise<void>{
		try{

			// @Seen Message Hook to Changeing status of Message from sent or deleliverd to Seen 
			
			const sqlQuery= sqlParser("UPDATE Messages SET message_status=2 WHERE from_user=$1 AND to_user=$2 AND message_status <> 2;",[theAnotherUser,userWhoWillSeeMessage])
			await connection.query(sqlQuery)
		}
		catch(err){
			throw new Error(`[-] Error While Changeing Message Status to Seen : ${err} `)
		}

	}

	async indexAllMessages(user:string ,theAnotherUser:string,offset:number = 0 ):Promise<Array<Message>>{
		try{
			// @Showing Messages Between Some User and The Another User 

			const connection = await client.getConnection();
			
			await this.seenMessageStatusHook(connection, user, theAnotherUser) // makeing the User Who Will Index The Messages Between Him and Other User  To See  
			
			const sqlQuery=sqlParser("SELECT LOWER(CONCAT(SUBSTR(HEX(message_id), 1, 8), '-',SUBSTR(HEX(message_id), 9, 4), '-',SUBSTR(HEX(message_id), 13, 4), '-',SUBSTR(HEX(message_id), 17, 4), '-',SUBSTR(HEX(message_id), 21))) AS message_id	,  LOWER(CONCAT(SUBSTR(HEX(replay_message_id), 1, 8), '-',SUBSTR(HEX(replay_message_id), 9, 4), '-',SUBSTR(HEX(replay_message_id), 13, 4), '-',SUBSTR(HEX(replay_message_id), 17, 4), '-',SUBSTR(HEX(replay_message_id), 21))) AS replay_message_id ,from_user,to_user,message_body,message_time,is_edited,message_type,is_deleted_for_user,message_status,react_from_user,react_to_user FROM Messages WHERE to_user=$1 AND from_user=$2 OR to_user=$2 AND from_user=$1 ORDER BY message_time DESC LIMIT $3,20 ; ",[user,theAnotherUser,offset])
			const messages=await connection.query(sqlQuery)	as unknown as Array<Array<Message>>[0]
			
			connection.release()
			return messages 
		}
		catch(err){
			throw new Error(`[-] Error While Indexing Messages : ${err}`)
		}
	}


	async isMessageExists(connection:PoolConnection,messageId:string,fromUser:string,toUser:string):Promise<boolean>{
		try{
			const sqlQuery=sqlParser("SELECT LOWER(CONCAT(SUBSTR(HEX(message_id), 1, 8), '-',SUBSTR(HEX(message_id), 9, 4), '-',SUBSTR(HEX(message_id), 13, 4), '-',SUBSTR(HEX(message_id), 17, 4), '-',SUBSTR(HEX(message_id), 21))) as message_id	FROM Messages WHERE message_id=UNHEX(REPLACE($1,'-','')) AND  from_user=$2 AND to_user=$3 OR from_user=$3 AND to_user=$2   ;",[messageId,fromUser,toUser])
			const result= await connection.query(sqlQuery ) as unknown as Array<Array<{message_id:string}>>
			if (result[0].length==0){
				return false
			}
			else{
				return true
			}
		}
		catch(err){
			throw new Error(`[-] Error While Checking If Message Exists For Replay or Not : ${err}`)
		}
	}




	async isMessageExistsStrict(connection:PoolConnection,messageId:string,fromUser:string,toUser:string):Promise<boolean>{
		try{
			const sqlQuery=sqlParser("SELECT LOWER(CONCAT(SUBSTR(HEX(message_id), 1, 8), '-',SUBSTR(HEX(message_id), 9, 4), '-',SUBSTR(HEX(message_id), 13, 4), '-',SUBSTR(HEX(message_id), 17, 4), '-',SUBSTR(HEX(message_id), 21))) AS message_id	FROM Messages WHERE message_id=UNHEX(REPLACE($1,'-',''))  AND from_user=$2 AND to_user=$3 ;",[messageId,fromUser,toUser])
			console.log(sqlQuery)
			const result= await connection.query(sqlQuery ) as unknown as  Array<Array<{message_id:string}>>
			if (result[0].length==0){
				return false
			}
			else{
				return true
			}
		}
		catch(err){
			throw new Error(`[-] Error While Checking If Message Exists or Not : ${err}`)
		}
	}


	async getMessageInfo(fromUser:string,toUser:string,messageId:string):Promise<Message>{
		try{
			const connection = await client.getConnection();
			const sqlQuery=sqlParser("SELECT LOWER(CONCAT(SUBSTR(HEX(message_id), 1, 8), '-',SUBSTR(HEX(message_id), 9, 4), '-',SUBSTR(HEX(message_id), 13, 4), '-',SUBSTR(HEX(message_id), 17, 4), '-',SUBSTR(HEX(message_id), 21))) AS message_id	,  LOWER(CONCAT(SUBSTR(HEX(replay_message_id), 1, 8), '-',SUBSTR(HEX(replay_message_id), 9, 4), '-',SUBSTR(HEX(replay_message_id), 13, 4), '-',SUBSTR(HEX(replay_message_id), 17, 4), '-',SUBSTR(HEX(replay_message_id), 21))) AS replay_message_id ,from_user,to_user,message_body,message_time,is_edited,message_type,is_deleted_for_user,message_status,react_from_user,react_to_user FROM Messages WHERE  message_id=UNHEX(REPLACE($1,'-','')) AND from_user=$2 AND to_user=$1 OR  from_user=$1 AND to_user=$2  ; ",[messageId,fromUser,toUser])
			const Message= await connection.query(sqlQuery) as unknown as  Array<Array<Message>>[0][0]
			connection.release()
			return Message 
		}
		catch(err){
			throw new Error(`[-] Error While Getting Message  Info: ${err} `)
		}
	}


	async sendMessage(fromUser:string,toUser:string,messageBody:string,replayMessageId?:string):Promise<boolean>{
		try{
			const connection = await client.getConnection();
			await this.seenMessageStatusHook(connection, fromUser, toUser)
			if( !  await this.isBlocked(connection, fromUser, toUser)){
				const newMessageId=v4()
				if(replayMessageId && ! await this.isMessageExists(connection, replayMessageId, fromUser, toUser)){
					connection.release()
					return false
				}
				else{
					replayMessageId=newMessageId
				}
				const sqlQuery =sqlParser("INSERT INTO Messages(from_user,to_user,message_body,message_id,replay_message_id) VALUES($1,$2,$3,UNHEX(REPLACE($4,'-','')) , UNHEX(REPLACE($5,'-','')) ) ; ",[fromUser,toUser,messageBody,newMessageId,replayMessageId])
				await connection.query(sqlQuery);
				if (await this.isMessageExistsStrict(connection, newMessageId,fromUser,toUser)){
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

	async updateMessageBody(fromUser:string,toUser:string,messageId:string,newMessageBody:string):Promise<Message|false>{
		try{
			const connection = await client.getConnection()


			await this.seenMessageStatusHook(connection, fromUser, toUser)  //
			if(await this.isMessageExistsStrict(connection, messageId,fromUser,toUser)){
				if( ! await this.isBlocked(connection, fromUser, toUser)){
				const sqlQuery= sqlParser("UPDATE Messages SET message_body=$1,is_edited=1 WHERE message_id=UNHEX(REPLACE($2,'-','')) AND from_user=$3 AND to_user=$4 ;",[newMessageBody,messageId,fromUser,toUser])
				await connection.query(sqlQuery)
				await this.seenMessageStatusHook(connection, fromUser, toUser)
				connection.release()
				return (await this.getMessageInfo(messageId, fromUser, toUser)) 
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
			throw new Error(`[-] Error While Updateing Message Body : ${err}`)
		}
	}


	async reactMessage(fromUser:string,toUser:string,messageId:string,react:number){
		

	}




	async deleteMessageForOneUser(userWhoWantToDelete:string,theAnotherUser:string,messageId:string):Promise<boolean>{
		try{
				const connection=await client.getConnection()
				
				await this.seenMessageStatusHook(connection, userWhoWantToDelete, theAnotherUser) //userWhoWantToDelete will see all Messages from theAnotherUser	

				if(await this.isMessageExists(connection, messageId, userWhoWantToDelete, theAnotherUser)){
					

					let messageInfo=await this.getMessageInfo(userWhoWantToDelete, theAnotherUser, messageId)
					

					let delete_for_user:0|1|2; 

					// is_deleted_for_user = 0 when no one delete it and =1 if sender delete it and =2 if receiver delete it and if the 2 users delete it then it will deleted from database . 	

					if (messageInfo.is_deleted_for_user===0){ 

							// if : the 2 users didn,t delete messsage then : it will remove for the userWhoWantToDelete only , Else : it will be removed for every one 
							if(messageInfo.from_user==userWhoWantToDelete && messageInfo.to_user==theAnotherUser){

								delete_for_user=1 // mean will be deleted for sender because he want to delete it
							}

							else{

								delete_for_user=2 // mean will be deleted for receiver because he want to delete it
						
							}

							const sqlQuery = sqlParser("UPDATE Messages SET is_deleted_for_user=$1 WHERE message_id=UNHEX(REPLACE($2,'-','')) AND from_user=$3 OR to_user=$3 ; ",[delete_for_user,messageId,userWhoWantToDelete])
							await connection.query(sqlQuery);


							messageInfo=await this.getMessageInfo(userWhoWantToDelete,theAnotherUser , messageId) //getting Message Info To Ensure That it Deleted Successfully for the userWhoWantToDelete
					
							if (messageInfo.is_deleted_for_user=delete_for_user){ // Checking if userWhoWantToDelete have Delete the Message for him 
								connection.release()
								return true
							}
							else{
								connection.release()
								return false
							}

					}

					else{
						
						// Deleting For Every One and Check if DeletingForEveryOne is Done Successfully or not 
						
						if (await this.deleteMessageForEveryOne(messageInfo.from_user, messageInfo.to_user, messageInfo.message_id)){
							connection.release()
							return true
						}
						else{
							connection.release()
							return false
						}
					}
				}
				else{
					connection.release()
					return false
				}

		}
		catch(err){
			throw new Error(`[-] Error While Deleting Message For User : ${err}`)
		}

	}





	async deleteMessageForEveryOne(fromUser:string,toUser:string,messageId:string):Promise<boolean>{
		try{
			const connection = await client.getConnection();
			await this.seenMessageStatusHook(connection, fromUser, toUser)
			if (await this.isMessageExistsStrict(connection, messageId,fromUser,toUser)){
				if(! await this.isBlocked(connection, fromUser, toUser)){
					const sqlQuery=sqlParser(`DELETE FROM Messages WHERE message_id=UNHEX(REPLACE($1,'-','')) WHERE from_user=$2 AND to_user=$3 ;`,[messageId,fromUser,toUser])
					await connection.query(sqlQuery);
					if(await this.isMessageExistsStrict(connection, messageId,fromUser,toUser)){
						connection.release()
						return false
					}
					else{
						connection.release()
						return true
					}
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
			throw new Error(`[-] Error While Deleting   Message : ${err} `)
		}

	}

}


export { Messages}

