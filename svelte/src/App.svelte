<script>
import Login from './Login.svelte';
import Main from './Main.svelte'
import {view} from './store.js'

</script>


<svelte:head>
	<!--Fonts-->
    <link rel="preconnect" href="https://fonts.gstatic.com">
	<link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700&display=swap" rel="stylesheet"> 
	
	<!--Font Awesome-->
	<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.14.0/css/all.css" integrity="sha384-HzLeBuhoNPvSl5KYnjx0BT+WB0QEEqLprO+NBkkk5gbc67FTaL7XIGa2w1L0Xbgc" crossorigin="anonymous">
</svelte:head>

	{#if $view == 'Main'}
		<Main/>
	{/if}

	{#if $view == 'Login'}
		<Login/>
	{/if}


<style>

</style>