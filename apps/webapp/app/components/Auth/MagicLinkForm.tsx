import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useActionData, useNavigation, useSubmit } from "react-router";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@justchat/ui/components/form";
import { Button } from "@justchat/ui/components/button";
import { Input } from "@justchat/ui/components/input";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { toast } from "@justchat/ui/components/sonner";

const FormSchema = z.object({
  email: z.string().email(),
});

export default function MagicLinkForm() {
  const navigation = useNavigation();

  const submit = useSubmit();
  const isLoading =
    navigation.state === "loading" || navigation.state === "submitting";

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
    },
  });
  const actionData = useActionData();

  function onSubmit(data: z.infer<typeof FormSchema>) {
    submit(data, {
      method: "post",
      action: "/auth/magic-link",
      preventScrollReset: true,
      replace: true,
    });
  }

  useEffect(() => {
    if (!isLoading && actionData) {
      if (actionData.success) {
        toast.success(actionData.message);
        form.reset({});
      } else {
        toast.error(actionData.message);
      }
    }
  }, [actionData, isLoading]);

  return (
    <div className="w-full max-w-md space-y-6 p-6 border border-border rounded-md">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Sign in with Magic Link</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email address and we'll send you a magic link to sign in.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
            loading={isLoading}
          >
            Send Magic Link
          </Button>
        </form>
      </Form>
    </div>
  );
}
