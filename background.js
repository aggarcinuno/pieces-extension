
chrome.runtime.onMessageExternal.addListener(function(a, b, c) {
    console.log(a);
    if (a) switch (a.action) {
        case "checkLoggedIn":
            checkLogin$$module$background(a.marketPlace, c, a.settings);
            break;
        case "post":
            postUsingFormFiller$$module$background(a.marketPlace, a.product, !1, c, a.activeTab, a.settings, a.autoPost);
            break;
        case "httppost":
            postUsingApi$$module$background(a.marketPlace, a.product, c, a.settings);
            break;
        case "import":
            importFromMarketPlace$$module$background(a.params, c);
            break;
        case "importSingleProduct":
            importSingleProductFromMarketPlace$$module$background(a.params,
                c);
            break;
        case "delistProduct":
            delistProduct$$module$background(a.marketPlace, a.productId, c, a.settings);
            break;
        default:
            c(!0)
    }
});

var module$background = {};
module$background.ApiPosting = ApiPosting$$module$background;
module$background.DepopClient = DepopClient$$module$background;
module$background.DepopListing = DepopListing$$module$background;

async function postUsingApi$$module$background(a, b, c, d) {
    a = await ApiPosting$$module$background.post(a, b, d[a + "Tld"]);
    c(a)
}

const ApiPosting$$module$background = {
    async post(a, b, c) {
        var d = null;
        try {
            switch (a) {
                case "poshmark":
                    d = await this._publishViaPoshMark(b, c);
                    break;
                case "depop":
                    d = await this._publishViaDepop(b, c);
                    break;
                default:
                    throw Error(`${a} is not supported`);
            }
        } catch (e) {
            return console.log(e), await Crosslist.logFilled(b.id, a, JSON.stringify(e, Object.getOwnPropertyNames(e)), [], "Http", b), !1 === e.success ? e : {
                success: !1,
                message: "string" === typeof e || e instanceof String ? e : "An unexpected error occured, please contact our support team"
            }
        }
        await Crosslist.logFilled(b.id, a, d.internalErrors ? JSON.stringify(d.internalErrors) : "", [], "Http", b);
        return d
    },
    async delist(a, b, c) {
        try {
            switch (a) {
        
                case "poshmark":
                    return await (new PoshMarkClient$$module$background(c)).delistListing(b);
                case "depop":
                    return await (new DepopClient$$module$background).delistListing(b);
                default:
                    throw Error(`${a} is not supported`);
            }
        } catch (e) {
            return console.log(e),
                await Crosslist.log("delistError", e.toString(), b, a), {
                    success: !1,
                    message: "string" === typeof e || e instanceof String ? e : "An unexpected error occured, please contact our support team"
                }
        }
    },
    
    async _publishViaPoshMark(a, b) {
        console.log(a);
        var c = new PoshMarkClient$$module$background(b);
        a = await (new PoshMarkListing$$module$background(c, b)).map(a);
        return await c.postListing(a)
    },
    // a = product, b = user settings
    async _publishViaDepop(a, b) {
        console.log(a);
        // retrieving cookies etc
        var c = new DepopClient$$module$background;
        await c.initialize();
        // mapping crosslist form to depop form 
        a = await (new DepopListing$$module$background(c, b)).map(a);
        return await c.postListing(a)
    },
};

const DEPOP_DOMAIN$$module$background = "depop.com",
DEPOP_CREATE_PRODUCT_PAGE$$module$background = `https://www.${DEPOP_DOMAIN$$module$background}/products/create/`,
DEPOP_API$$module$background = "https://webapi.depop.com/",
DEPOP_API_CREATE_PRDUCT$$module$background = `${DEPOP_API$$module$background}api/v2/products/`,
DEPOP_API_DELETE_PRDUCT$$module$background = `${DEPOP_API$$module$background}api/v1/products/`,
DEPOP_IMAGE_FILE_UPLOAD_FETCH_URL$$module$background = `${DEPOP_API$$module$background}api/v2/pictures/`,
DEPOP_ADDRESS_FETCH_URL$$module$background = `${DEPOP_API$$module$background}api/v1/addresses/`;

class DepopClient$$module$background {
    constructor() {}
    initialize() {
        return new Promise(async (a, b) => {
            chrome.cookies.getAll({
                domain: DEPOP_DOMAIN$$module$background
            }, c => {
                c.forEach(d => {
                    switch (d.name) {
                        case "_px2":
                            this._xpxCookie = d.value;
                            break;
                        case "access_token":
                            this._bearerToken = d.value;
                            break;
                        case "user_id":
                            this._userId = d.value
                    }
                });
                console.log(c);
                this._bearerToken && this._userId ? a() : b(`Not all information of Depop found: access token: ${this._bearerToken}, xpxCookie: ${this._xpxCookie}, userId: ${this._userId}`)
            })
        })
    }
    async uploadImage(a) {
        let b =
            await (await fetch(DEPOP_IMAGE_FILE_UPLOAD_FETCH_URL$$module$background, {
                method: "POST",
                body: '{"type":"product","extension":"jpg"}',
                headers: {
                    "Content-Type": "application/json",
                    "depop-userId": this._userId,
                    authorization: `Bearer ${this._bearerToken}`,
                    accept: "application/json, text/plain, */*",
                    "accept-language": "en-GB"
                },
                credentials: "include",
                referrer: "https://www.depop.com/",
                referrerPolicy: "strict-origin-when-cross-origin",
                mode: "cors"
            })).json();
        await fetch(b.url, {
            method: "PUT",
            body: a,
            headers: {
                "Content-Type": "image/jpeg"
            }
        });
        return b.id
    }
    async getBrands() {
        var a = await fetch(DEPOP_CREATE_PRODUCT_PAGE$$module$background, {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "Depop-UserId": this._userId,
                Authorization: `Bearer ${this._bearerToken}`
            },
            credentials: "include"
        });
        return JSON.parse((new DOMParser).parseFromString(await a.text(), "text/html").body.getElementsByTagName("script")[0].innerText).props.pageProps.productAttributes.brand
    }
    async getPostalAddressForAuthenticatedUser(a) {
        return new Promise(async (b,
            c) => {
            c = await fetch(DEPOP_ADDRESS_FETCH_URL$$module$background + "?providers=" + a, {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    "Depop-UserId": this._userId,
                    Authorization: `Bearer ${this._bearerToken}`,
                    referrer: "https://www.depop.com/",
                    referrerPolicy: "strict-origin-when-cross-origin",
                    mode: "cors"
                },
                credentials: "include"
            });
            b(await c.json())
        })
    }
    async postListing(a) {
        return new Promise(async (b, c) => {
            c = await fetch(DEPOP_API_CREATE_PRDUCT$$module$background, {
                method: "POST",
                body: JSON.stringify(a),
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    "Depop-UserId": this._userId,
                    Authorization: `Bearer ${this._bearerToken}`,
                    referrer: "https://www.depop.com/",
                    referrerPolicy: "strict-origin-when-cross-origin",
                    mode: "cors"
                },
                credentials: "include"
            });
            if (201 !== c.status) {
                c = await c.text();
                try {
                    var d = JSON.parse(c);
                    d.message ? "non_field_errors: wrong variant_set for category" == d.message ? b({
                            success: !1,
                            message: "Please select your correct country in the Crosslist account settings!",
                            internalErrors: [c]
                        }) :
                        b({
                            success: !1,
                            message: d.message,
                            internalErrors: [c]
                        }) : b({
                            success: !1,
                            message: "An unexpected error occured",
                            internalErrors: [c]
                        });
                    return
                } catch (e) {
                    b({
                        success: !1,
                        message: "An unexpected error occured",
                        internalErrors: [c]
                    });
                    return
                }
            }
            d = await c.json();
            b({
                success: !0,
                product: {
                    id: d.id,
                    url: "https://www.depop.com/products/" + d.slug
                }
            })
        })
    }
}

class DepopListing$$module$background {
    constructor(a, b) {
        this._tldCurrencies = {
            "co.uk": "GBP",
            ca: "CAD",
            "com.au": "AUD"
        };
        this._tldCountryCodes = {
            "co.uk": "GB",
            ca: "CA",
            "com.au": "AU"
        };
        this._countryNames = {
            GB: "United Kingdom",
            US: "United States",
            AU: "Australia",
            CA: "Canada"
        };
        this._depopClient = a;
        this._tld = b
    }
    _mapConditionToIndex(a) {
        switch (a) {
            case "NewWithTags":
                return "brand_new";
            case "NewWithoutTags":
                return "used_like_new";
            case "VeryGood":
                return "used_excellent";
            case "Good":
                return "used_good";
            case "Fair":
                return "used_fair";
            case "Poor":
                return "used_fair";
            default:
                return null
        }
    }
    async _mapBrand(a) {
        if (!a) return null;
        for (var b = await this._depopClient.getBrands(), c = 0; c < b.length; c++)
            if ("active" == b[c].status && b[c].name.toLowerCase() == a.toLowerCase()) return b[c].id
    }
    async _mapPhotos(a) {
        a = await Crosslist.getProductMedia(a, 8, !0);
        var b = [];
        if (a)
            for (var c = 0; c < a.length; c++) b.push(this._depopClient.uploadImage(a[c]));
        return await Crosslist.chunkConcurrentRequests(b, 4)
    }
    _mapGender(a) {
        if ("womenswear" == a) return "female";
        if ("menswear" == a) return "male";
        if ("kidswear" == a) return null
    }
    _getProvider(a) {
        return "co.uk" == a ? "MY_HERMES" : "USPS"
    }
    _mapParcelSize(a, b) {
        if ("USPS" == b) {
            if (4 >= a) return "under_4oz";
            if (8 >= a) return "small";
            if (12 >= a) return "under_12oz";
            if (16 >= a) return "under_1lb";
            if (32 >= a) return "medium";
            if (160 >= a) return "large";
            throw {
                success: !1,
                message: "Depop only supports package weights up to 10lbs.",
                type: "validation",
                internalErrors: "Package too heavy"
            };
        }
        if ("MY_HERMES" == b) {
            if (35.27 >= a) return "small";
            if (70.54 >= a) return "medium";
            if (176.36 >= a) return "large";
            throw {
                success: !1,
                message: "Depop only supports package weights up to 5kg.",
                type: "validation",
                internalErrors: "Package too heavy"
            };
        }
    }
    async map(a) {
        var b = {
            address: this._countryNames[this._tldCountryCodes[this._tld] ?? "US"] ?? "United States",
            countryCode: this._tldCountryCodes[this._tld] ?? "US",
            geoLat: 39.3812661305678,
            geoLng: -97.9222112121185,
            brand: await this._mapBrand(a.brand) ?? void 0,
            colour: a.color ? [a.color.replace("Gray", "grey").toLowerCase().trim()] : [],
            condition: this._mapConditionToIndex(a.condition),
            description: a.description,
            gender: this._mapGender(a.category[0].toLowerCase()),
            isKids: "kidswear" == a.category[0].toLowerCase(),
            nationalShippingCost: "ShipYourOwn" == a.shippingType ? a.domesticShipping.toString() : void 0,
            internationalShippingCost: null != a.worldwideShipping ? a.worldwideShipping.toString() : void 0,
            pictureIds: await this._mapPhotos(a.id),
            priceAmount: a.price.toString(),
            priceCurrency: this._tldCurrencies[this._tld] ?? "USD",
            group: a.category[1],   
            productType: a.category[2],
            variants: a.size[1] ? {
                [a.size[1]]: a.quantity
            } : {},
            quantity: a.quantity,
            variantSetId: a.size[0] ? parseInt(a.size[0]) : void 0,
            attributes: {},
            shippingMethods: [],
            listingLifecycleId: "f1336ad6-822c-4090-b865-acb3a2b3eca2"
        };
        if ("Prepaid" == a.shippingType) {
            var c = this._getProvider(this._tld),
                d = await this._depopClient.getPostalAddressForAuthenticatedUser(c);
            console.log(d);
            if (null == d || 1 > d.length) throw {
                success: !1,
                message: "Please add an address in your Depop account before prepaid posting.",
                type: "validation",
                internalErrors: "No address found in Depop"
            };
            b.shippingMethods = [{
                shippingProviderId: c,
                shipFromAddressId: d[0].id,
                payer: a.sellerPays ? "seller" : "buyer",
                parcelSizeId: this._mapParcelSize(a.shippingWeight, c)
            }];
            b.address = d[0].city + ", " + this._countryNames[d[0].country]
        }
        return b
    }
}