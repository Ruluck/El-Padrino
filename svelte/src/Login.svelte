<script>
import {view} from './store.js'


//Funcion para volver al Main
    function goToMain() {
            $view = 'Main'
        }

</script>


<div class="Back">
    <button on:click={goToMain}><i class="fas fa-caret-left"></i></button>
</div>

    <div class="inputs">
        <input type="email" placeholder="Email">
        <input type="password" placeholder="Password">
    </div>

        <button class="entrar">Enter</button>


<style>


</style>