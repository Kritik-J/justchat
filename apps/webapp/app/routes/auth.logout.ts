import { redirect, type ActionFunctionArgs } from "react-router";
import { appPath } from "~/utils/pathBuilder";
import {
  destroySession,
  getUserSession,
} from "~/services/sessionStorage.server";

export async function action({ request }: ActionFunctionArgs) {
  const session = await getUserSession(request);

  throw redirect(appPath(), {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
}