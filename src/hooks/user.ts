import { useState, useEffect } from 'react'
import { PopulatedUser, User } from '@/utils/types/user'
import { getAuthenticatedUser } from '@/server/db/actions/AuthActions'

export const useUser = () => {
  const [user, setUser] = useState<PopulatedUser | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getAuthenticatedUser();
      setUser(user);
    }

    fetchUser()
  }, [])

  return user
}
