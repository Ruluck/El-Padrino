<script>
import Offer from "./Offer.svelte";

</script>

<nav>
    <span class="Menu">
        <i class="fas fa-ellipsis-h" style="margin-top: 30px;"></i>
    </span>
<img class="Logo" src="/img/Logo.svg" alt="">

</nav>

<Offer/>

<style>
    nav {
        background-image: url("/img/Header.svg");
        height: 450px;
        background-repeat: no-repeat;
        background-size: cover;
        display: flex;
        z-index: 99;
        position: relative;
        top: -150px;
    }

    .Menu {
        color: #f5f5f5;
        font-size: 30px;
        margin-left: 35px;
        position: relative;
        top: 150px;
    }

    .Logo {
        width: 200px;
        margin: 0;
        left: 420px;
        position: relative;
    }
    
</style>