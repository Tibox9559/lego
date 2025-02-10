const axios = require('axios');
const fs = require('fs');

async function getVintedData(productCode, userAgent, cookie) {
    const url = `https://www.vinted.fr/api/v2/catalog/items?page=1&per_page=96&time=${Math.floor(Date.now() / 1000)}&search_text=${productCode}&catalog_ids=&size_ids=&brand_ids=89162,407093,178702&status_ids=6,1&material_ids=`;

    const headers = {
        'User-Agent': userAgent,
        'Cookie': cookie
    };

    try {
        const response = await axios.get(url, { headers });
        const items = response.data.items || [];

        // Extraction des données demandées
        const extractedData = items.map(item => ({
            id: item.id,
            title: item.title,
            price: item.price,
            discount: item.discount || 0,
            url: `https://www.vinted.fr/items/${item.id}`,
            photo: item.photos?.[0]?.url || null,
            total_item_price: item.total_item_price,
            status: item.status,
            user: {
                id: item.user?.id,
                login: item.user?.login,
                profile_url: item.user?.profile_url,
                photo: item.user?.photo?.url || null
            }
        }));

        // Sauvegarde dans un fichier JSON
        const fileName = `vinted_data_${productCode}.json`;
        fs.writeFileSync(fileName, JSON.stringify(extractedData, null, 2), 'utf-8');

        console.log(`✅ Données enregistrées dans ${fileName}`);
    } catch (error) {
        console.error('❌ Erreur lors de la requête:', error.response ? error.response.data : error.message);
    }
}

// 🔥 Exemple d'utilisation
const productCode = '42151';  // Remplace par le code produit voulu
const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 Edg/132.0.0.0';  // Remplace par ton User-Agent
const cookie = "v_udt=LzFtWlMrMGRxVnMvRUU0SmEvMWhFSTM4T1QwSy0ta0JaVVM3UWQvOEhLc0owVi0tMFk2RzgwNk1kYUVBL2tQZlBYQlFFUT09; anonymous-locale=fr; anon_id=bf9c597b-4e90-4960-8219-aec81845c93d; anon_id=bf9c597b-4e90-4960-8219-aec81845c93d; viewport_size=1528; v_sid=c6ec8660f4cd467fae01ac859b211537; OptanonAlertBoxClosed=2025-02-09T10:23:37.498Z; eupubconsent-v2=CQMjtNgQMjtNgAcABBENBcFgAAAAAAAAAChQAAAAAAFBIIIACAAFwAUABUADgAHgAQQAyADUAHgARAAmABVADeAHoAPwAhIBDAESAI4ASwAmgBWgDDgGUAZYA2QB3wD2APiAfYB-gEAAIpARcBGACNAFBAKgAVcAuYBigDRAG0ANwAcQBDoCRAE7AKHAUeApEBTYC2AFyALvAXmAw0BkgDJwGXAM5gawBrIDYwG3gN1AcmA5cB44D2gIQgQvCAHQAHAAkAHOAQcAn4CPQEigJWATaAp8BYQC8gGIAMWgZCBkYDRgGpgNoAbcA3QB5QD5AH7gQEAgZBBEEEwIMAQrAhcOAYAAIgAcAB4AFwASAA_ADQAOcAdwBAICDgIQAT8AqABegDpAIQAR6AkUBKwCYgEygJtAUgApMBXYC1AF0AMQAYsAyEBkwDRgGmgNTAa8A2gBtgDbgHHwOdA58B5QD4gH2wP2A_cCB4EEQIMAQbAhWOglAALgAoACoAHAAQAAugBkAGoAPAAiABMACrAFwAXQAxABvAD0AH6AQwBEgCWAE0AKMAVoAwwBlADRAGyAO8Ae0A-wD9gIoAjABQQCrgFiALmAXkAxQBtADcAHEAOoAh0BF4CRAEyAJ2AUOAo-BTQFNgKsAWKAtgBcAC5AF2gLvAXmAvoBhoDHgGSAMnAZVAywDLgGcgNVAawA28BuoDiwHJgOXAeOA9oB9YEAQIWkACYACAA0ADnALEAj0BNoCkwF5ANTAbYA24Bz4DygHxAP2AgeBBgCDYEKyEBwABYAFAAXABVAC4AGIAN4AegBHADvAIoASkAoIBVwC5gGKANoAdSBTQFNgLFAWiAuABcgDJwGcgNVAeOBC0lAiAAQAAsACgAHAAeABEACYAFUALgAYoBDAESAI4AUYArQBsgDvAH4AVcAxQB1AEOgIvASIAo8BYoC2AF5gMnAZYAzkBrADbwHtAQPJADwALgDuAIAAVABHoCRQErAJtAUmAxYBuQDygH7gQRAgwUgbgALgAoACoAHAAQQAyADQAHgARAAmABSACqAGIAP0AhgCJAFGAK0AZQA0QBsgDvgH2AfoBFgCMAFBAKuAXMAvIBigDaAG4AQ6Ai8BIgCdgFDgKbAWKAtgBcAC5AF2gLzAX0Aw0BkgDJ4GWAZcAzmBrAGsgNvAbqA5MB44D2gIQgQtKAIQALgAkAEcAOcAdwBAACRAFiANeAdsA_4CPQEigJiATaApABT4CuwF0ALyAYsAyYBqYDXgHlAPigfsB-4EDAIHgQTAgwBBsCFYAAA.YAAAAAAAAAAA; OTAdditionalConsentString=1~; access_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhcHBfaWQiOjQsImNsaWVudF9pZCI6IndlYiIsImF1ZCI6ImZyLmNvcmUuYXBpIiwiaWF0IjoxNzM5MTkzNTMwLCJzaWQiOiJhZjhlNWI0NC0xNzM5MDk2NTk5Iiwic2NvcGUiOiJwdWJsaWMiLCJleHAiOjE3MzkyMDA3MzAsInB1cnBvc2UiOiJhY2Nlc3MifQ.ucSOd1FMYck6bMEZE4bi-Bw3ai7pVtEQlI5AT_gZY6K354XgiuIN36PmBpAWJc52EJoQBomjqyO0wI8kGbBbhpyt8AOdtvqntuNBvQzztwcYfzHOh-sqh2X83piheAkuN3anpzyiUx75AU6kjUsXKRW1b0stYfQinVBEp3aVudlEzibEG-5-KqOgcd9khx5OaZt_ced2HEeKkegtu9yzU7iBNvOFiBQXtRt_fJOV15HPsqljkhV4Hh6L7om5Ooyak330HT4KZD84d2vaRXkpRWxCBgIgZ5KGdIYHxhMkHj39cYfeGJoJm3DWOAz4hCL5lu639Lp9YVPpGPJtAGYy-Q; refresh_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhcHBfaWQiOjQsImNsaWVudF9pZCI6IndlYiIsImF1ZCI6ImZyLmNvcmUuYXBpIiwiaWF0IjoxNzM5MTkzNTMwLCJzaWQiOiJhZjhlNWI0NC0xNzM5MDk2NTk5Iiwic2NvcGUiOiJwdWJsaWMiLCJleHAiOjE3Mzk3OTgzMzAsInB1cnBvc2UiOiJyZWZyZXNoIn0.SLVZZkHr3E7KNMB7kdlspNB9FeIeRy9NA_AfWBlvGY3LohwcjGApOzDBd1pk7jG7CD66QErdao_pu2c4dLOoMlRhIDHxQu0NoryfJR-KncHvlbfVYXpeX43eYlgsh0o1LaQaz_OF6AJ1kvkLe4LK1NdCZd5WoTbxWY3Ehk6xANhDSBoacV6KkUnp741K-vxUhrriovn_z9s0VcA8rsTGsHP7kneVzW4STTFP4sm9qOZREW1sUGIOeRRhgAMmZjFuSZzQFW5tHy9OiwJ4Nkcwe6H0lAuuxKQwmvyplKxwi7Y3nThds5KWgQBxMb_-hTV9glV_2zQGfHY7kfHUWg1eXg; __cf_bm=G2Ge_hVLp8eS7tDVj8XlV8zHt26PqCOUfhC.EXrEbhc-1739193531-1.0.1.1-dMMhn2Y.AjP4SCtDfFzVw0YjXUotNbS.osDsl_aBYiBCryDUtRfoPYidnsfTAyc2AxT8N7Tm.dnVywmtsd2EAXUzQ_xHwZOXa.fxJCvJk48; cf_clearance=L4jEbzUkDmNmN_Bg4Ld5s09zpyJ8Q6hc6PdjKwnMkUs-1739193532-1.2.1.1-dVmhsV.YOn_wPeQHf5Yj_o3GUxGZuvoeuzoDfihjqw1yfdvzI0xWpHX6uttGpFMLQl1904KH9jtGK_NcjkIvzxjD.YREtnJjoh7ZCeDHpiEL5ZMB2ZMI.Bx3HAHZGrMyeKMi4uB8MKmUGlTNmq.hiKR2e.TsI8zDC0fTAOjVSlGInaTE_Xdcpua7pX5WCcm4kLcMOTFNhBa0cdLG0r5uSyMCmVqFGqEhPc50qWU_Pd7OqOEoNIiAaoXkEmpLrSGBl3Ut89rH.KxrAmSrE6xaFOD.y3izwJcuKNZtmwqSSUU; datadome=D6s73oiEG45MiX2bgA5n5muvfWh71vA5eW5eE~URNKFZ3BkgHQQH_FxoSnBINbLSYkMAJ2JSi_dUxPpiFomTO7Sck6J0x~4fTJAXJ_0nl8YiZpeYyBaymiBnYCw7gwDP; OptanonConsent=isGpcEnabled=0&datestamp=Mon+Feb+10+2025+14%3A19%3A27+GMT%2B0100+(heure+normale+d%E2%80%99Europe+centrale)&version=202312.1.0&browserGpcFlag=0&isIABGlobal=false&consentId=bf9c597b-4e90-4960-8219-aec81845c93d&interactionCount=22&hosts=&landingPath=NotLandingPage&groups=C0001%3A1%2CC0002%3A0%2CC0003%3A0%2CC0004%3A0%2CC0005%3A0%2CV2STACK42%3A0%2CC0015%3A0%2CC0035%3A0&genVendors=V2%3A0%2CV1%3A0%2C&geolocation=FR%3BIDF&AwaitingReconsent=false; _vinted_fr_session=K0dOU045SXR0czZyZERpOWd2S2Vzdmo0ZnBPellWdjhacFYwTzBrMXdsNFFEdFRVT1FMVzU0d2wyZmNoUnV4ZUMxa0MzVjY1a1RSMHdhWFFRNkNPbzJLZW1oN0tyNEJDVjhaVnRlMUJuQ29VbTh5OTFDVTEyNHhnb0dzeWhLK3NnVmhvM2treGl1NTF3VzRYNUsxQ2h2RGdhM2RzUWFGWFk1anRBMHAxNlVWYVErdnlSa3ppWm5aaXV1YStjdHhqVDUrbmwrZ1pRc3ZBcEZsQ0twSWwvNDdEczB4RTlzMEJyUkVXRy9xNU5JUXZzWmZEbTgvY3A3Uy9yTCtrSlBDTm9xZDBCb1Z4NW0rNmtFSTIrZnRpQ2pHbFlqOTg2aWlSeHVOUml0a0dzcm5zRmhnVkZRSWxOTi9IR2llcGtrdkdZVmlCVDNDN3g1dE84Y0Y4TG84emxlZk84bHVZSDhVTVJTUU5JQk4rVUJzPS0tU1M1QWJjbXZpcnF4SmpWKzliU2lGdz09--8ccc1f0a83b32b81343d6e54d1a8a78c77ae95b8; banners_ui_state=PENDING";  // Remplace par ton Cookie Vinted

getVintedData(productCode, userAgent, cookie);