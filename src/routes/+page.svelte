<script lang="ts">
	import AuthForm from './AuthForm.svelte';

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

<AuthForm
	submit_text={sign_in_form ? 'Sign In' : 'Sign Up'}
	bind:email_input
	bind:password_input
	{onsubmit}
>
	<p>
		Already have an account?
		<button
			onclick={(e: MouseEvent) => {
				e.preventDefault();
				sign_in_form = !sign_in_form;
			}}
			class="cursor-pointer font-medium text-indigo-600 underline-offset-4 transition-all hover:text-indigo-500 hover:underline"
		>
			{sign_in_form ? 'Sign Up' : 'Sign In'}
		</button>
	</p>
</AuthForm>
