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
        height: 185px;
        width: 450px;
        background-repeat: no-repeat;
        background-size: cover;
        display: flex;
        z-index: 99;
        position: relative;
    }

    .Menu {
        color: #f5f5f5;
        font-size: 30px;
        margin-left: 35px;
    }

    .Logo {
        width: 200px;
        margin-left: 65px;
        margin-bottom: 35px;
    }
    
</style>