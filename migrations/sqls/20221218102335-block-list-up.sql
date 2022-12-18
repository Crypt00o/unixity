CREATE TABLE IF NOT EXISTS BlockList(
	blocker VARCHAR(64) NOT NULL,
	blocked VARCHAR(64) NOT NULL,
	FOREIGN KEY(blocker) REFERENCES Users(username),
	FOREIGN  KEY(blocked) REFERENCES Users(username),
	block_date TIMESTAMP NOT NULL  DEFAULT NOW(),
	PRIMARY KEY(blocker,blocked)
);
