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

	let sign_in_form = $state(true);

	let email_input: HTMLInputElement | undefined = $state();
	let password_input: HTMLInputElement | undefined = $state();

	function onsubmit() {
		if (!email_input || !password_input) {
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
						<Input ref={email_input} id="username" type="email" placeholder="Your email" />
					</Field.Field>
					<Field.Field>
						<Field.Label for="password">Password</Field.Label>
						<Input ref={password_input} id="password" type="password" placeholder="••••••••" />
					</Field.Field>
				</Field.Group>
			</Field.Set>
		</form>
	</CardContent>
	<CardFooter class="flex-col gap-2">
		<Button onclick={onsubmit} type="submit" class="w-full cursor-pointer">Continue</Button>
		<Button
			variant="ghost"
			class="w-full cursor-pointer font-normal"
			onclick={() => (sign_in_form = !sign_in_form)}
		>
			{sign_in_form ? 'Create an account' : 'Sign in to existing account'}
		</Button>
	</CardFooter>
</Card>
