import {signUp} from "../controllers/users/signUp.controller"
const connectionMessageMapper:Map<string,Function>=new Map<string,Function>()
connectionMessageMapper.set("SIGNUP", signUp)
export {connectionMessageMapper}

