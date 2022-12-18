 CREATE TABLE IF NOT EXISTS Messages(
message_id INT AUTO_INCREMENT NOT NULL,
from_user VARCHAR(64) NOT NULL,
to_user VARCHAR(64) NOT NULL,
message_body TEXT NOT NULL,
message_time TIMESTAMP NOT NULL DEFAULT NOW(),
is_edited BOOLEAN DEFAULT FALSE,
FOREIGN KEY(to_user) REFERENCES Users(username),
FOREIGN KEY(from_user) REFERENCES Users(username),
PRIMARY KEY(message_id)
);
