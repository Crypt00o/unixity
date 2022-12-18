import {Message} from "../types/Message.type"
import {PoolConnection} from "mysql2/promise"
import {client} from "../database"
import { sqlParser } from "sql-map-easy"

const l:Message={}

class Messages{
	async index(offset: number =10,fromUser:string ,toUser:string ){
		const connection = await client.getConnection();
	const	sqlQuery=sqlParser("SELECT * FROM Messages WHERE to_user=$1 and from_user=$2 or to_user=$2 and from_user=$1 ; ",[fromUser,toUser])
	const 

	}


}
