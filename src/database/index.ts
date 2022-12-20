import *   as simpleClient from "./client";
import * as secureClient from "./secure_client";
import { NODE_ENV } from "../config";
import {Pool} from "mysql2/promise";

let client:Pool;
switch(NODE_ENV){
	case  "dev" || "DEV" || "development":
		client=simpleClient.client
		break;
	case "prod" || "PROD" || "production":
		client=secureClient.client
		break;
	case "test" || "TEST"|| "testing":
		client=simpleClient.client
		break;
	default:
		client=simpleClient.client
}


export {client}

