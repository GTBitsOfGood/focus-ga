import ProfileContainer from "@/components/ProfilePage/ProfileContainer";
import { getAuthenticatedUser } from "@/server/db/actions/AuthActions";
import { getPopulatedUser } from "@/server/db/actions/UserActions";

export default async function Profile({ params }: { params: { id: string } }) {
  const id = params.id;
  const user = await getPopulatedUser(id);
  const currUser = await getAuthenticatedUser();

  if (!currUser) {
    return null;
  }

  return <ProfileContainer user={user} currUser={currUser}/>
}