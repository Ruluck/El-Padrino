<script>
import Login from './Login.svelte';

import Main from './Main.svelte'

import {view} from './store.js'

</script>

<main>
	{#if $view == 'Main'}
		<Main/>
	{/if}

	{#if $view == 'Login'}
		<Login/>
	{/if}

</main>

<style>
	main  {
		display: flex;
		justify-content: center;
		padding-top: 10em;
	}
</style>