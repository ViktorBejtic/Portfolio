import axios from 'axios';

interface Server {
    id: number;
    name: string;
    avatar: string;
    private: boolean;
    role: string;
    userid: number;
  }

type Dictionary<T> = {
[key: string]: T;
};

export async function callAxios( body: Dictionary<string|number|boolean>|{}, url : string){
    let callResponse = null;

    await axios.post('http://127.0.0.1:3333/'+url,body,{
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('bearer'),
            'Content-Type': 'application/json'
        }
    }).then((response) => {
        callResponse = response.data;
    }).catch((err) => {
    });
   

    return callResponse;
}

export const commandHandler = async (messageInput: string, activeServer : Server) => {

    const splitMessage = messageInput.split(' ');


    if (splitMessage[0] === '/cancel'){
        
        if (activeServer.role !== 'creator'){

            try{        

                const body : Dictionary<number> = {
                    serverId: activeServer.id
                }    
                callAxios(body, 'server/leave-server');

            }catch(err){
            }


            return true;

        }else{

            try{            
                await axios.post('http://127.0.0.1:3333/server/delete-server',{
                    serverId: activeServer.id
                },{
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('bearer'),
                        'Content-Type': 'application/json'
                    }
                })

                return true;
            }catch(err){
            }

            return true;
        }
            
    }else if (splitMessage[0] === '/list'){
        return true;
    }else if (splitMessage[0] === '/join'){
        if (splitMessage[splitMessage.length - 1 ].includes('private')){
            try{
                const body : Dictionary<string | boolean> = {
                    name: splitMessage[1],
                    privacy: true
                }

                callAxios(body, 'server/create-server');
                
            }catch(err){
            }
        }else{
            try{
                const body : Dictionary<string | boolean> = {
                    servername: splitMessage[1],
                    name: splitMessage[1],
                    privacy: false
                }

                await callAxios(body, 'server/join-server');
               
                return true;

            }catch(err){
            }
        }

        return true;
    }else if (splitMessage[0] === '/invite'){

            try{
                const body : Dictionary<string | number> = {
                    serverId: activeServer.id,
                    invitedusername: splitMessage[1]
                }

                callAxios(body, 'server-invite/create-server-invite');

            }catch(err){
            }

            return true;

    }else if (splitMessage[0] === '/revoke'){
        try{
            const body : Dictionary<number | string> = {
                serverId: activeServer.id,
                memberLogin: splitMessage[1]
            }

            callAxios(body, 'server/revoke-user')

        }catch(err){
        }

        return true;
    }else if (splitMessage[0] === '/kick'){
        try{
            const body : Dictionary<number | string | boolean> = {
                serverId: activeServer.id,
                memberId: splitMessage[1],
                command: true
            }

            callAxios(body, 'server/kick-server-member')

        }catch(err){
            console.error(err);
        }

        return true;
    }else if (splitMessage[0] === '/quit'){
        try{
            const body : Dictionary<number> = {
                serverId: activeServer.id
            }

            callAxios(body, 'server/delete-server')

        }catch(err){
        }

        return true;
    }
    
    return false;
};

export const showMemberListExternal = ( messageInput: string ) =>{
    const splitMessage = messageInput.split(' ');

    if (splitMessage[0] === '/list'){
        return true;
    }else{
        return false;
    }
}

export default callAxios;