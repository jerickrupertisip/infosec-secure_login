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

	let sign_in_form = $state(true);

	let email = $state('');
	let password = $state('');
	let email_error: string | undefined = $state();
	let password_error: string | undefined = $state();

	function onsubmit() {
		const result = authSchema.safeParse({
			email,
			password
		});

		email_error = undefined;
		password_error = undefined;

		if (!result.success) {
			const error = z.flattenError(result.error);
			email_error = error.fieldErrors.email?.[0];
			password_error = error.fieldErrors.password?.[0];
			return;
		}

		if (sign_in_form) {
			signIn();
		} else {
			signUp();
		}
	}
	function signIn() {}
	function signUp() {}
</script>

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
		<form>
			<Field.Set>
				<Field.Group>
					<Field.Field>
						<Field.Label for="username">Email</Field.Label>
						<Input bind:value={email} id="username" type="email" placeholder="Your email" />
						{#if email_error}
							<Field.Error>
								{email_error}
							</Field.Error>
						{/if}
					</Field.Field>
					<Field.Field>
						<Field.Label for="password">Password</Field.Label>
						<Input bind:value={password} id="password" type="password" placeholder="••••••••" />
						{#if password_error}
							<Field.Error>
								{password_error}
							</Field.Error>
						{/if}
					</Field.Field>
				</Field.Group>
			</Field.Set>
		</form>
	</CardContent>
	<CardFooter class="flex-col gap-2">
		<Button onclick={onsubmit} type="submit" class="w-full cursor-pointer">Submit</Button>
		<Button
			variant="ghost"
			class="w-full cursor-pointer font-normal"
			onclick={() => (sign_in_form = !sign_in_form)}
		>
			{sign_in_form ? 'Create an account' : 'Sign in to existing account'}
		</Button>
	</CardFooter>
</Card>
