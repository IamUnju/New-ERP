import { useContext, useState } from "react"
import { UserContext } from "../context/Context"
import { useNavigate } from "react-router-dom"

function Form() {
    const { Userlogin } = useContext(UserContext)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handlesubmission = async (e) => {
        e.preventDefault()
        setError("")
        setLoading(true)
        const result = await Userlogin(email, password)
        setLoading(false)
        if (result?.success) {
            navigate("/", { replace: true })
        } else {
            setError(result?.message || "Invalid credentials")
        }
    }

    return (
        <div className="auth-card">
            <h2 className="auth-title">Sign In</h2>
            {error && <div className="auth-error">{error}</div>}
            <form onSubmit={handlesubmission} className="auth-form">
                <div className="auth-field">
                    <label>Email</label>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoFocus
                    />
                </div>
                <div className="auth-field">
                    <label>Password</label>
                    <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
                    {loading ? "Signing in…" : "Sign In"}
                </button>
            </form>
        </div>
    )
}
export default Form