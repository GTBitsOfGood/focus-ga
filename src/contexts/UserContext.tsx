import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { PopulatedUser } from '@/utils/types/user';
import { getAuthenticatedUser } from '@/server/db/actions/AuthActions';

interface UserContextType {
  user: PopulatedUser | null;
  setUser: React.Dispatch<React.SetStateAction<PopulatedUser | null>>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode; 
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<PopulatedUser | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getAuthenticatedUser();
      setUser(user);
    };

    fetchUser();
  }, []);

  useEffect(() => {
    console.log(user);
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
