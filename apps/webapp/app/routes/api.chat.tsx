import {
  data,
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "react-router";

import { chatService } from "../services/chat.server";

// export async function loader({ request }: LoaderFunctionArgs) {
//   const user = await getUserSession(request);
//   if (!user) {
//     throw redirect("/auth-magic-link");
//   }
//   return null;
// }

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const userMessage = formData.get("message");
  const { text, success } = await chatService.generateResponse(
    userMessage as string
  );

  if (!success) {
    return data({ success: false, text: "Failed to generate response" });
  }

  return data({ success: true, text });
}
