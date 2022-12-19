import {User} from "../types/User.type"
import { hashPass,checkPass } from "../utils/passCrypto"
import {client} from "../database"
import {SqlMap} from "sql-map-easy"
import {PoolConnection} from "mysql2/promise"

class Users {

	async indexAllUsers() : Promise<Array<User>>{
		try{
			const connection=await client.getConnection();
			const result = await connection.query("SELECT username,email,firstname,lastname,bio FROM Users;") as Array<Array<unknown>>
			connection.release();
			return result[0] as Array<User>
		}
		catch(err){
			throw new Error(`[-] Error While Indexing Users ${err}`)
		}

	}


	async showUserInfo(username:string) : Promise<User>{
		try{
			const connection=await client.getConnection();
			const sqlQuery=SqlMap.sqlParser("SELECT username,email,firstname,lastname,bio FROM Users WHERE username=$1 ; ",[username]);
			const result =await connection.query(sqlQuery) as Array<Array<unknown>>;
			connection.release();
			return result[0][0]  as User
		}
		catch(err){
			throw new Error(`[-] Error While Show User ${err}`)
		}

	}


	async checkUserAvailableity( connection:PoolConnection, username:string,email?:string) : Promise<false|User>{
		try{
			const sqlQuery=SqlMap.sqlParser("SELECT username,email,firstname,lastname,bio,password FROM Users WHERE username=$1 OR email=$2 ; ",[username,email]);
			const result =await connection.query(sqlQuery) as Array<Array<unknown>>;
			if (result[0].length==0){
				return false
			}
			else{
				return result[0][0] as User
			}
		}
		catch(err){
			throw new Error(`[-] Error While Check User Avialablity ${err}`)
		}
	}






	async deleteUser(username:string) : Promise<boolean>{
		try{
			const connection=await client.getConnection();
			if (await this.checkUserAvailableity(connection, username)){
				const sqlQuery=SqlMap.sqlParser("DELETE FROM Users WHERE username=$1",[username])
				const result=await connection.query(sqlQuery)
				connection.release()
				return true
			}
			else{
				return false		
			}
		}
		catch(err){
			throw new Error(`[-] Error While Deleteing This User : ${err}`)
		}

	}



	async createUser(newUser:User):Promise<User>{
		try{
			const connection=await client.getConnection()

			if (await this.checkUserAvailableity(connection,newUser.username)){
				throw new Error(`[-]Error Can,t Create User , User ${newUser.username} Exists `)
			}
			else {
				const sqlQuery=SqlMap.sqlParser("INSERT INTO Users(username,email,password,firstname,lastname,bio) VALUES($1,$2,$3,$4,$5,$6);",
											   [newUser.username,newUser.email,hashPass(newUser.password),newUser.firstname,newUser.lastname,newUser.bio])
				await connection.query(sqlQuery);
				return newUser;
			}
			
		}
		catch(err){
				throw new Error(`[-]Error Can,t Create User ${newUser.username} : ${err}`)
		}

	}




	async updateUser(newUserData:User,username:string) : Promise<User>{
		try{
			const connection=await client.getConnection();
				if(await this.checkUserAvailableity(connection, username)){
					if (newUserData.username!==username && await this.checkUserAvailableity(connection,newUserData.username)){
						throw new Error (`[-] Error  Can,t Update Username : ${username} With : ${newUserData.username} Because ${newUserData.username}  it,s Already Exists `)
					}
					const sqlQuery=SqlMap.sqlParser("UPDATE Users SET username=$1,email=$2,password=$3,firstname=$4,lastname=$5,bio=$6 WHERE username=$7",
						[newUserData.username,newUserData.email,newUserData.password,newUserData.firstname,newUserData.lastname,newUserData.bio])
					connection.release()
					return newUserData;
				}
				else{
					throw new Error("[-] Error While Update User Not Found ")
				}
		}
		catch(err){
			
				throw new Error(`[-] Error While Update ${err} `)

		}

	}



	async login(idenity:string , plainPassword:string) : Promise<string|false>{
		try{
			const connection = await client.getConnection();
			const user:User|false= await this.checkUserAvailableity(connection,idenity,idenity)
			if(user){
					if(checkPass(plainPassword,user.password)){
						connection.release()
						return user.username
					}
					else{
						connection.release()
						return false
					}
			}
				else{
				connection.release()
				throw new Error (`[-] Error Not Valid Username or Email : ${idenity}`)
				}
		}
		catch(err){
			throw new Error (`[-] Error While Authenticating User : ${err}`)
		}

	}






}


export {Users}
