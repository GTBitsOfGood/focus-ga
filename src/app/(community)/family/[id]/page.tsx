import ProfileContainer from "@/components/ProfilePage/ProfileContainer";
import { getPopulatedUser } from "@/server/db/actions/UserActions";

export default async function Profile({ params }: { params: { id: string } }) {
  const id = params.id;
  const user = await getPopulatedUser(id);

  return <ProfileContainer user={user}/>
}