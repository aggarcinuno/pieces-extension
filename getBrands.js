document.getElementById('getBrands').addEventListener('click', async function() {
    console.log('bruh')
    console.log(await getBrands())
    

})

async function getBrands() {
    var a = await fetch("https://www.depop.com/products/create/", {
        method: "GET",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "Depop-UserId": this._userId,
            Authorization: `Bearer ${this._bearerToken}`
        },
        credentials: "include"
    });
    return JSON.parse((new DOMParser).parseFromString(await a.text(), "text/html").body.getElementsByTagName("script")[0].innerText).props.pageProps.productAttributes
}