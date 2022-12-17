CREATE TABLE IF NOT EXISTS Users (
	username  VARCHAR(64) NOT NULL,
	password VARCHAR(61) NOT NULL ,
	email VARCHAR(64)  NOT NULL UNIQUE CHECK(email like '%_@__%.__%') ,
	firstname VARCHAR(32) NOT NULL ,
	lastname VARCHAR(32) NOT NULL ,
	bio VARCHAR(180) DEFAULT NULL ,
	PRIMARY KEY(username)
);

