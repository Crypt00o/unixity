type User={
username : string, // Unique Id of User it contaon only alphabats or numbers only and it is not case senstive, and it was the primary key


password : string,  //user password 
	
email : string , // usermail Unique

firstname : string, //user firstname

lastname : string, //user lastname

bio ?: string|null, // userbio default null if there is no bio


activity_status?:0|1, // it is avalue between 1 , 0  value 1 mean active or online , 0 mean offline 

last_activity_time?:string, // last activity of user before being offline 


profile_photo?:string|null, //the name of file of user profile photo stored on cloud storage server

}

export {User}
