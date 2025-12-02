import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

const Home = () => {
  const [user, setUser] = useState(null);

  const fetchData = async (token, refreshed) => {
    try {
      const raw = await fetch(`${import.meta.env.VITE_API_URL}/user`, {
        headers: {
          Authorization: token,
        },
      });

      if (!raw.ok) {
        throw new Error(raw.statusText || "Failed to fetch user");
      }

      const data = await raw.json();
      setUser(data);
    } catch (err) {
      console.log("Error fetching user:", err);
      if (!refreshed) {
        refreshToken();
      } else {
        toast.error(err.message || "Failed to load user");
      }
    }
  };

  const refreshToken = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      toast.error("You are logged out");
      window.location.href = "/auth";
      return;
    }
    try {
      const raw = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/refresh`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refreshToken }),
        }
      );

      if (!raw.ok) {
        throw new Error(raw.statusText || "Failed to refresh token");
      }

      const data = await raw.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("refreshToken", data.refreshToken);
      fetchData(data.token, true);
    } catch (err) {
      console.log("Error refreshing token:", err);
      toast.error(err.message || "Session expired, please login again");
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      window.location.href = "/auth";
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("You are logged out");
      window.location.href = "/auth";
      return;
    }

    fetchData(token, false);
  }, []);

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      {user && (
        <div className="flex flex-wrap items-center justify-center gap-8 w-full h-[100vh] bg-slate-950">
          <div className="bg-white rounded-2xl pb-4 overflow-hidden border border-gray-300">
            <div className="w-64 flex justify-center pt-10">
              <div className="w-28 h-28 rounded-full overflow-hidden">
                <img
                  className="h-32 object-cover object-top"
                  src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200"
                  alt="user avatar"
                />
              </div>
            </div>
            <div className="flex flex-col items-center">
              <p className="font-medium mt-3">{user.name}</p>
              <p className="text-gray-500 text-sm">{user.email}</p>
              <button className="border text-sm text-gray-500 border-gray-500/30 w-28 h-8 rounded-full mt-5">
                <p className="mb-1">message</p>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Home;
