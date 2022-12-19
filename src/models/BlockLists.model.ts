import {PoolConnection} from "mysql2/promise";
import {client} from "../database"
import {sqlParser} from "sql-map-easy"
import {BlockList} from "../types/BlockList.type"


class BlockLists {

	async isInBlockList(connection:PoolConnection,blocker:string,blocked:string):Promise<boolean>{
		try{
			const sqlQuery=sqlParser('SELECT * FROM BlockList WHERE blocker=$1 AND blocked=$2 ;',[blocker,blocked])
			const result= await connection.query(sqlQuery) as Array<Array<unknown>>
			if (result[0].length==0){
				return false
			}
			else {
				return true
			}
		}
		catch(err){
			throw new Error(`[-] Error While Checking if User in Blocklist : ${err}`)
		}
	}

	async isBlocked(connection:PoolConnection,blocker:string,blocked:string):Promise<boolean>{
		try{
			const sqlQuery=sqlParser('SELECT * FROM BlockList WHERE blocker=$1 AND blocked=$2 OR blocker=$2 AND blocked=$1 ;',[blocker,blocked])
			const result= await connection.query(sqlQuery) as Array<Array<unknown>>
			if (result[0].length==0){
				return false
			}
			else {
				return true
			}
		}
		catch(err){
			throw new Error(`[-] Error While Checking if Sender Block from Receiver or viceversa :  ${err}`)
		}

	}



	async getBlockListForUser(userId:string):Promise<Array<BlockList>>{
		try{
			const connection = await client.getConnection()
			const sqlQuery=sqlParser('SELECT * FROM BlockList WHERE blocker=$1 ;', [userId] )
			const blockList= await connection.query(sqlQuery) as Array<Array<unknown>>
			connection.release()
			return blockList[0] as Array<BlockList>
		}
		catch(err){
			throw new Error(`[-] Error While Getting User,s BlockList : ${err}`)
		}

	}


	

	async blockUser(blocker:string,blocked:string):Promise<boolean>{
		try{
			const connection= await client.getConnection()
			if(await this.isInBlockList(connection, blocker, blocked)){
				connection.release()
				return false
			}
			else{
				const sqlQuery=sqlParser("INSERT INTO BlockList(blocker,blocked) VALUES($1,$2) ; " ,[blocker,blocked])
				await connection.query(sqlQuery);
				if (await this.isInBlockList(connection, blocker, blocked) ){
					connection.release()
					return true;
				}
				else {
					connection.release()
					return false
				}
				
			}

		}
		catch(err){
				throw new Error(`[-] Error While Blocking User : ${err}`)
		}


	}

	async unBlockUser(blocker:string,blocked:string):Promise<boolean>{
		try{
		const connection= await client.getConnection()
			if(await this.isInBlockList(connection, blocker, blocked)){
				const sqlQuery=sqlParser("DELETE  FROM BlockList WHERE blocker=$1 AND blocked=$2 ; " ,[blocker,blocked])
				await connection.query(sqlQuery);
				if (await this.isInBlockList(connection, blocker, blocked) ){
					connection.release()
					return false;
				}
				else {
					connection.release()
					return true
				}
			}
			else{
				connection.release()
				return false

			}	
		}
		catch(err){
				throw new Error(`[-] Error While UnBlocking User : ${err}`)
		}
	}



}



export {BlockLists}
