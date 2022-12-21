CREATE TABLE IF NOT EXISTS BlockList(

	blocker VARCHAR(64) NOT NULL, -- the username of blocker and it was a foreignkey Users(username)

	blocked VARCHAR(64) NOT NULL, -- the username of user who blocked by blocker and it was a foreignkey Users(username)

	block_date TIMESTAMP NOT NULL  DEFAULT(CURRENT_TIMESTAMP()), -- the block date when blocker block blocked user

	FOREIGN KEY(blocker) REFERENCES Users(username),
	FOREIGN KEY(blocked) REFERENCES Users(username),
	PRIMARY KEY(blocker,blocked)
);
