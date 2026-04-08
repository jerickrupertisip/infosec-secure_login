<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import * as Field from '$lib/components/ui/field';
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter,
  } from '$lib/components/ui/card';
  import { enhance } from '$app/forms';
  import { resetPasswordSchema } from '$lib/schemas';
  import type { PageData } from './$types';

  export let data: PageData;

  let resetLink: string | undefined;
  let message: string | undefined;
  let error: string | undefined;
  let success = false;
  const token = data.token;
</script>

<form
  method="POST"
  action={token ? '?/reset' : '?/request'}
  use:enhance={({ formData, cancel }) => {
    error = undefined;
    message = undefined;
    resetLink = undefined;
    success = false;

    if (!token) {
      const email = formData.get('email');
      if (!email || String(email).trim().length === 0) {
        error = 'Email is required';
        return cancel();
      }
    } else {
      const password = formData.get('password');
      if (!password || String(password).trim().length === 0) {
        error = 'Password is required';
        return cancel();
      }

      const validation = resetPasswordSchema.safeParse({ password });
      if (!validation.success) {
        error = "Password requires: " + (validation.error.issues[0]?.message ?? 'Invalid password');
        return cancel();
      }
    }

    return async ({ result, update }) => {
      if (result.type === 'failure') {
        error = result.data?.error as string | undefined;
        message = result.data?.message as string | undefined;
      }

      if (result.type === 'success') {
        const resultData = result.data as Record<string, unknown>;
        if (resultData.resetUrl) {
          resetLink = resultData.resetUrl as string;
        }

        if (resultData.message) {
          message = resultData.message as string;
        }

        if (resultData.success) {
          success = true;
        }
      }

      return update();
    };
  }}
>
  <Card class="min-w-sm">
    <CardHeader>
      <CardTitle class="scroll-m-20 text-2xl font-semibold tracking-tight">
        {token ? 'Reset your password' : 'Forgot your password?'}
      </CardTitle>
      <CardDescription>
        {token
          ? 'Enter a new password to finish resetting your account.'
          : 'Enter the email for your account and we will generate a password reset link.'}
      </CardDescription>
    </CardHeader>

    <CardContent>
      {#if success}
        <div class="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-900">
          Your password has been reset successfully. You can now sign in with your new password.
        </div>
      {:else}
        {#if token}
          <input type="hidden" name="token" value={token} />
          <Field.Field>
            <Field.Label for="password">New password</Field.Label>
            <Input name="password" id="password" type="password" placeholder="••••••••" />
            {#if error}
              <Field.Error>{error}</Field.Error>
            {/if}
          </Field.Field>
        {:else}
          <Field.Field>
            <Field.Label for="email">Email</Field.Label>
            <Input name="email" id="email" type="email" placeholder="Your email" />
            {#if error}
              <Field.Error>{error}</Field.Error>
            {/if}
          </Field.Field>
        {/if}
      {/if}

      {#if message}
        <div class="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-900">
          {message}
        </div>
      {/if}

      {#if resetLink}
        <div class="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
          Reset link generated:
          <div class="break-all">{resetLink}</div>
        </div>
      {/if}
    </CardContent>

    <CardFooter class="flex-col gap-2">
      {#if !success}
        <Button type="submit" class="w-full cursor-pointer">
          {token ? 'Save new password' : 'Generate reset link'}
        </Button>
      {/if}
      <a href="/" class="text-sm text-muted-foreground underline">Back to sign in</a>
    </CardFooter>
  </Card>
</form>
