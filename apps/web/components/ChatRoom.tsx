import axios from "axios";
import { BACKEND_URL } from "../app/config";
import { ChatRoomClient } from "./ChatRoomClient";

async function getChats(roomId:string){
  const res=await axios.get(`${BACKEND_URL}/chats/${roomId}`)
  return res.data.messages

}
export async function ChatRoom({id}:{
  id:string
}) {

  const chats=await getChats(id)
  return <ChatRoomClient messages={chats} id={id}/>
  
}