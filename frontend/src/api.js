import axios from 'axios'
import { REFRESH_TOKEN,ACCESS_TOKEN,BASE_URL } from './constant'



const api = axios.create({
    baseURL:BASE_URL,
    headers:{
        'content-type':'application/json'
    }
})


api.interceptors.request.use(  
    (config)=>{
     const token = localStorage.getItem(ACCESS_TOKEN)
     if(token){
        config.headers.Authorization = `Bearer ${token}`
     }
     return config
    },
    (error) => {
        return Promise.reject(error)
    }   
)

api.interceptors.response.use(
    (response)=>{
        return response
    },
    (error)=>{
        const {response} = error
        if(response.status === 401){
            localStorage.removeItem(ACCESS_TOKEN)
        }
        throw error     
    }
 )  
export default api