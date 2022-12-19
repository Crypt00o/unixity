CREATE TABLE IF NOT EXISTS Chats(
chat_id  BINARY(16) UNIQUE NOT NULL,
last_message_id BINARY(16) UNIQUE NOT NULL  ,
from_user  VARCHAR(64) NOT NULL,
to_user VARCHAR(64) NOT NULL,
FOREIGN KEY( to_user ) REFERENCES  Users(username),
FOREIGN KEY( from_user ) REFERENCES  Users(username),
FOREIGN KEY( last_message_id ) REFERENCES  Messages(message_id),
PRIMARY KEY(chat_id)
);
