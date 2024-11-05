import SettingsComponent from "@/components/SettingsComponent";
import { getAuthenticatedUser } from "@/server/db/actions/AuthActions";
import { getDisabilities } from "@/server/db/actions/DisabilityActions";
import { getPopulatedUser } from "@/server/db/actions/UserActions";

export default async function SettingsPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    return;
  }
  const populatedUser = await getPopulatedUser(user._id);
  const disabilities = await getDisabilities();

  return <SettingsComponent user={populatedUser} disabilities={disabilities} />;
}