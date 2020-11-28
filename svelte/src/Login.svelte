<script>
import {view} from './store.js'
function goToMain() {
        $view = 'Main'
    }

</script>

<svelte:head>

</svelte:head>

<div class="Back">
    <button on:click={goToMain}><i class="fas fa-caret-left"></i></button>
</div>


<input type="email" placeholder="Email">
<input type="password" placeholder="Password">

<button>
    Enter
</button>




<style>


</style>