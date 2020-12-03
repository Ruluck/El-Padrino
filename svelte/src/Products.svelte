<script>
    var products = [
	{id: 1, name:'Pan Francés', count: 0},
	{id: 2, name:'Canillas', count: 0},
	{id: 3, name:'Piñitas Saladas', count: 0},
	{id: 4, name:'Bombas Saladas', count: 0},
	{id: 5, name:'Golfeados', count: 0}
];


function plusCount(product) {
	product.count += 1;
	products = products
}

function minusCount(product) {
    product.count -= 1
    if (product.count < 0) {
        product.count = 0;
	}
	products = products
}
</script>

<div class="content-products">
    {#each products as product (product.id)}
        <div class="section-product">
                <div class="product-card">
                    <!--img src="/img/Logo.svg" alt=""-->
                        <h1>{product.name}</h1>
                            <div class="count">
                                <span class="plus" on:click={()=>{plusCount(product)}}><i class="fas fa-plus-circle"></i></span>
                                <span>{product.count}</span>
                                <span class="minus" on:click={()=>{minusCount(product)}}><i class="fas fa-minus-circle"></i></span>
                            </div>
                </div>
        </div>
    {/each}
</div>

<style>
.content-products {
    width: 100%;
    height: 350px;
    display: flex;
    flex-wrap: nowrap;
    overflow-x: auto;
}

.section-product {
    width: 40%;
    height: 100%;
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #212121;
    flex-direction: column;
    margin-left: 55px;
    border-radius: 50px;
    background-color: #f5f5f5;
}

.content-products::-webkit-scrollbar {
    display: none; /*Chrome*/
}

.content-products {
  -ms-overflow-style: none;  /* IE and Edge */
  /*scrollbar-width: none;  /*Firefox*/
} 

/*.product-card {
    background-color: #f5f5f5;
    padding: 90px 35px;
    border-radius: 50px;
    max-width: 200px !important;
}*/


.count {
	font-size: 20px;
}

</style>