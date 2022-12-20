type Message = {
	message_id :string, // the message unique id 

	from_user:string, // the user who will send or had send the message

	to_user:string, // the user  who will receive or had receive the message


	message_body:string, // message body it will be always a text it message_type=0 mean text message and if message_type has another value then it will carry the link of the file on the cloud storage server 

	message_time:string, // the time which message have been sended or inserted into database

	message_type:number, // message_type refer to the type of message , default value will be always zero , which mean text message , the anothers types of message values for now is under design and development 
	
	is_edited:0|1, // 0 mean not edited | 1 mean edited 
	
	is_deleted_for_user:0|1|2, // 0 mean no one delete it , 1 mean sender delete it for just himself , 2 mean receiver delete it for just himself
	
	message_status:0|1|2, // 0 mean sent , 1 mean deleivered to to_user , 2 mean seen by to_user 
	
	replay_message_id:string, // it will always equal to message_id if no replay , but if this message is a replay for another message then replay_message_id will equal the another message_id 
	
	react_from_user:number, // react will be a table of available reacts starting from one and every number rever to spefic react or emoj and it will be equal always 0 if there is no react from from_user (sender of message)
	
	react_to_user:number ,  // react will be a table of available reacts starting from one and every number rever to spefic react or emoj and it will be equal always 0 if there is no react from to_user (receiver of  the message)



}


export {Message}
