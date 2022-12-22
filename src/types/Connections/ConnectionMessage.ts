import {signUpConnectionMessage} from "./signUpConnectionMessage"
import { loginConnectionMessage } from "./loginConnectionMessage"
import { indexMessagesConnectionMessage } from "./indexMessagesConnectionMessage"
import { sendMessageConnection } from "./sendMessageConnection"
type ConnectionMessage = {
	connectionMessageType:string,
	connectionTime:string,
	connectionMessageBody:loginConnectionMessage|signUpConnectionMessage|indexMessagesConnectionMessage|sendMessageConnection
}

export {ConnectionMessage} 
