const axios = require('axios');
const fs = require('fs');

// Charger les IDs depuis deals.json
function loadProductCodes(filename) {
    try {
        const data = fs.readFileSync(filename, 'utf-8');
        const deals = JSON.parse(data);
        return deals.map(deal => deal.id); // Récupère uniquement les IDs
    } catch (error) {
        console.error('❌ Erreur lors de la lecture du fichier deals.json:', error);
        return [];
    }
}

// Charger vinted.json pour éviter de re-scraper les mêmes ID
function loadExistingData(filename) {
    try {
        if (fs.existsSync(filename)) {
            const data = fs.readFileSync(filename, 'utf-8');
            return JSON.parse(data);
        }
        return {};
    } catch (error) {
        console.error('❌ Erreur lors de la lecture du fichier vinted.json:', error);
        return {};
    }
}

// Enregistrer les nouvelles données dans vinted.json
function saveData(filename, data) {
    try {
        fs.writeFileSync(filename, JSON.stringify(data, null, 2), 'utf-8');
        console.log(`✅ Données mises à jour dans ${filename}`);
    } catch (error) {
        console.error('❌ Erreur lors de l\'enregistrement des données:', error);
    }
}

// Fonction principale pour récupérer les données de Vinted
async function getVintedData(productCode, userAgent, cookie) {
    const url = `https://www.vinted.fr/api/v2/catalog/items?page=1&per_page=96&time=${Math.floor(Date.now() / 1000)}&search_text=${productCode}&catalog_ids=&size_ids=&brand_ids=89162,407093,178702&status_ids=6,1&material_ids=`;

    const headers = {
        'User-Agent': userAgent,
        'Cookie': cookie
    };

    try {
        const response = await axios.get(url, { headers });
        const items = response.data.items || [];

        return items.map(item => ({
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
    } catch (error) {
        console.error(`❌ Erreur lors de la requête pour ${productCode}:`, error.response ? error.response.data : error.message);
        return [];
    }
}

// 🔥 Charger les IDs et les données existantes
const productCodes = loadProductCodes('deals.json');
const existingData = loadExistingData('vinted.json');

const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 Edg/132.0.0.0';
const cookie = "v_udt=aW1tKzFyVU8vYnFUOEZVRHFmdmVNd2p1WW9jQy0tcVBkZHlId282d2hYcEdEbS0tTlZwVzV6Z3dLNENhK2NSL2RPOWtsQT09; anonymous-locale=fr; anon_id=58b6a9d0-2145-4220-92a0-c845a3b03346; access_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhcHBfaWQiOjQsImNsaWVudF9pZCI6IndlYiIsImF1ZCI6ImZyLmNvcmUuYXBpIiwiaXNzIjoidmludGVkLWlhbS1zZXJ2aWNlIiwiaWF0IjoxNzQyODIzMzMwLCJzaWQiOiI0YTNhYTI1Yi0xNzQyODIzMzMwIiwic2NvcGUiOiJwdWJsaWMiLCJleHAiOjE3NDI4MzA1MzAsInB1cnBvc2UiOiJhY2Nlc3MifQ.mE65Nt5VRYGuE0bNEmInS1LpNK4HvOO-66zFA0lrGOy29BDcSuSXAy1GffQdHWJ-vSPuRcYpv3om_ennBhOnvsAD1qvuGz4gHKzKslaSiGGvw2vvqOx6vQhY_D9lEV65qdeF4pO83Du-7CIFDrEpD-dnXeFiwHEZpMTE0CMKRQ3_DgTL061I_yru0wMYIoqNyWa_JIEmZX-53YcPEFS8tUFXD8EnfxrJhHAkwyYdQJ8fnN72T97tMCk3Qjq6cKNn__4kNVPnQjXUcR6nke2lrUjemUcu1bFhYoTXS3sIsrFemm4CpmfnXyyPzR0reSqvMOtp4HKZ0rvUUGMTbgD6hA; refresh_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhcHBfaWQiOjQsImNsaWVudF9pZCI6IndlYiIsImF1ZCI6ImZyLmNvcmUuYXBpIiwiaXNzIjoidmludGVkLWlhbS1zZXJ2aWNlIiwiaWF0IjoxNzQyODIzMzMwLCJzaWQiOiI0YTNhYTI1Yi0xNzQyODIzMzMwIiwic2NvcGUiOiJwdWJsaWMiLCJleHAiOjE3NDM0MjgxMzAsInB1cnBvc2UiOiJyZWZyZXNoIn0.xUoMXzLULeRcYjgUkEgMEezdTW_jiLFFIgCWO2DCS2Py-l6J6xFKkhy9xBY20gskikFEf1rK-nDIy_vA8uxNzJtVEQu3zWsLS4MkmWjNzTogehMNflaelHgLWdKXi1N1siTb0lYQdPrgwfyjNcMLeOoIyiyCMVIufgAXz0my2JcXqPPWUO8LAaAgGLjPOKjoTljKsRlKYrHZtACBK8jaSAOAHhUqWmwdKbwjBmTb7Tf9VYBgptATOGWkG5gSZeQXrmgFD692BIU3nYv_ImdUO7-ObuCpM8OdSezYkDjHanI19VeU27aYZ3eR7ZUklXt2B8x5nQYtO2JAijZpB7SBZg; anon_id=58b6a9d0-2145-4220-92a0-c845a3b03346; __cf_bm=w0JuP8BL0dfMV6UaQa0XbhTei3RjHA.bC_4vKle7pWY-1742823331-1.0.1.1-qmyfOB3Jxy_XPpo4RBkhQiOUJI3xYlnyyUJCNynUcjeE_4.YVO.x7fDfnTvISxELXD94VzZxsGiKsZca35VINVbg.GR43vGb8SG879MxpFDPLJOZVxyUJjEJ9G2g74Qg; cf_clearance=LPGedsaRCGn_5ABaM1S1Fa9Meqb.OCkpv7VoGsn7KnY-1742823332-1.2.1.1-xRHnYxXiGdT7vVq8ZSG9UT35uBxeRMrg7iaMcjhnXO1hLDH2ItLLea7GfO72JLhQQJF54lpatSnWIMmiLSwu8UuSzLG_Dc5sB1JtJxZZD_dQwpNPFJdujmF_E_8LDH8yt.msQmsgOzg2pxdtwqZY0TrivvMZ17wLbj9Zq3xgXoi04RtumeqHCdbF8NyT5RlAQv27GPi07JxvisxsmjNexh35GaEAGZeON97k._sfozxT9dBq0EJ2Cm.Ku9GNh1Y7FQ4PSWEux89IAFqLEAm7KqWMLzyPWct2u1x1naSk4Ku_9Ly72LE5yJmvPpvCjgXw4aoQciU5Co9wfFpCJYkJKYFNOkRSQqycC67eiKwAjb8; viewport_size=1528; v_sid=0c48af21482fd3a019ad6c2f0490f1bb; OptanonAlertBoxClosed=2025-03-24T13:35:42.598Z; eupubconsent-v2=CQOxbhgQOxbhgAcABBENBiFgAAAAAAAAAChQAAAAAAFhIIAACAAFwAUABUADgAHgAQQAyADUAHgATAAqgBvAD0AH4AQkAhgCJAEcAJYATQArQBhwDKAMsAbIA74B7AHxAPsA_QCAAEUgIuAjABGgCggFQAKuAXMAxQBogDaAG4AOIAh0BIgCdgFDgKPAUiApsBbAC5AF3gLzAYaAyQBk4DLgGcwNYA1kBsYDbwG6gOTAcuA8cB7QEIQIXhADoADgASADnAIOAT8BHoCRQErAJtAU-AsIBeQDEAGLQMhAyMBowDUwG0ANuAboA8oB8gD9wICAQMggiCCYEGAIVgQuHALwAEQAOAA8AC4AJAAfgBoAHOAO4AgEBBwEIAJ-AVAAvQB0gEIAI9ASKAlYBMQCZQE2gKQAUmArsBagDEAGLAMhAZMA0YBpoDUwGvANoAbYA24Bx8DnQOfAeUA-IB9sD9gP3AgeBBECDAEGwIVjoJQAC4AKAAqABwAEAALoAZABqADwAJgAVYAuAC6AGIAN4AegA_QCGAIkARwAlgBNACjAFaAMMAZQA0QBsgDvAHtAPsA_YCKAIwAUEAq4BYgC5gF5AMUAbQA3ABxADqAIdAReAkQBMgCdgFDgKPgU0BTYCrAFigLYAXAAuQBdoC7wF5gL6AYaAx4BkgDJwGVQMsAy4BnIDVQGsANvAbqA4sByYDlwHjgPaAfWBAECFpAAmAAgANAA5wCxAI9ATaApMBeQDUwG2ANuAc-A8oB8QD9gIHgQYAg2BCshAbAAWABQAFwAVQAuABiADeAHoAd4BFACUgFBAKuAXMAxQBtADqQKaApsBYoC0QFwALkAZOAzkBqoDxwIWkoEQACAAFgAUAA4ADwAJgAVQAuABigEMARIAjgBRgCtAGyAO8AfgBVwDFAHUAQ6Ai8BIgCjwFNgLFAWwAvMBk4DLAGcgNYAbeA9oCB5IAeABcAdwBAACoAI9ASKAlYBNoCkwGLANyAeUA_cCCIEGCkDUABcAFAAVAA4ACCAGQAaAA8ACYAFUAMQAfoBDAESAKMAVoAygBogDZAHfAPsA_QCLAEYAKCAVcAuYBeQDFAG0ANwAh0BF4CRAE7AKHAU2AsUBbAC4AFyALtAXmAvoBhoDJAGTwMsAy4BnMDWANZAbeA3UByYDxwHtAQhAhaUAQAAXABIAI4Ac4A7gCAAEiALEAa8A7YB_wEegJFATEAm0BSACnwFdgLyAYsAyYBqYDXgHlAPigfsB-4EDAIHgQTAgwBBsCFZaACApsAA.YAAAAAAAAAAA; OTAdditionalConsentString=1~; banners_ui_state=SUCCESS; OptanonConsent=isGpcEnabled=0&datestamp=Mon+Mar+24+2025+14%3A37%3A19+GMT%2B0100+(heure+normale+d%E2%80%99Europe+centrale)&version=202312.1.0&browserGpcFlag=0&isIABGlobal=false&consentId=58b6a9d0-2145-4220-92a0-c845a3b03346&interactionCount=5&hosts=&landingPath=NotLandingPage&groups=C0001%3A1%2CC0002%3A0%2CC0003%3A0%2CC0004%3A0%2CC0005%3A0%2CV2STACK42%3A0%2CC0015%3A0%2CC0035%3A0&genVendors=V2%3A0%2CV1%3A0%2C&geolocation=FR%3B&AwaitingReconsent=false; datadome=UiSR96SuE9KRACY9oPxxCHCbIVdyV3fUDLxBcdniE8CTijiH~gQdf63xta6nIjIjNxmjrfN3sHdXMYqP9qDlTk4cMma3gk9TSpkBqhzB9zAfg50qLRRy4ayxvTrhb4UK; _vinted_fr_session=bkdjUkV6eVBTaXBZYVdYaXVPOWlwMEFUSHNHUHBjSk9DaFpyMTY4d0w1WXFKZFpEZzg3dENQWGpqbFVpa2Nuc1hsYWhmU1Faek5xRUJiR3huazRLS1kxQlRkdHhpQ3hCMVdjZ1JGVnQyaVRiemVmMWt1Z2ZheVkyalI3QTRBSXFGUVlwVVVwa3JoQm42Q2ZGYXlvSmNxamRwNVVDWkQzQklBRjJqT3JBU0Zaa1pQK2tFOVF1VlZqcjhCTkEyd1RZTGxrcFpqc1p3SERvcFRCeUYyN05SVStHSmRoWnFyNmNqczVxa2FSUGJqL1JjZ3QzaXc0c05sOFNaY0lYZUdJVS0tZXNXL2xNMEZDd3hrOHZsb1FVYzJIUT09--976513a46f24265bef59c6cc7cfd3710da18c967"; // Remplace avec ton cookie

(async () => {
    let newData = { ...existingData }; // Cloner les données existantes

    for (const productCode of productCodes) {
        if (newData[productCode]) {
            console.log(`⏭️  ID ${productCode} déjà scrappé, passage.`);
            continue; // Sauter le scraping si l'ID existe déjà
        }

        console.log(`🔍 Scraping pour ID: ${productCode}...`);
        const scrapedData = await getVintedData(productCode, userAgent, cookie);

        if (scrapedData.length > 0) {
            newData[productCode] = scrapedData; // Ajouter les nouvelles données sous l'ID correspondant
        }
    }

    saveData('vinted.json', newData);
})();
