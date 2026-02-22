<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle,
		CardDescription
	} from '$lib/components/ui/card';
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<Card class="min-w-sm">
	<CardHeader>
		<CardTitle class="scroll-m-20 text-2xl font-semibold tracking-tight">Welcome to Dashboard!</CardTitle>
		<CardDescription>
			You are logged in as <span class="font-medium text-foreground">{data.email}</span>
		</CardDescription>
	</CardHeader>
	<CardContent>
		<form method="POST" action="?/logout" use:enhance>
			<Button type="submit" variant="destructive" class="w-full cursor-pointer">Logout</Button>
		</form>
	</CardContent>
</Card>
