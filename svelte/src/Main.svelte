<script>
    import {view} from './store.js'

    function goToLogin() {
        $view = 'Login'
    }



</script>

<svelte:head>
    <link rel="preconnect" href="https://fonts.gstatic.com">
<link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700&display=swap" rel="stylesheet"> 
</svelte:head>


<div class="Content">
    <div class="El_Padrino_Logo">
        <img class = "Logo" src="/img/EL-PADRINO.png" alt="">
    </div>

    <div class="Buttons">
        <button on:click={goToLogin}>LOGIN</button>
        <button>SIGN UP</button>
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
    }

    .Content {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
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