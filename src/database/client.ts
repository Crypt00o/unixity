 import {createPool} from "mysql2/promise"
 import {MYSQL_HOST,MYSQL_PORT,MYSQL_DB,MYSQL_USER,MYSQL_PASS} from "../config"


 const client = createPool({
	 "host":MYSQL_HOST,
	 "port":parseInt(MYSQL_PORT as string),
	 "database":MYSQL_DB,
	 "user":MYSQL_USER,
	 "password":MYSQL_PASS,
	 "connectionLimit":50
 })

 export {client}





