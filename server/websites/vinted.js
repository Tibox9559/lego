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
const cookie = "v_udt=V2J1enpvY2FMVXB3V1JJUmJGRk01L3pteE05Ty0tTkdOaE50c1FXVjVhNlcwNi0tdkxsNkJvWUEzTUIxYitEblErVnU3QT09; anon_id=4d7f8ee1-dce9-449a-aafd-a601908b682b; v_sid=9844d206-1743256565; domain_selected=true; v_sid=9844d206-1743256565; OptanonAlertBoxClosed=2025-03-31T09:14:34.513Z; eupubconsent-v2=CQPIXTAQPIXTAAcABBENBjFgAAAAAAAAAChQAAAAAAFhIIAACAAFwAUABUADgAHgAQQAyADUAHgATAAqgBvAD0AH4AQkAhgCJAEcAJYATQArQBhwDKAMsAbIA74B7AHxAPsA_QCAAEUgIuAjEBGgEcAKCAVAAq4BcwDFAGiANoAbgA4gCHQEiAJ2AUOAo8BSICmwFsALkAXeAvMBhoDJAGTgMuAZzA1gDWQGxgNvAbqA5MBy4DxwHtAQhAheEAOAAOABIAOcAg4BPwEegJFASsAm0BT4CwgF5AMQAYtAyEDIwGjANTAbQA24BugD5AH7gQEAgZBBEEEwIMAQrAhcOAXAAIgAcAB4AFwASAA_ADQAOcAdwBAICDgIQAT8AqABegDpAIQAR6AkUBKwCYgEygJtAUgApMBXYC1AGIAMWAZCAyYBowDTQGpgNeAbQA2wBtwDj4HOgc-A-IB9sD9gP3AgeBBECDAEGwIVjoJYAC4AKAAqABwAEAALoAZABqADwAJgAVYAuAC6AGIAN4AegA_QCGAIkARwAlgBNACjAFaAMMAZQA0QBsgDvAHtAPsA_YCKAIwARwAoIBVwCxAFzALyAYoA2gBuADiAHUAQ6Ai8BIgCZAE7AKHAUfApoCmwFWALFAWwAuABcgC7QF3gLzAX0Aw0BjwDJAGTgMqgZYBlwDOQGqgNYAbeA3UBxYDkwHLgPHAe0A-sCAIELSABIABAAaABzgFiAR6Am0BSYC8gGpgNsAbcA58B8QD9gIHgQYAg2BCshAcAAWABQAFwAVQAuABiADeAHoAd4BFACOAEpAKCAVcAuYBigDaAHUgU0BTYCxQFogLgAXIAycBnIDVQHjgQtJQIwAEAALAAoABwAHgATAAqgBcADFAIYAiQBHACjAFaANkAd4A_ACOAFXAMUAdQBDoCLwEiAKPAU2AsUBbAC8wGTgMsAZyA1gBt4D2gIHkgBwAFwB3AEAAKgAj0BIoCVgE2gKTAYsA3IB-4EEQIMFIGwAC4AKAAqABwAEEAMgA0AB4AEwAKoAYgA_QCGAIkAUYArQBlADRAGyAO-AfYB-gEWAIwARwAoIBVwC5gF5AMUAbQA3ACHQEXgJEATsAocBTYCxQFsALgAXIAu0BeYC-gGGgMkAZPAywDLgGcwNYA1kBt4DdQHJgPHAe0BCECFpQA-ABcAEgAjgBzgDuAIAASIAsQBrwDtgH_AR6AkUBMQCbQFIAKfAV2AvIBiwDJgGpgNeAfFA_YD9wIGAQPAgmBBgCDYEKy0AEBTYAA.YAAAAAAAAAAA; OTAdditionalConsentString=1~; __cf_bm=CNFv9tqLVfntJFkZJbhjVUrnLbqiMYFHQbJ_iwaQM7Y-1743964571-1.0.1.1-A5eE71bieEahEN8flhlVtxKqg79EZiviG.QjNlXbVIwJcQPv3ahhHY5Kjt3DTyG548HcHzjeEwt9gn_z1UGg3zEfKnC893NqJ4HGc16ScwPG9NQve4K48zGMhQ5xPlPV; cf_clearance=BDkCUOJkN986oXCVVBbY1zvX_x0yPxiyhaOcz5zfWqE-1743964574-1.2.1.1-W7GG.ywPWXT__7siN6.TqHWpD0SJWmvaT9qKf4_Jzf3mZnaVpPM7LUGcBCRTvs1cFq000huNrQSVMFSsvoYBHNa1IqWjor8wpONmd2XzLIqjoh0081Gz6vASvUqCa1DAVil7pz9.qJyiTsJqp3Skj31t_Kh2u6B_b3bG5ne2RxHwB.wJxWgpUNFGz_8CT3WRtGJGedcqr6oRruMKn_iy_cWm74axYjb.x82LQwImbLKtrMk.VOJi6opbegpD.zUDRcvuvRT6B6WKTW2mWCkw2Djm3rr9zzNYMaz7r9awAa991sf1MRabR9fgg7Dh46.HrG41j5mlIEpCD625.d36bZdxTLOoL3S8K5.5k7KexDqbK3wlis_oe5EznXRMfRzRwN_TLh_OzrnmWFNiJ.hYK2xD_ndJ5PFQ0teQgqi_Isw; access_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhcHBfaWQiOjQsImNsaWVudF9pZCI6IndlYiIsImF1ZCI6ImZyLmNvcmUuYXBpIiwiaXNzIjoidmludGVkLWlhbS1zZXJ2aWNlIiwiaWF0IjoxNzQzOTY0NTc0LCJzaWQiOiI5ODQ0ZDIwNi0xNzQzMjU2NTY1Iiwic2NvcGUiOiJwdWJsaWMiLCJleHAiOjE3NDM5NzE3NzQsInB1cnBvc2UiOiJhY2Nlc3MifQ.aiDq-CXXZfiek3MnMJv7_H8kkK0To68SDRsKJ8p4osl5f5TaK-JYseUfrf-IQGrB1MUVQYGilmspRsZCw7fbShiElsUMT9Lk8lqMIzJPv9omG3tK0yb7F_zagHkaCJ8NHexLXYbH9ByAW2a9ZuyCt_UPl-TlQjMwtZ6jr5W4LgpduXKh-Nmn2fRMi8Oi8EaPQZSIYYNHvabzFsbGxgXkbJVneAw_iZoHJeSMcnPw1QaddE47sqGF5JLArEDWWlLiljKXd-tbn-7iMstpbwyKrXCUSTBvzSh7EwHYJcKusyjbKcCJ4gTsBZ_fgcEfUbruIRtFgYCHG92WWfGIMwGG-A; refresh_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhcHBfaWQiOjQsImNsaWVudF9pZCI6IndlYiIsImF1ZCI6ImZyLmNvcmUuYXBpIiwiaXNzIjoidmludGVkLWlhbS1zZXJ2aWNlIiwiaWF0IjoxNzQzOTY0NTc0LCJzaWQiOiI5ODQ0ZDIwNi0xNzQzMjU2NTY1Iiwic2NvcGUiOiJwdWJsaWMiLCJleHAiOjE3NDQ1NjkzNzQsInB1cnBvc2UiOiJyZWZyZXNoIn0.ZQK7c4eBpIhOIWLWAAhS1B6Q5g6kIvd4NIs0r9I9FPgha5KVbIIgya4TrhNDErs5O7bkZjeOpewx4dUJ8za8aIigCkdaiHpomfEVRtHJ0xVsuhmsCNbHUxJvmplawPPPgRGFKiEGKwK7xoQYzytli5HPdbA26UJIzzCSMN-xkVCLwgwKFxxK8MM1cb2BwvQk-hH2euz6IypwfA8y8xHnFsHKO44G6cdPZvDp9eQnt_sfB2-9B1X78RGVsmI6l34UeS8igGhlL3bRTqsa7KbpYRGvPiUDt-o5d5htgKPfHYd5wkMqAk3JZHCxvPXiz6KTI4gxCVZt--X42Fz5fozkuA; viewport_size=1532; OptanonConsent=isGpcEnabled=0&datestamp=Sun+Apr+06+2025+20%3A37%3A25+GMT%2B0200+(heure+d%E2%80%99%C3%A9t%C3%A9+d%E2%80%99Europe+centrale)&version=202312.1.0&browserGpcFlag=0&isIABGlobal=false&consentId=4d7f8ee1-dce9-449a-aafd-a601908b682b&interactionCount=33&hosts=&landingPath=NotLandingPage&groups=C0001%3A1%2CC0002%3A0%2CC0003%3A0%2CC0004%3A0%2CC0005%3A0%2CV2STACK42%3A0%2CC0015%3A0%2CC0035%3A0&genVendors=V2%3A0%2CV1%3A0%2C&geolocation=FR%3BIDF&AwaitingReconsent=false; _vinted_fr_session=eU9YbzVFazY0MWZMcVVCRnR5ZUk3V3lBSGd6OTlxRWwrSy9keERLUDFJTFJ4RG8wdEdZbW1XeXp0WTIzVmNtbFIrQWZsV3pwRHZwT2RQYytmby8va2lLVDF0UFcyMXlVZm10VzJwMldJdWVCU21PQ3oyT1RZSkJUUi90cm9LY1QwYzJZajd2eDZlRlBZY3VETU9MdWtZbE9UYjNKMlBqTmk2cThVdDNSaU4wSTRLYTdVenFWVFBzV1cvZzdnM0pDUjQ1QXFWYlBWOHovWlJzZWVHL1ZJNG0yd1NhUXZOeU9ncFh6RHZRY1FiYmtNRWFCNjRzbk1lZFdUSitrUjZ3dU9IcDVMQStyVVl0ZEdUNDNJWDBsbVQ0YTJPbGhwNlFjZjdPYmpCQnB0TG4xY1FEb2IxSW40T1lmOHlMMDVDMVlKNzhRZDFGdHNERGhmWlB5Ync3aVYyU3pNa25iWXdCeDdOZ3RScGs2K3Jrc05zNHdMTlk3MFdxek16S3grdStsTGF0RkRCVzU5U01NNGR5MytUeFplYllMZzBqMndPSmNHQVF6N0lxWGhSazNMUEVWUFNXWE9iL3dGTVVOMXMwUjhsWTRIU0J0VG93WFVVSGNJNFBtaUZjTURSOVlRcUprMWxrZmVLcm84RW5Sd3NkdzZEbGlBN28rd3NqSmtvd0FnWE5hbWZDRXJUSWttSUpXaTJGVUlVbzFyTGhLR0ZYcFVHdkNlOEt0eVhYblpuU2llMVNFV1RxT25HS1FJR0V4YitFdGx4TXRvZHZwb1FodTYxZGF5S1crKzNzazRySkRydkMzeDNwa3V2OVlyODVWdTAxUHUwSFNBVExWVWdjcnJhR3F3aXc2c0ttN01sL1BSemhhelF2Q3hzdWJMaEJ4NVVHWW5yZlZsWGEvN3ozUXF2c0V6UTVJM1I5RU5WMkJUWnFSd1BQMEoybmlreFZvWGZtUE5HMXI5aUI4c0piU1NLYlhIRHp5NEEreWk1UCtnSHYyNCttaG9OZ3NBM2ZkYlpjQWw4NmExT3FnVDdrR2J2MWpkSGQxeFA0NlYxamNMOEtrczJ5SVRmSEpWd2dDQ01Ea28ycVRxdkxvVHRMYmFKd0szSVMvSVhPcDQwLzlnZ2tPZVJGbnoyU1pjOElBUXJDVGYzcW5UMFRFNFg2cmUySG1CcUR5UXJlR3RiZHVFdGZZNGcxa0FxTEw4ckY4VDlFOVVIbTEvR2ZxYWZJeXg2bkhEcHNJMldhK2x2NHFhaGczRjZPYW5JRVhEV1Y0cTlEaXFhWVpHREdxQndycERLV2xDWGJFZys5RDlwc3Vhc2RMVHVTYkpyZWdjM3BDSzZ4amsrQ2lPbElUYWRoa0tiRkNqRVgvbm02dzFac1JBZGF3ZmZnKzAzbk8wTVNXZ2FSeXA3Q2lBVmNrbGhlT2hoRDIvVkZKK2Y5YUgvZTFMK1dUUFU2blhXZFdQRkpDdVMvMWVKYmJwWnJaRDVUbXM0anJ2U1FGNUJtR1krNEhnM2MrelVkT2QvRE8yNjRoNlJQQzkya25GRHRzbUU0MytPcndpNUVRN3owTThETUpsVVlodU40ek5BQ2JLR1FDWExRMW8rc0FGK0dPNTNOdmNmRzlHV2U0N1NtYkF3RVc2cE9kUFBiQkoweDlpQ1pDSzFWcCtmQ21pZ3V0amZKOVZ4cWhSWjNNTlZhT2h3VFlQUzRmWVZNUEJ0SWJMcjR0TDJvZ1VrQWw0a2ZFQjZkL2k2eTNKR0JGZjd0Zjl1Y3hnU3pnOWJwWHpkYmZyNENlZkJSd0JMNy9SNVJvVG9VUnJhaHhpd3I5WnVCQ3A4RkFRLzFScklsMWpYQzRtRU1CZnhhcWdlMG1yS0QzdnBSWEpZTDZsNnV3dzFqaFovZm9HQm1FVmxHcm8yRXluZ2s2WUQxbzhoVDFrdWlselY1Y0d0VFJmdnBwNDZBbkl5cFN3RjhLRVpGY3NQbG0va0V5Y3A5MS9DUEhqTXJhRldFQUhkMnlnNHJVVjlMZTg4MTEwcXNkVGNLaHNPVUZwczAwc056OVN0YTRwZnN3NHhLSkQ1R0czVVRsc3kxZk9aUzRxUTIrOFJxN0hxVmdNWWlUYlM1NWlCVGpPSWMvVHdPWWd2OWo2TVZYT0hjNENQTVpNSHg3OC85QTloRmZZNWRTby9uWWZ6Uzl4dTFuZWZSL2hxWGQ1a01ablZsbjZIQndKbGFzM3ZBVW5EKzBieGUwL1FqYmJ1eEVDMFZNM3lvdzA5M1hnbDZwdEk1aGxYeDIzbkc1VU4wWUtEQ0xYaXkyOWJKZUtTZ0FtNlRlYTNLWEhiNGRwZDJueTRCZkh3VlBOa0JWVXp6bGhzQ3hsczI5a3N4aHZJazZxdU0zelIrbS0tdUtxZ0FDT3lpNmZERTUwTTQrSVBxQT09--1eec9619e5d83a7c3888d18d819117cefdc254d4; datadome=nbOY5HOYETV90TtJ7shSbesck140~sapInsml1rs9QURV22UBd29ELDZeDv83itJ2E8zJ~H1FSULtj32g_SJSa1J9E0OUjZklYqBc7um0OUJ71HswIvrmsoFJ0Ieszie; banners_ui_state=PENDING";

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
