type ConnectionMessage<T> = {
	connectionMessageType:string,
	connectionTime:string,
	connectionMessageBody:T,
}

export {ConnectionMessage} 
