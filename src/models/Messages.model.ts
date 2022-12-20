import {Message} from "../types/Message.type"
import {PoolConnection} from "mysql2/promise"
import {client} from "../database"
import { sqlParser } from "sql-map-easy"
import { v4 } from "uuid"
import { BlockLists} from "./BlockLists.model";


class Messages extends BlockLists {

	async MessageCount(connection:PoolConnection,user1:string,user2:string):Promise<number>{
		
		// @Counting Messages Between 2 Users  
		
		try{	
			const sqlQuery=sqlParser("SELECT COUNT(message_id) WHERE from_user=$1 AND to_user=$2 OR from_user=$2 AND to_user=$1  AS MessageCount ;",[user1,user2])
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

	async indexAllMessages(userWhoWantToIndexMessages:string ,theAnotherUser:string,offset:number = 0 ):Promise<Array<Message>>{
		try{
			// @Showing Messages Between Some User and The Another User 

			const connection = await client.getConnection();
			
			await this.seenMessageStatusHook(connection, userWhoWantToIndexMessages, theAnotherUser) // makeing the User Who Will Index The Messages Between Him and Other User  To Seen The the Other User Messages  
			
			const sqlQuery=sqlParser("SELECT LOWER(CONCAT(SUBSTR(HEX(message_id), 1, 8), '-',SUBSTR(HEX(message_id), 9, 4), '-',SUBSTR(HEX(message_id), 13, 4), '-',SUBSTR(HEX(message_id), 17, 4), '-',SUBSTR(HEX(message_id), 21))) AS message_id	,  LOWER(CONCAT(SUBSTR(HEX(replay_message_id), 1, 8), '-',SUBSTR(HEX(replay_message_id), 9, 4), '-',SUBSTR(HEX(replay_message_id), 13, 4), '-',SUBSTR(HEX(replay_message_id), 17, 4), '-',SUBSTR(HEX(replay_message_id), 21))) AS replay_message_id ,from_user,to_user,message_body,message_time,is_edited,message_type,is_deleted_for_user,message_status,react_from_user,react_to_user FROM Messages WHERE to_user=$1 AND from_user=$2 AND is_deleted_for_user <> 2 OR to_user=$2 AND from_user=$1 AND is_deleted_for_user <> 1 ORDER BY message_time DESC LIMIT $3,20 ; ",[userWhoWantToIndexMessages,theAnotherUser,offset])
			const messages=await connection.query(sqlQuery)	as unknown as Array<Array<Message>>[0]
			
			connection.release()
			return messages 
		}
		catch(err){
			throw new Error(`[-] Error While Indexing Messages : ${err}`)
		}
	}


	async isMessageExists(connection:PoolConnection,messageId:string,user1:string,user2:string):Promise<boolean>{
		try{
			
			// @ checking if message_id Exists and( user1=Messages.from_user and user2=Messages.to_user) or  (user1=Messages.to_user and user2=Messages.from_user) it wasn,t strict in checking because it just check if sender send a  spefic message or recieve it  
			// we need it while checking if a message Exists for replay between to user or delete message for spefic user 

			const sqlQuery=sqlParser("SELECT LOWER(CONCAT(SUBSTR(HEX(message_id), 1, 8), '-',SUBSTR(HEX(message_id), 9, 4), '-',SUBSTR(HEX(message_id), 13, 4), '-',SUBSTR(HEX(message_id), 17, 4), '-',SUBSTR(HEX(message_id), 21))) as message_id	FROM Messages WHERE message_id=UNHEX(REPLACE($1,'-','')) AND  from_user=$2 AND to_user=$3 OR from_user=$3 AND to_user=$2   ;",[messageId,user1,user2])
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




	async isMessageExistsStrict(connection:PoolConnection,messageId:string,sender:string,receiver:string):Promise<boolean>{
		try{

		// @ checking if message_id Exists and( receiver=Messages.from_user and sender=Messages.to_user)  it was strict in checking because it check  if sender send a  spefic message to receiver or not  


			const sqlQuery=sqlParser("SELECT LOWER(CONCAT(SUBSTR(HEX(message_id), 1, 8), '-',SUBSTR(HEX(message_id), 9, 4), '-',SUBSTR(HEX(message_id), 13, 4), '-',SUBSTR(HEX(message_id), 17, 4), '-',SUBSTR(HEX(message_id), 21))) AS message_id	FROM Messages WHERE message_id=UNHEX(REPLACE($1,'-',''))  AND from_user=$2 AND to_user=$3 ;",[messageId,sender,receiver])
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


	async getMessageInfo(user1:string,user2:string,messageId:string):Promise<Message>{
		try{

			// @ getting Message info between 2 Users if user1 is sender and user2 is receiver or vice versa   


			const connection = await client.getConnection();
			const sqlQuery=sqlParser("SELECT LOWER(CONCAT(SUBSTR(HEX(message_id), 1, 8), '-',SUBSTR(HEX(message_id), 9, 4), '-',SUBSTR(HEX(message_id), 13, 4), '-',SUBSTR(HEX(message_id), 17, 4), '-',SUBSTR(HEX(message_id), 21))) AS message_id	,  LOWER(CONCAT(SUBSTR(HEX(replay_message_id), 1, 8), '-',SUBSTR(HEX(replay_message_id), 9, 4), '-',SUBSTR(HEX(replay_message_id), 13, 4), '-',SUBSTR(HEX(replay_message_id), 17, 4), '-',SUBSTR(HEX(replay_message_id), 21))) AS replay_message_id ,from_user,to_user,message_body,message_time,is_edited,message_type,is_deleted_for_user,message_status,react_from_user,react_to_user FROM Messages WHERE  message_id=UNHEX(REPLACE($1,'-','')) AND from_user=$2 AND to_user=$1 OR  from_user=$1 AND to_user=$2  ; ",[messageId,user1,user2])
			const Message= await connection.query(sqlQuery) as unknown as  Array<Array<Message>>[0][0]
			connection.release()
			return Message 
		}
		catch(err){
			throw new Error(`[-] Error While Getting Message  Info: ${err} `)
		}
	}


	async sendMessage(sender:string,receiver:string,messageBody:string,replayMessageId?:string):Promise<boolean>{
		try{

			// @ sendeing Messages Between 2 Users 

			const connection = await client.getConnection();

			await this.seenMessageStatusHook(connection, sender, receiver) // Make The Sender See All Messages Which he didn,t see between him and receiver

			if( !  await this.isBlocked(connection, sender, receiver)){   // checking if sender blocked receiver or blocked from it

				const newMessageId=v4()  //	generateing Message uuidv4 on serverside  
				
				if(replayMessageId && ! await this.isMessageExists(connection, replayMessageId, sender, receiver)){ 

					// check if sender want to replay to another message or not and if sender want to replay to Another message then check if replay_message_id  between sender and receiver is Exists or not 
					
					connection.release()
					return false //if replay_message_id which given is not Exists then return false
				}
				else{
					replayMessageId=newMessageId

					// if sender don,t want to replay to another message then by default the new replay_message_id will have the same value of the new message_id 

				}
				const sqlQuery =sqlParser("INSERT INTO Messages(from_user,to_user,message_body,message_id,replay_message_id) VALUES($1,$2,$3,UNHEX(REPLACE($4,'-','')) , UNHEX(REPLACE($5,'-','')) ) ; ",[sender,receiver,messageBody,newMessageId,replayMessageId])
				await connection.query(sqlQuery);


				// checking if Message sended or not and if sended return true else return false

				if (await this.isMessageExistsStrict(connection, newMessageId,sender,receiver)){
					connection.release()
					return true;
				}
				else{
					connection.release()
					return false
				}
			}


			else{ 

				// if sender or receiver block either or each other then return false
				
				connection.release()
				return false
			}


		}
		catch(err){
			throw new Error(`[-] Error While Sending  Message : ${err} `)
		}
	}

	async updateMessageBody(sender:string,receiver:string,messageId:string,newMessageBody:string):Promise<Message|false>{
		try{


		// @ update MessageBody of spefic message_id sended by sender 
			
			
			const connection = await client.getConnection()
		
			await this.seenMessageStatusHook(connection, sender, receiver) // @ Make The sender see all Messages He Didn,t See from the receiver

			if(await this.isMessageExistsStrict(connection, messageId,sender,receiver)){ // @ check if sender already send it to the receiver or not 

				if( ! await this.isBlocked(connection, sender, receiver)){ // @check if sender is blocked from receiver or viceversa  

				const sqlQuery= sqlParser("UPDATE Messages SET message_body=$1,is_edited=1 WHERE message_id=UNHEX(REPLACE($2,'-','')) AND from_user=$3 AND to_user=$4 ;",[newMessageBody,messageId,sender,receiver])
				await connection.query(sqlQuery)
				connection.release()
				return (await this.getMessageInfo(messageId, sender, receiver)) // return the new Message after Updateing 
				}
				else{
					
					// return false because sender or receiver was blocked 

					connection.release()
					return false
				}
			}
			else{

				// return false because Message not Exists or because User Doesn,t Have Permission to Update it(user didn,t send it )
				
				connection.release()
				return false
			}
		}
		catch(err){
			throw new Error(`[-] Error While Updateing Message Body : ${err}`)
		}
	}


	async reactMessage(reactSender:string,reactReceiver:string,messageId:string,reactValue:number):Promise<Message|false>{
		try{

			// @reactMessage will make sender  or user2 react the message by a reactValue : number , which assign to react_from_user or react_to_user depend on the user
			
			const connection = await client.getConnection(); 
			
			await this.seenMessageStatusHook(connection, reactSender, reactReceiver) // the user who  want to react then the spefic  message will see all the messages of the another user

			if(await this.isMessageExists(connection, messageId, reactSender, reactReceiver) && ! await this.isBlocked(connection, reactSender, reactReceiver)){ 
				
				//checking if message Exists and the sender and receiver didn,t block each other
				
				let messageInfo= await this.getMessageInfo(reactSender, reactReceiver, messageId) // getting messageInfo to determine who will react the message the sender of message or receiver ? 

				//if (from_user=reactSenderand to_user=reactReceiver ) then the react will be from the sender mean react_from_user

				if (messageInfo.from_user==reactSender && messageInfo.to_user==reactReceiver && messageInfo.is_deleted_for_user !==1 ){
					const sqlQuery=sqlParser("UPDATE Messages SET react_from_user=$1 WHERE message_id=UNHEX(REPLACE($2,'-','')) AND from_user=$3 AND to_user=$4 ; ",[reactValue,messageId,reactSender,reactReceiver])
					await connection.query(sqlQuery)

					messageInfo= await this.getMessageInfo(reactSender, reactReceiver, messageId) // getting messageInfo to determine if react operation success ? 

					if(messageInfo.react_from_user===reactValue){ // checking if react operation success? return true if success , else return false
							connection.release()
							return messageInfo
					}
					else{
							connection.release()
							return false
					}
				}




				//if (from_user=reactReceiver and to_user=reactSender ) then the react will be from the receiver mean react_to_user

				else if(messageInfo.from_user==reactReceiver && messageInfo.to_user==reactSender && messageInfo.is_deleted_for_user !==2 ){
						const sqlQuery=sqlParser("UPDATE Messages SET react_to_user=$1 WHERE message_id=UNHEX(REPLACE($2,'-','')) AND from_user=$3 AND to_user=$4 ; ",[reactValue,messageId,reactReceiver,reactSender])
						await connection.query(sqlQuery)

						messageInfo= await this.getMessageInfo(reactSender , reactReceiver , messageId) // getting messageInfo to determine if react operation success ? 

						if(messageInfo.react_to_user===reactValue){ // checking if react operation success? return true if success , else return false
							connection.release()
							return messageInfo
						}
						else{
							connection.release()
							return false
						}

				}
				
				else{
					// We Will return false because it mean there is a possible error because how from_user or to_user not equal sender or receiver or viceversa ? 
					connection.release()
					return false

				}
				
				}
			else{
				// return false because Message not Exists between receiver and sender or sender blocked by receiver or viceversa 
				connection.release()
				return false
			}
		}
		catch(err){

			throw new Error(`[-] Error While Reacting Message : ${err}`)
		}
	}




	async deleteMessageForOneUser(userWhoWantToDelete:string,theAnotherUser:string,messageId:string):Promise<boolean>{
		try{
				const connection=await client.getConnection()
				
				await this.seenMessageStatusHook(connection, userWhoWantToDelete, theAnotherUser) //userWhoWantToDelete will see all Messages from theAnotherUser	

				if(await this.isMessageExists(connection, messageId, userWhoWantToDelete, theAnotherUser)){ //checking if message Exists and sended by sender to receiver or viceversa 
					

					let messageInfo=await this.getMessageInfo(userWhoWantToDelete, theAnotherUser, messageId) //getting Messages info 
					

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
						
						// Deleting For Every One and Check if DeletingForEveryOne is Done Successfully or not and if success return true else return false  
						
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
					// Message Doesn,t Exists or User Doesn,t Have Permission to delete it for him self because he didn,t send or receiver this message
					connection.release()
					return false
				}

		}
		catch(err){
			throw new Error(`[-] Error While Deleting Message For User : ${err}`)
		}

	}





	async deleteMessageForEveryOne(sender:string,receiver:string,messageId:string):Promise<boolean>{
		try{
			// @ deleteing message for every one by sender of the message  


			const connection = await client.getConnection();
			await this.seenMessageStatusHook(connection, sender, receiver) // userWhoWantToDelete will see all Messages from theAnotherUser	


			if (await this.isMessageExistsStrict(connection, messageId,sender,receiver)){ // checking if sender send this message to receiver 

				if(! await this.isBlocked(connection, sender, receiver)){  //  @check if sender is blocked from receiver or viceversa 


					const sqlQuery=sqlParser(`DELETE FROM Messages WHERE message_id=UNHEX(REPLACE($1,'-','')) AND from_user=$2 AND to_user=$3 OR from_user=$3 AND to_user=$2 ;`,[messageId,sender,receiver])
					await connection.query(sqlQuery);
					if(await this.isMessageExistsStrict(connection, messageId,sender,receiver)){ // check if sender already send it to the receiver or not  
						connection.release()
						return false // return false because message  Exists and not deleted  
					}
					else{
						connection.release()
						return true // return true mean the operation of deleteMessageForEveryOne success 
					}
				}
				else{
					connection.release()
					return false // sender is blocked from receiver or viceversa so he can,t delete his messages  so return false
				}
			}
			else{		
				connection.release() // message not Exists or Exists but sender didn,t send it so he can,t delete it so return false
				return false
			}
		}
		catch(err){
			throw new Error(`[-] Error While Deleting   Message : ${err} `)
		}

	}

}


export { Messages}

