import ProfileContainer from "@/components/ProfilePage/ProfileContainer";
import { getAuthenticatedUser } from "@/server/db/actions/AuthActions";
import { getUser } from "@/server/db/actions/UserActions";

export default async function Profile({ params }: { params: { id: string } }) {
  const id = params.id;
  const user = await getUser(id);
  const currUser = await getAuthenticatedUser();

  if (!currUser) {
    return null;
  }

  return <ProfileContainer user={user} currUser={currUser}/>
}