import {config} from "dotenv"

config()

let MYSQL_DB :string ; 

const {
	NODE_ENV,
	PORT,
	MYSQL_HOST,
	MYSQL_PORT,
	MYSQL_USER,
	MYSQL_PASS,
	MYSQL_PROD_DB,
	MYSQL_TEST_DB,
	MYSQL_DEV_DB,
	JWT_SECRET,
	BCRYPT_PEPPER,
	SALT_ROUND
} =process.env


switch (NODE_ENV){

case "prod"|| "production":
	MYSQL_DB=MYSQL_PROD_DB as string;
	break;


case "test" || "testing":
	MYSQL_DB=MYSQL_TEST_DB as string;
	break;

case "dev" ||  "development" :
	MYSQL_DB=MYSQL_DEV_DB as string;
	break;

default :
	MYSQL_DB=MYSQL_DEV_DB as string;

}




export {
NODE_ENV,
PORT,
MYSQL_HOST,
MYSQL_PORT,
MYSQL_DB,
MYSQL_USER,
MYSQL_PASS,
BCRYPT_PEPPER,
JWT_SECRET,
SALT_ROUND
}
