import React, {createContext, useReducer} from 'react';
import { authReducer } from './authReducer';

//definir la información que habrá aquí
export interface AuthState {
  isLoggedIn: boolean;
  username?: string;
  password?: string;
}

//estado inicial
export const authInitialState: AuthState = {
  isLoggedIn: false,
  username: undefined,
  password: undefined,
};

//definir todo lo que el contexto va a pasarle a los hijos. Le dice a react como luce y que expone el context
export interface AuthContextProps {
  authState: AuthState;
  signIn: () => void;
  signOut: () => void;
  setUsername: (userName: string) => void;
  setPassword: (password: string) => void;
}

//crea el contexto
export const AuthContext = createContext({} as AuthContextProps);

//componente proveedor del estado
export const AuthProvider = ({children}: any) => {

    const [authState, action] = useReducer(authReducer, authInitialState);
    const signIn = () => {
        action({type: 'signIn'})
    }

    const signOut = () => {
        action({type: 'singOut'})
    }

    const setUsername = (username: string) => {
        action({type: 'setUsername', payload: username});
    }

    const setPassword = (password: string) => {
        action({type: 'setPassword', payload: password});
    }

  return (
    <AuthContext.Provider
      value={{
        authState: authState,
        signIn: signIn,
        signOut,
        setUsername,
        setPassword
        
      }}>
      {children}
    </AuthContext.Provider>
  );
};