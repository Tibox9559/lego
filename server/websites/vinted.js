const axios = require("axios");
const fs = require("fs");

// Charger les IDs depuis deals.json
function loadProductCodes(filename) {
  try {
    const data = fs.readFileSync(filename, "utf-8");
    const deals = JSON.parse(data);
    return deals.map((deal) => deal.id);
  } catch (error) {
    console.error("❌ Erreur lors de la lecture du fichier deals.json:", error);
    return [];
  }
}

// Charger vinted.json pour éviter de re-scraper les mêmes ID
function loadExistingData(filename) {
  try {
    if (fs.existsSync(filename)) {
      const data = fs.readFileSync(filename, "utf-8");
      return JSON.parse(data);
    }
    return {};
  } catch (error) {
    console.error(
      "❌ Erreur lors de la lecture du fichier vinted.json:",
      error
    );
    return {};
  }
}

// Enregistrer les nouvelles données dans vinted.json
function saveData(filename, data) {
  try {
    fs.writeFileSync(filename, JSON.stringify(data, null, 2), "utf-8");
    console.log(`✅ Données mises à jour dans ${filename}`);
  } catch (error) {
    console.error("❌ Erreur lors de l'enregistrement des données:", error);
  }
}

// Fonction principale pour récupérer les données de Vinted
async function getVintedData(productCode, userAgent, cookie) {
  const url = `https://www.vinted.fr/api/v2/catalog/items?page=1&per_page=96&time=${Math.floor(
    Date.now() / 1000
  )}&search_text=${productCode}&catalog_ids=&size_ids=&brand_ids=89162,407093,178702&status_ids=6,1&material_ids=`;

  const headers = {
    "User-Agent": userAgent,
    Cookie: cookie,
  };

  try {
    const response = await axios.get(url, { headers });
    const items = response.data.items || [];

    return items.map((item) => ({
      id: item.id,
      title: item.title,
      price: item.price,
      discount: item.discount || 0,
      url: `https://www.vinted.fr/items/${item.id}`,
      photo: item.photo.url,
      total_item_price: item.total_item_price,
      status: item.status,
    }));
  } catch (error) {
    console.error(
      `❌ Erreur lors de la requête pour ${productCode}:`,
      error.response ? error.response.data : error.message
    );
    return [];
  }
}

// 🔥 Charger les IDs et les données existantes
const productCodes = loadProductCodes("deals.json");
const existingData = loadExistingData("vinted.json");

const userAgent =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 Edg/132.0.0.0";
const cookie = "v_udt=V2J1enpvY2FMVXB3V1JJUmJGRk01L3pteE05Ty0tTkdOaE50c1FXVjVhNlcwNi0tdkxsNkJvWUEzTUIxYitEblErVnU3QT09; anon_id=4d7f8ee1-dce9-449a-aafd-a601908b682b; anon_id=4d7f8ee1-dce9-449a-aafd-a601908b682b; v_sid=9844d206-1743256565; domain_selected=true; viewport_size=1528; v_sid=9844d206-1743256565; OptanonAlertBoxClosed=2025-03-31T09:14:34.513Z; eupubconsent-v2=CQPIXTAQPIXTAAcABBENBjFgAAAAAAAAAChQAAAAAAFhIIAACAAFwAUABUADgAHgAQQAyADUAHgATAAqgBvAD0AH4AQkAhgCJAEcAJYATQArQBhwDKAMsAbIA74B7AHxAPsA_QCAAEUgIuAjEBGgEcAKCAVAAq4BcwDFAGiANoAbgA4gCHQEiAJ2AUOAo8BSICmwFsALkAXeAvMBhoDJAGTgMuAZzA1gDWQGxgNvAbqA5MBy4DxwHtAQhAheEAOAAOABIAOcAg4BPwEegJFASsAm0BT4CwgF5AMQAYtAyEDIwGjANTAbQA24BugD5AH7gQEAgZBBEEEwIMAQrAhcOAXAAIgAcAB4AFwASAA_ADQAOcAdwBAICDgIQAT8AqABegDpAIQAR6AkUBKwCYgEygJtAUgApMBXYC1AGIAMWAZCAyYBowDTQGpgNeAbQA2wBtwDj4HOgc-A-IB9sD9gP3AgeBBECDAEGwIVjoJYAC4AKAAqABwAEAALoAZABqADwAJgAVYAuAC6AGIAN4AegA_QCGAIkARwAlgBNACjAFaAMMAZQA0QBsgDvAHtAPsA_YCKAIwARwAoIBVwCxAFzALyAYoA2gBuADiAHUAQ6Ai8BIgCZAE7AKHAUfApoCmwFWALFAWwAuABcgC7QF3gLzAX0Aw0BjwDJAGTgMqgZYBlwDOQGqgNYAbeA3UBxYDkwHLgPHAe0A-sCAIELSABIABAAaABzgFiAR6Am0BSYC8gGpgNsAbcA58B8QD9gIHgQYAg2BCshAcAAWABQAFwAVQAuABiADeAHoAd4BFACOAEpAKCAVcAuYBigDaAHUgU0BTYCxQFogLgAXIAycBnIDVQHjgQtJQIwAEAALAAoABwAHgATAAqgBcADFAIYAiQBHACjAFaANkAd4A_ACOAFXAMUAdQBDoCLwEiAKPAU2AsUBbAC8wGTgMsAZyA1gBt4D2gIHkgBwAFwB3AEAAKgAj0BIoCVgE2gKTAYsA3IB-4EEQIMFIGwAC4AKAAqABwAEEAMgA0AB4AEwAKoAYgA_QCGAIkAUYArQBlADRAGyAO-AfYB-gEWAIwARwAoIBVwC5gF5AMUAbQA3ACHQEXgJEATsAocBTYCxQFsALgAXIAu0BeYC-gGGgMkAZPAywDLgGcwNYA1kBt4DdQHJgPHAe0BCECFpQA-ABcAEgAjgBzgDuAIAASIAsQBrwDtgH_AR6AkUBMQCbQFIAKfAV2AvIBiwDJgGpgNeAfFA_YD9wIGAQPAgmBBgCDYEKy0AEBTYAA.YAAAAAAAAAAA; OTAdditionalConsentString=1~; __cf_bm=YtHi47N85U.wAaC0T0Lpio25YONQVIuZH5T.xX_aOFk-1743435862-1.0.1.1-qO9hsD.JxJi_mbibj6YZhBaVLOgCPkhngKawPDRRDxtWljnqBL.bCKkJaTMoSxfxWjrfOLDp.7O6T3wP3jr5JZBb3Qn_rlpH22ueNKY9r9mGmoIBqotsWGCQld9R2JG4; access_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhcHBfaWQiOjQsImNsaWVudF9pZCI6IndlYiIsImF1ZCI6ImZyLmNvcmUuYXBpIiwiaXNzIjoidmludGVkLWlhbS1zZXJ2aWNlIiwiaWF0IjoxNzQzNDM1ODYzLCJzaWQiOiI5ODQ0ZDIwNi0xNzQzMjU2NTY1Iiwic2NvcGUiOiJwdWJsaWMiLCJleHAiOjE3NDM0NDMwNjMsInB1cnBvc2UiOiJhY2Nlc3MifQ.ALN5UcW4C_rLXBDVQnC-OvBO9V89x4a-1ko_9ByaUiDPuLD0kCCdKoviL8uCuslkAhafevGjtVmDILZuY81p17RmvsPlhv_X5ZxjDNg18gHcJU_fKGxWDCB9xepLeMApVrGKKvfShU5r3APCuoqcbTHktoYF8g5BkTPRdFCf2-MpBpAfb4AlTPG7VNNMl8w4kZcx74nBjLwyBt4ZZYf5CGf6imUobDlhmWpAvvnKRGmtsg1XIIOCOrDURayolApQWHPojatlflsQrzxGhM3Yyx77K4UWQwvNVbDE0ZB2irjwD5IBiqdSDQ3GNX6dilmQnMbAwP5yH6O1V9it27igiA; refresh_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhcHBfaWQiOjQsImNsaWVudF9pZCI6IndlYiIsImF1ZCI6ImZyLmNvcmUuYXBpIiwiaXNzIjoidmludGVkLWlhbS1zZXJ2aWNlIiwiaWF0IjoxNzQzNDM1ODYzLCJzaWQiOiI5ODQ0ZDIwNi0xNzQzMjU2NTY1Iiwic2NvcGUiOiJwdWJsaWMiLCJleHAiOjE3NDQwNDA2NjMsInB1cnBvc2UiOiJyZWZyZXNoIn0.BVBRO2o_ECsDa82N2ABmp-8nnvOaE0yyksCVRgNwf75NxNFuT4U1CZ286YPB9SoeOSrCtSbVKlYxt6AF1SH3qVXXHBC2yC1OLJfbI_J1vgQuRvS6Idj4OI9HKkiHKwvrBhYSGnDsFv8j2h_KgUd3tericOMw2IkyUJcEXxsdjHkfXxE1GVcujXmq0ajytc8XxkKfNzWsIrpeXU6xQg8hGaZjsEqQj5B7pTowkiotai0vIhlDXpDUj0mSm0NRnXCoGR2P-tdiO6R6FY8Qg6KehhHiY3h5jIr5y460Sd4wIMeGgZIzcd9LAJ_GQ_Zw4kBrKsiPfbTVK8qZefIpKVbUsQ; cf_clearance=gp0O6O8Q.8HgAPu5_nYgd_1LmQ88UgmdpR8kO2kpMvE-1743435864-1.2.1.1-hX_PTQRZZA5n.mJt50of.9iwQkXMUb4BtG.8MlpLONcpjF8o4hIxP6m_QN1nP19C1UMOTeY_Lq3B5wJbvRNG_dZjHPiKTjm080EVY4jjdYY17RVCkEX_piHuK1T8o6CeaHC7p_7wencF.e73VammywkT2RreTi9VgEYfC70gm0vTAHnvElaYCCZL5FBEgYfyGS.n04sjMBt9ntYPm.Gm0GbDudLSXaSw3ShBaqKEhj1NDQzEIFYKelZ.MzA5d3rlVolXRsYWpPx0AsX1YaE1wdW9J0viVT631ienhOXok4U4mUVCfMMPFZsgBjZ8uqAm1peQo26CuzpUh1UBBNYHpMX5b7E28RbG8YT8iDe2MPKIeFTn8I9QEnCgAlkTurZqY2oQ57adpHrZNyUSZ3D7J8o9ZzNZ0noKZHd2tSQJTf4; OptanonConsent=isGpcEnabled=0&datestamp=Mon+Mar+31+2025+17%3A44%3A57+GMT%2B0200+(heure+d%E2%80%99%C3%A9t%C3%A9+d%E2%80%99Europe+centrale)&version=202312.1.0&browserGpcFlag=0&isIABGlobal=false&consentId=4d7f8ee1-dce9-449a-aafd-a601908b682b&interactionCount=28&hosts=&landingPath=NotLandingPage&groups=C0001%3A1%2CC0002%3A0%2CC0003%3A0%2CC0004%3A0%2CC0005%3A0%2CV2STACK42%3A0%2CC0015%3A0%2CC0035%3A0&genVendors=V2%3A0%2CV1%3A0%2C&geolocation=FR%3BIDF&AwaitingReconsent=false; _vinted_fr_session=SHRPVnNYSW5UaTQ3bXhwNjNsYlJDcWZLZnQ0ck1lU2d3SWdtdjBiTWN5aDFMNGFVTGZFQzNxMXNSRy9KOTY3VytGOVBVQldFc1N2MkExdU9zNklxK05Qa1NSRWFrcnBsUm8zQzVKcGYrL1pKREUrTlVKK0ZuVERObUIwdlJsTjI2YUErdVRDNzFOeG93SC9sNHBPUnZmbXRUQ042V0Q5RERBbCtyN3ZNMzMrV25DQzhSVzgwUTd6c3ZOcEthOFN2L1pHM3BQYm1TYk9PSUovUm11UWpHTnB6LzdiZGphUGFQRXBidnJSL2t3RURsTC9JVUIxL3U3NU1XVGprNS9pdWNwR1pxUXR1bTZ1VDFOYklHb3lKcHMvaTU3ZXI5UjlyRG5LZy9VWkl5NzBvc3VpL2dpMFpQdThkUjRHKys5RVdTeW9tcVBNMG83Njdkc3UrYkNraGRLOUhtVFF5bFpzWURXZ0RFRnhuTFFOdGF2N3dBd0oraUMrS2o2cUJoYlErNERSamJoOWJRcWlRaDJaamE5NWhma05MMGE4VGZ6dm5JTmIwQXNQSjJ0U1VTTEdFOTdTWWxOaDlCSzhLTjhHVEFKT2ZhSGZNRE5xZDNuZDE4djZEWmFuMGNTNEl0WUNMcTlsdDhOTlljdkRjQnEzNmM3eHJIbkVnY0pxejN1YVh3ZWpudFFxbzZCZjkyNXdoR1NFVTZGVFplSHM3QnJ2R1hXRnhpQVZKSllFeUlCeGNGT1VqQVpxcjNDdEN1cUpTQ2xUeXhHMjI4aHpQemxiZWN3RWUyWWhJbDRNSVIxVlNlS3FUc0hSWjRGUTlKTkRlTllzWHI5emI0NXR0QXliYVVtWTNxNEwyTTRZNUJNd08zajU2RGlvNE85ZUt1dzZsQUZPVmQ3U2tUMDU0UjJYZnlUT3RzRGZCR3hlejU0OWp2RVY3L3ozYXpUM3pCYkNwblI1bDVBQTFJS2J5Vksybi84Tnp5MW5KUEZxeXFWMmw5QWNPZ09oeHpoMlJpczR0QnVGMERkbmJZeUlFQksxSWxUQ0NHVExPSDFlZ05WdjdkZmp3Vk50MUx2N0dkZHpWdU5CSDFOcmgrQmNvait0RGxQOEt3T3lYN1pqbVJ5VVhVYjhZcEdXd2JiNlh6QlFuS3ZBSkdYb2VDMHFJUGdWT0s3ZC8rOWJhK1Z5MnlLcE0rUm1zWk0rd1NmRUxZQXAyb3hUbTVYcDZpUjhYeVNNcWNaYnVSQUFmOEdPRVpUQVJnZXBodHU2S2ZJZ0RiN1JRdktibklZVzY3YVAzRnNiQ1F0M1g2amFOZDVJOTFNenFMV2lIeitFSXhWWmgzd2FVVkVoeENYa3R4ekJhVXk0c29kaFlSRWt3ZytwZUg2REpsSHk2UTJPKzRsek9xTUN6d2NYemoxUHoveERqeit6WE1uWU0yZllPL2NYRVUvNU1MRjA5REdsLy9qdFdMMjhqZ3lma2ZseTd2UkFzdkdXQTlMY3RUSFpWK0d3WHhmQWxPUmYwb1NidFZjRGJ2bzlkSk9VWHI1bE5wc1BoRDcvQVU3M2sreTFSM2ExYjZqck1BQTMreW5CRXBpYUdUWXZtZGdPSDZIWGIxV1ZCSnVySzV2QXQySDlCaFFaUEthSW1sUEtmL2QzTVRMM1VSUHBXTXJzSTV0eFltT09pc01lV2s0cjhQbHc5Wk1uNkRpdG51b05XMEsxcGtwQlNrbnFxZzNIUzI2aXBNY3g4UWJGTlRNYmxyYUwycEJlaDZOU1h6dmlZOWlMNmtrajRHdVRvY3AzeHk3S1FLYTZ5VkNXQWFGenRadGRUeHdXdzNKSzIxRHhNbGkxc25iVE5WV2ovM00ydGRXMm5LWGI4VEV2YU9Ma0FDeGxtakt4V0ozZlY5WURIVkpteUpuTm1JRzZHSlg1dHhqZU1hNmVHT21KeHZuSTlqbzZnV25WME1BaUdBR2NjSm9sSUxNS3Y0KzZaRUVWNlg1aG5IR2NUMWU3YnM0YklXVUVqbG1USCt1aWpGQmNFZXZSRGU5N0ZZTmorSlFneng4azRsRHBIVkZrdHZxT0lDN2t2dnc4bzR4L2M1bjlUb2xrcXJFSFVERkdoMHZUQ0crWUZGcWJLdEs4cmNxVGM1OHVIR0VuQ1JPQ0hzRGt5c3RXTTROR1ltOWxiemRKb2lyMUh1dEZWbVhSLzN5OWtFTWI1d2Z4YnF3WjIweThoY2FZaDA2cnBkekFvZkZrWm5QdkR2RXpDUGxFUm5rRHQycFFscEh4dGx3SjNOZGZTeVVMaWlzZWdHQlk3RFlkcWtEMHRsS3dLRXY5U1V5TGFwc2RiVGRDb3MxdUk4amNyZm5VMkVNMGwxU3dheG5TUmlwcEg5SGVtU0tqYy0tN3k5MUJtR3NVbXQ4TGtOZEZpSGQ0Zz09--8a8ab56aeb1896b6d04508c7e1e212f1dc1948a6; datadome=O6CPPDOZ~YKGYqe_0HlJFgH7UZrjyuR79WNap~K~ufKDXPGzsu_VX8gsZgtdBcPgBc68SQHTTVp_7iEaSpv9DrVHGR8wiT4AJW_~KsaR4gBlNlusNaKgAY_NXZrNZJ9f; banners_ui_state=PENDING";

(async () => {
  let newData = { ...existingData };

  for (const productCode of productCodes) {
    if (newData[productCode]) {
      console.log(`⏭️  ID ${productCode} déjà scrappé, passage.`);
      continue;
    }

    console.log(`🔍 Scraping pour ID: ${productCode}...`);
    const scrapedData = await getVintedData(productCode, userAgent, cookie);

    if (scrapedData.length > 0) {
      newData[productCode] = scrapedData;
    }
  }

  saveData("vinted.json", newData);
})();
