

document.getElementById('uploadButton').addEventListener('click', function() {
    console.log('bruh')
    let item ={"address":"United States","countryCode":"US","geoLat":39.3812661305678,"geoLng":-97.9222112121185,"brand":"nike","colour":["black"],"condition":null,"description":"buy it now! sick shirt\ngreat item","gender":"male","isKids":false,"nationalShippingCost":"0","internationalShippingCost":"10","pictureIds":[1681860839],"priceAmount":"20","priceCurrency":"USD","group":"accessories","productType":"hat","variants":{},"quantity":1,"attributes":{},"shippingMethods":[],"listingLifecycleId":"f1336ad6-822c-4090-b865-acb3a2b3eca2"};

fetch('https://webapi.depop.com/api/v2/products/', {
    method: 'POST', 
    body: JSON.stringify(item), 
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Depop-UserId": window._userId,
        Authorization: `Bearer ${window._bearerToken}`,
        referrer: "https://www.depop.com/",
        referrerPolicy: "strict-origin-when-cross-origin",
        mode: "cors"
    },
    credentials: "include"
})
.then(response => response.json())
.then(data => {
  console.log('Success:', data);
})
.catch((error) => {
  console.error('Error:', error);
});

})

