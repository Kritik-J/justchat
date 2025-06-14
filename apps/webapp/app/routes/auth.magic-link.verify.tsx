import type { Route } from "./+types/auth.magic-link.verify";

import {
  data,
  redirect,
  useNavigation,
  type LoaderFunctionArgs,
} from "react-router";
import { authService } from "~/services/auth.server";
import { appPath } from "~/utils/pathBuilder";
import MagicLinkVerify from "~/components/Auth/MagicLinkVerify";
import { logger } from "@justchat/logger";
import {
  commitSession,
  getUserSession,
} from "~/services/sessionStorage.server";

export default function Page({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigation();
  const isLoading =
    navigate.state === "loading" || navigate.state === "submitting";

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <MagicLinkVerify
        loading={isLoading}
        success={loaderData.success}
        message={loaderData.message}
        email={loaderData.email || ""}
      />
    </div>
  );
}

export async function loader({ request }: LoaderFunctionArgs) {
  const existingUser = await authService.getUser(request);

  logger.info(existingUser);

  if (existingUser) {
    throw redirect(appPath());
  }

  const token = new URL(request.url).searchParams.get("token");
  const email = new URL(request.url).searchParams.get("email");

  if (!token || !email) {
    return data({ success: false, message: "Invalid token or email", email });
  }

  logger.info(token, email);

  const { success, message, user } = await authService.verifyLogin(token);

  logger.info(user);

  if (success) {
    const session = await getUserSession(request);
    session.set("userId", user._id);

    throw redirect(appPath(), {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  return data({ success: false, message, email });
}
