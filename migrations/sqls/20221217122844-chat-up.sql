CREATE TABLE IF NOT EXISTS Chats(
chat_id BINARY(16) NOT NULL ,
last_message_id BINARY(16) NOT NULL ,
from_user  BINARY(16) NOT NULL,
to_user BINARY(16) NOT NULL,
FOREIGN KEY( to_user ) REFFERENCE Users(username),
FOREIGN KEY( from_user ) REFFERENCE Users(username),
FOREIGN KEY( last_message ) REFFERENCE Messages(message_id)
);
