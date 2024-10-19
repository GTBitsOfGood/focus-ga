import ProfileContainer from "@/components/ProfilePage/ProfileContainer";
import { getUser } from "@/server/db/actions/UserActions";

export default async function Profile({ params }: { params: { id: string } }) {
  const id = params.id;
  const user = await getUser(id);

  return <ProfileContainer user={user} />
}