import { UserContext } from "../context/Context";
import { useContext } from "react";
import { replace, useNavigate } from "react-router-dom";
import { Navigate } from "react-router-dom";

function RoleBasedProtectedRoute ({children, allowedrole, screenPath}) {
    const { roles, isAuthenticated, loading, hasPermission } = useContext(UserContext)
    if(loading){
        return<div>loadin..</div>
    }

    if(!isAuthenticated){
        console.log("not athenticated")
        return (<Navigate to="/login"/>)
    }

     console.log("user is athenticated")

    const hasRoles = roles.some(role=>allowedrole.includes(role))
    if(!hasRoles){
        console.log("hamna roles")
        // return <Navigate to="/login"/>
         return <Navigate to="/unauthorized" replace/>
    }

    if (screenPath && !hasPermission(screenPath, "view")) {
        return <Navigate to="/unauthorized" replace/>
    }

 return children

}
export default RoleBasedProtectedRoute