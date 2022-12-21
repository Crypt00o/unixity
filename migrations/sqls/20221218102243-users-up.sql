CREATE TABLE IF NOT EXISTS Users (

	username  VARCHAR(64) NOT NULL, -- Unique Id of User it contaon only alphabats or numbers only and it is not case senstive, and it was the primary key

	password VARCHAR(61) NOT NULL , -- password size after hash
	
	email VARCHAR(64)  NOT NULL UNIQUE , -- email and it was Unique 

	firstname VARCHAR(32) NOT NULL , -- firstname 

	lastname VARCHAR(32) NOT NULL , -- lastname

	bio VARCHAR(150) DEFAULT(NULL) , -- bio contain info about user or notes

	activity_status TINYINT(1) UNSIGNED NOT NULL DEFAULT(0), -- it is avalue between 1 , 0  value 1 mean active or online , 0 mean offline  


	last_activity_time TIMESTAMP NOT NULL DEFAULT(CURRENT_TIMESTAMP()), -- it contain the last time user was online 


	profile_photo VARCHAR(12) DEFAULT(NULL) , -- contain  the filename of userphoto on cloud storage server , contain NULL if user doesn,t upload a profile photo 

	PRIMARY KEY(username)
);
