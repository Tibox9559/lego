const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const baseUrl = 'https://www.dealabs.com/search?q=lego&page=';
const totalPages = 132;

async function scrapePage(page) {
    try {
        const { data } = await axios.get(`${baseUrl}${page}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        const $ = cheerio.load(data);
        let deals = [];

        $('div.js-vue2').each((index, element) => {
            const jsonData = $(element).attr('data-vue2');
            if (jsonData) {
                try {
                    const deal = JSON.parse(jsonData);
                    if (deal.props && deal.props.thread) {
                        const thread = deal.props.thread;
                        const price = thread.price;
                        const nextBestPrice = thread.nextBestPrice;
                        let discount = null;

                        if (price && nextBestPrice && nextBestPrice > price) {
                            discount = ((nextBestPrice - price) / nextBestPrice) * 100;
                            discount = Math.round(discount * 100) / 100; // Arrondi à 2 décimales
                        }

                        // Extraction de l'ID à partir de titleSlug
                        const titleSlug = thread.titleSlug;
                        const idMatch = titleSlug.match(/\b\d{5}\b/);
                        const id = idMatch ? idMatch[0] : null;

                        if (id) {
                            deals.push({
                                id: id,
                                threadId: thread.threadId,
                                titleSlug: titleSlug,
                                commentCount: thread.commentCount,
                                isExpired: thread.isExpired,
                                temperature: thread.temperature,
                                publishedAt: thread.publishedAt,
                                link: thread.link,
                                merchantName: thread.merchant ? thread.merchant.merchantName : null,
                                price: price,
                                nextBestPrice: nextBestPrice,
                                discount: discount
                            });
                        }
                    }
                } catch (error) {
                    console.error('❌ Erreur de parsing JSON:', error);
                }
            }
        });

        console.log(`✅ Page ${page} scrappée: ${deals.length} offres valides trouvées.`);
        return deals;
    } catch (error) {
        console.error(`❌ Erreur lors du scraping de la page ${page}:`, error.message);
        return [];
    }
}

async function scrapeAllPages() {
    let allDeals = [];

    for (let page = 1; page <= totalPages; page++) {
        console.log(`🔍 Scraping de la page ${page}...`);
        const deals = await scrapePage(page);
        allDeals.push(...deals);
    }

    fs.writeFileSync('deals.json', JSON.stringify(allDeals, null, 2));
    console.log(`✅ Scraping terminé, ${allDeals.length} offres enregistrées dans deals.json.`);
}

scrapeAllPages();
