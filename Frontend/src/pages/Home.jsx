import { useEffect, useState } from "react";
import toast, { Toaster } from 'react-hot-toast';

const Home = () => {
  const [user, setUser] = useState(null);

  const fetchData = async (token, refreshed) => {
    try {
      const raw = await fetch(`${import.meta.env.VITE_API_URL}/user`, {
        headers: {
          Authorization: token,
        }
      });
      if(!raw.ok) {
        throw new Error(raw.statusText);
      }
      const data = await raw.json();
      setUser(data);
    } catch (err) {
      console.log("Error", err);
      if(!refreshed) {
        refreshToken();
      } else {
        toast.error(err);
      }
    }
  }

  const refreshToken = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if(!refreshToken) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      toast.error("You are logged out");
      window.location.href = "/auth";
      return;
    }
    try {
      const raw = await fetch(`${import.meta.env.VITE_API_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          refreshToken
        })
      });
      if(!raw.ok) {
        throw new Error(raw.statusText);
      }
      const data = await raw.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      fetchData(data.token, true);
    } catch(err) {
      console.log("Error", err);
      toast.error(err);
    }
    
  }

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if(!token) {
      toast.error("You are logged out");
      window.location.href = "/auth";
      return;
    }

    fetchData(token, false);

  }, []);

  return <>
    <Toaster
        position="top-center"
        reverseOrder={false}
    />
    {user ? <>
      <div class="flex flex-wrap items-center justify-center gap-8 w-full h-[100vh]">
        <div class="bg-white rounded-2xl pb-4 overflow-hidden border border-gray-300">
            <div class="w-64 flex justify-center pt-10">
                <div class="w-28 h-28 rounded-full overflow-hidden">
                    <img class="h-32 object-cover object-top" src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200" alt="userImage2" />
                </div>
            </div>
            <div class="flex flex-col items-center">
                <p class="font-medium mt-3">{user.name}</p>
                <p class="text-gray-500 text-sm">{user.email}</p>
                <button class="border text-sm text-gray-500 border-gray-500/30 w-28 h-8 rounded-full mt-5">
                    <p class="mb-1">message</p>
                </button>
            </div>
        </div>
    </div>
    </> : <></>}
  </>
}

export default Home;