<script>
import {view} from './store.js'


//Funcion para volver al Main
    function goToMain() {
            $view = 'Main'
        }

    function goToContent() {
        $view = 'Content'
    }

</script>


<div class="Back">
    <button class="bck" on:click={goToMain}><i class="fas fa-caret-left"></i></button>
</div>

    <div class="login-content">
            <div class="inputs">
                <input type="email" placeholder="Email">
                <input type="password" placeholder="Password">
            </div>

                <button class="entrar" on:click={goToContent}>Enter</button>
    </div>


<style>
.login-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    padding-top: 10em;
}

.inputs {
    display: flex;
    flex-direction: column;
    margin-top: 50px;
    margin-bottom: 50px;
}

input {
    font-size: 20px;
    font-size: 20px;
    background: #f5f5f5;
    border: none;
    border-radius: 25px;
    padding-left: 15px;
    padding-right: 15px;
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

.Back {
    padding-left: 30px;
    padding-top: 30px;
}

.bck {
    background: none;
    color: #f5f5f5;
    font-size: 35px;
    padding: 0;
    margin: auto;
}
</style>