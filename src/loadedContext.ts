import { createContext, useContext } from "react";
export const LoadedCtx = createContext(false);
export const useLoaded = () => useContext(LoadedCtx);
