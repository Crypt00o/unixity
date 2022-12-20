 CREATE TABLE IF NOT EXISTS Messages(
	message_id  BINARY(16) UNIQUE NOT NULL, -- the message unique id v4 , 128bit  
	
	from_user VARCHAR(64) NOT NULL, -- the user who will send or had send the message , foreignkey Users(username)

	to_user VARCHAR(64) NOT NULL CHECK(from_user <> to_user),  -- the user who will receive or had received the message , foreignkey Users(username) & not equal from_user , so no one can message him self

	message_body TEXT NOT NULL, -- message body it will be always a text it message_type=0 mean text message and if message_type has another value then it will carry the link of the file on the cloud storage server


	message_type TINYINT UNSIGNED NOT NULL DEFAULT(0), -- message_type refer to the type of message , default value will be always zero , which mean text message , the anothers types of message values for now is under design and development 

	message_time TIMESTAMP NOT NULL DEFAULT(NOW()), -- the time which message have been sended or inserted into database



	is_edited TINYINT(1) UNSIGNED NOT NULL  DEFAULT(0), -- 0 mean not edited | 1 mean edited 


	message_status  TINYINT(1) UNSIGNED  NOT NULL DEFAULT(0), -- 0 mean sent , 1 mean deleivered to to_user , 2 mean seen by to_user 


	is_deleted_for_user  TINYINT(1) UNSIGNED NOT NULL DEFAULT(0), -- 0 mean no one delete it , 1 mean sender delete it for just himself , 2 mean receiver delete it for just himself



	replay_message_id BINARY(16) NOT NULL DEFAULT(message_id), -- it will always equal to message_id if no replay , but if this message is a replay for another message then replay_message_id will equal the another message_id foreignkey Messages(message_id)



	react_from_user SMALLINT UNSIGNED NOT NULL DEFAULT(0), -- react will be a table of available reacts starting from one and every number refer to spefic react or emoj and it will be equal always 0 if there is no react from from_user (sender of message)



	react_to_user SMALLINT UNSIGNED NOT NULL DEFAULT(0), -- react will be a table of available reacts starting from one and every number refer to spefic react or emoj and it will be equal always 0 if there is no react from to_user (receiver of  the message)
 

	FOREIGN KEY(replay_message_id) REFERENCES Messages(message_id),
	FOREIGN KEY(to_user) REFERENCES Users(username),
	FOREIGN KEY(from_user) REFERENCES Users(username),
	PRIMARY KEY(message_id)
);

