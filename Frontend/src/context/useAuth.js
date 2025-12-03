import { useContext } from "react";
import { AuthContext } from "./AuthCore.js";

export const useAuth = () => useContext(AuthContext);

