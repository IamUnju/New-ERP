import { createContext, useEffect, useState } from "react";
import api from "../api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constant";

export const UserContext = createContext(null);

export const UserContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);



    /*===============================
       get the profile data
    ================================*/

    const fetchProfile = async()=>{
        const response = await api.get('/api/v1/users/me/')
        if (response.status === 200 && response.data){
            const normalizedRoles = (response.data.roles || []).map(r => r.toLowerCase());
            setUser({
                "user_id": response.data.user_id,
                "username": response.data.username,
                "roles": normalizedRoles,
            })
            setRoles(normalizedRoles)
            setPermissions(response.data.permissions || {})
            setIsAuthenticated(true)
        }
    }

    /* ===============================
       Refresh Access Token
    ================================ */
    const refreshAccessToken = async () => {
        try {
            const refreshToken = localStorage.getItem(REFRESH_TOKEN);
            if (!refreshToken){
                // console.log("token refresh empty")
                setIsAuthenticated(false)
                return false
            }     
            const response = await api.post("/api/v1/auth/token/refresh/", {refresh: refreshToken,});
            localStorage.setItem(ACCESS_TOKEN,response.data.access)

            if(response.data.refresh){
                localStorage.setItem(REFRESH_TOKEN,response.data.refresh)
            }
            return true
        } catch (error) {
            console.error("Refresh token failed", error);
            // logout();
            return null;
        }
    };

    /*===============================
       Check Authentication
    ================================ */

    const checkAuth = async () => {
        // console.log("imeta authentication")
        const token = localStorage.getItem(ACCESS_TOKEN)
        // console.log(token)
        if (!token){
            //  console.log("token empty")
            setLoading(false)

            return false
        }

        try{
            await fetchProfile()  
        }catch{
            const refreshToken = await refreshAccessToken()
            if(refreshToken){
                await fetchProfile()
            }
        }
        finally {
            setLoading(false)
        }  
    };

    /* ===============================
       Login
    ================================ */
    const Userlogin = async (email, password) => {
        try {
            const response = await api.post("/api/v1/auth/token/", {
                email,
                password,
            });
            const { access, refresh } = response.data;
            localStorage.setItem(ACCESS_TOKEN, access);
            localStorage.setItem(REFRESH_TOKEN, refresh);
            await fetchProfile();
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: "Invalid credentials",
            };
        }
    };


    /* ===============================
       Logout
    ================================ */
    const logout = () => {
        localStorage.removeItem(ACCESS_TOKEN);
        localStorage.removeItem(REFRESH_TOKEN);
        setUser(null);
        setIsAuthenticated(false);
    };

    const normalizePermissionPath = (path) => {
        if (!path) return "";
        const normalized = path.startsWith("/") ? path : `/${path}`;
        return normalized.endsWith("/") && normalized.length > 1
            ? normalized.slice(0, -1)
            : normalized;
    };

    const hasPermission = (path, action = "view") => {
        const normalizedPath = normalizePermissionPath(path);
        const permissionMap = permissions || {};
        let allowed = permissionMap[normalizedPath];

        if (!allowed) {
            const matchedKey = Object.keys(permissionMap)
                .filter((key) => key !== "/" && normalizedPath.startsWith(key))
                .sort((a, b) => b.length - a.length)[0];
            allowed = matchedKey ? permissionMap[matchedKey] : [];
        }

        return Array.isArray(allowed) && allowed.includes(action);
    };

    useEffect(() => {
        checkAuth();
    }, []);

    return (
        <UserContext.Provider
            value={{
                user,
                roles,
                permissions,
                isAuthenticated,
                loading,
                hasPermission,
                Userlogin,
                logout,
            }}
        >
            {children}
        </UserContext.Provider>
    );
};
