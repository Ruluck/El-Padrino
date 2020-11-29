<script>
import {view} from './store.js'

//Funcion para volver ir al componente Login
    function goToLogin() {
        $view = 'Login'
    }
    
    
    function goToSignUp() {
        $view = 'SignUp'
    }


</script>


<div class="Content">
    <div class="El_Padrino_Logo">
        <img class = "Logo" src="/img/EL-PADRINO-solo-LOGO-blanco.png" alt="">
    </div>

        <div class="Buttons">
            <button on:click={goToLogin}>LOGIN</button>
            <button on:click={goToSignUp}>SIGN UP</button>
        </div>
</div>


<style>
    .Logo {
        display: block;
        margin: auto;
        width: 450px;
        margin-top: -30px;
    }

    .Buttons {
        display: flex;
        align-items: center;
        flex-direction: column;
        margin-top: 45px;
    }

    .Content {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        padding-top: 10em;
    }

    button {
        font-size: 25px;
        font-family: 'Open Sans';
        font-weight: bold;
        padding: 10px;
        padding-left: 50px;
        padding-right: 50px;
        background-color: #f5f5f5;
        color:#ea911c;
        border: none;
        border-radius: 25px;
    }

    button:hover {
        background-color: #ea911c;
        color: #f5f5f5;
    }

</style>