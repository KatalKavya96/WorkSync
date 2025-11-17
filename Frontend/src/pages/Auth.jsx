import React,{useState} from 'react';
import toast, { Toaster } from 'react-hot-toast';

const Auth = () => {
    const [state, setState] = useState("login");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({
        name: "",
        email: "",
        password: "",
    });

    const onChangeHandler = (e) => {
        setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const checkFields = () => {
        if(state==="register") {
            if(!data.name) {
                setError("Name is required");
                return false;
            }
        }
        if(!data.email) {
            setError("Email is required");
            return false;
        }
        if(!data.password) {
            setError("Password is required");
            return false;
        }
        return true;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        if(!checkFields()) {
            setLoading(false);
            toast.error(error);
            return;
        }

        try {
            if(state=="register") {
                const raw = await fetch(`${import.meta.env.VITE_API_URL}/auth/signup`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name: data.name,
                        email: data.email,
                        password: data.password
                    })
                });
                const res = await raw.json();
                if(!raw.ok) {
                    throw new Error(res.error);
                }
                toast.success("You are now registered");
                setData({
                    name: "",
                    email: "",
                    password: "",
                });
                setState("login");
                
            } else if(state=="login") {
                const raw = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email: data.email,
                        password: data.password
                    })
                });
                const res = await raw.json();
                if(!raw.ok) {
                    throw new Error(res.error);
                }
                localStorage.setItem('token', res.token);
                localStorage.setItem('refreshToken', res.refreshToken);
                toast.success('You are now logged in');
                window.location.href = "/";
            }
        } catch (err) {
            console.log("Error", err.message)
            setError(err.message);
            setLoading(false);
            toast.error(error);
        }

    }

    return (
        <div className='w-full h-[100vh] flex justify-center items-center bg-gray-900'>
            <Toaster
                position="top-center"
                reverseOrder={false}
            />
            <form
                onSubmit={handleSubmit}
                className="w-full sm:w-[350px] text-center border border-zinc-300/60 dark:border-zinc-700 rounded-2xl px-8 bg-white dark:bg-zinc-900"
            >
                <h1 className="text-zinc-900 dark:text-white text-3xl mt-10 font-medium">
                    {state === "login" ? "Login" : "Register"}
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-2 pb-6">
                    Please {state === "login" ? "sign in" : "sign up"} to continue
                </p>

                {state !== "login" && (
                    <div className="flex items-center w-full mt-4 bg-white dark:bg-zinc-800 border border-zinc-300/80 dark:border-zinc-700 h-12 rounded-full overflow-hidden pl-6 gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500 dark:text-zinc-400" viewBox="0 0 24 24" >
                            <path d="M20 21a8 8 0 0 0-16 0" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                        <input type="text" placeholder="Name" className="bg-transparent text-zinc-600 dark:text-zinc-200 placeholder-zinc-500 dark:placeholder-zinc-400 outline-none text-sm w-full h-full" name="name" value={data.name} onChange={onChangeHandler} required />
                    </div>
                )}

                <div className="flex items-center w-full mt-4 bg-white dark:bg-zinc-800 border border-zinc-300/80 dark:border-zinc-700 h-12 rounded-full overflow-hidden pl-6 gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500 dark:text-zinc-400" viewBox="0 0 24 24" >
                        <rect width="20" height="16" x="2" y="4" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                    <input type="email" placeholder="Email id" className="bg-transparent text-zinc-600 dark:text-zinc-200 placeholder-zinc-500 dark:placeholder-zinc-400 outline-none text-sm w-full h-full" name="email" value={data.email} onChange={onChangeHandler} required />
                </div>

                <div className="flex items-center mt-4 w-full bg-white dark:bg-zinc-800 border border-zinc-300/80 dark:border-zinc-700 h-12 rounded-full overflow-hidden pl-6 gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500 dark:text-zinc-400" viewBox="0 0 24 24" >
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <input type="password" placeholder="Password" className="bg-transparent text-zinc-600 dark:text-zinc-200 placeholder-zinc-500 dark:placeholder-zinc-400 outline-none text-sm w-full h-full" name="password" value={data.password} onChange={onChangeHandler} required />
                </div>

                <div className="mt-5 text-left">
                    <a className="text-sm text-indigo-500 dark:text-indigo-400" href="#" >
                        Forgot password?
                    </a>
                </div>

                <button type="submit" className="mt-2 w-full h-11 rounded-full text-white bg-indigo-500 hover:opacity-90 transition-opacity cursor-pointer" disabled={loading}>
                    {state === "login" ? "Login" : "Create Account"}
                </button>

                <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-3 mb-11">
                    {state === "login"
                        ? "Don't have an account? "
                        : "Already have an account? "}
                    <button type="button" className="text-indigo-500 dark:text-indigo-400 cursor-pointer" disabled={loading} onClick={() => setState((prev) => prev === "login" ? "register" : "login")} >
                        {state === "login" ? "Register" : "Login"}
                    </button>
                </p>
            </form>
        </div>
    );
};

export default Auth;