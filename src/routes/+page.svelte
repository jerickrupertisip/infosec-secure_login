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
		CardFooter
	} from '$lib/components/ui/card';
	import * as z from 'zod';
	import { authSchema } from '$lib/schemas';
	import { enhance } from '$app/forms';

	let sign_in_form = $state(true);

	let email_error: string | undefined = $state();
	let password_error: string | undefined = $state();
	let error_footer: string | undefined = $state();
</script>

<form
	method="POST"
	use:enhance={({ formData, cancel }) => {
		const result = authSchema.safeParse({
			email: formData.get('email'),
			password: formData.get('password')
		});

		email_error = undefined;
		password_error = undefined;
		error_footer = undefined;

		if (!result.success) {
			const error = z.flattenError(result.error);
			email_error = error.fieldErrors.email?.[0];
			password_error = error.fieldErrors.password?.[0];
			if (password_error !== null) {
				password_error = 'Password requires: ' + password_error;
			}

			return cancel();
		}

		return async ({ result, update }) => {
			if (result.type === 'failure') {
				if (result.data?.errorCode == 'AUTH_USER_NOT_FOUND') {
					email_error = result.data?.message as string;
				} else if (result.data?.errorCode == 'AUTH_INVALID_PASSWORD') {
					password_error = result.data?.message as string;
				} else if (result.data?.errorCode == 'AUTH_USER_LOCKED') {
					error_footer = result.data?.message as string;
				} else {
					email_error = result.data?.message as string;
					password_error = result.data?.message as string;
					error_footer = `Error Code: ${result.data?.errorCode as string}`;
				}
			}
			return update();
		};
	}}
	action={sign_in_form ? '?/signin' : '?/signup'}
>
	<Card class="min-w-sm">
		<CardHeader>
			<CardTitle class="scroll-m-20 text-2xl font-semibold tracking-tight">
				{sign_in_form ? 'Sign In' : 'Create an account'}
			</CardTitle>
			<CardDescription>
				{sign_in_form
					? 'Enter your email and password below to sign in to your account'
					: 'Enter your email and password below to register your account'}
			</CardDescription>
		</CardHeader>
		<CardContent>
			<Field.Set>
				<Field.Group>
					<Field.Field>
						<Field.Label for="email">Email</Field.Label>
						<Input name="email" id="email" type="email" placeholder="Your email" />
						{#if email_error}
							<Field.Error>
								{email_error}
							</Field.Error>
						{/if}
					</Field.Field>
					<Field.Field>
						<Field.Label for="password">Password</Field.Label>
						<Input name="password" id="password" type="password" placeholder="••••••••" />
						{#if password_error}
							<Field.Error>
								{password_error}
							</Field.Error>
						{/if}
						{#if sign_in_form}
							<p class="text-center text-sm text-muted-foreground">
								<a href="/reset-password" class="underline">Forgot password?</a>
							</p>
						{/if}
					</Field.Field>
					{#if error_footer}
						<Field.Error class="text-center">
							{error_footer}
						</Field.Error>
					{/if}
				</Field.Group>
			</Field.Set>
		</CardContent>
		<CardFooter class="flex-col gap-2">
			<Button type="submit" class="w-full cursor-pointer">Submit</Button>
			<Button
				variant="ghost"
				class="w-full cursor-pointer font-normal"
				onclick={() => (sign_in_form = !sign_in_form)}
				type="button"
			>
				{sign_in_form ? 'Create an account' : 'Sign in to existing account'}
			</Button>
		</CardFooter>
	</Card>
</form>
