import {createContext, useContext, useEffect, useState} from 'react';
import { useHistory } from 'react-router-dom';

const ChatContext = createContext();

const ChatProvider = ({children})=>{
    const history = useHistory();
    
    const [user, setUser] = useState();
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState();
    const [notification, setNotification] = useState([]);

    useEffect(()=>{
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        setUser(userInfo);
        if(history && !userInfo){
            history.push('/');
        }
    },[history]);

    return (
        <ChatContext.Provider value={{user, setUser, chats, setChats, selectedChat, setSelectedChat, notification, setNotification}}>
            {children}
        </ChatContext.Provider>
    )
}

export const ChatState = ()=>{
    return useContext(ChatContext);
}


export default ChatProvider;