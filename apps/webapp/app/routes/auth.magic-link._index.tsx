import {
  data,
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "react-router";
import MagicLinkForm from "~/components/Auth/MagicLinkForm";
import { authService } from "~/services/auth.server";
import { appPath } from "~/utils/pathBuilder";

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <MagicLinkForm />
    </div>
  );
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authService.getUser(request);

  if (user) {
    throw redirect(appPath());
  }

  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const guestSessionId = formData.get("guestSessionId") as string | null;

  const { success, message } = await authService.initiateLogin(
    email,
    guestSessionId || undefined
  );

  if (!success) {
    return data({ success: false, message });
  }

  return data({ success: true, message });
}
