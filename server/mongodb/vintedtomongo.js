const fs = require('fs');

// Lire le fichier JSON
fs.readFile('vinted.json', 'utf8', (err, data) => {
  if (err) {
    console.error('Erreur de lecture du fichier JSON:', err);
    return;
  }

  // Parse le fichier JSON
  const jsonData = JSON.parse(data);

  // Transformation des données
  const transformedData = Object.keys(jsonData).map(key => {
    return jsonData[key].map(item => ({
      id_lego: key, // Ajouter l'id_lego basé sur la clé
      id: item.id,
      title: item.title,
      price: item.price,
      discount: item.discount,
      url: item.url,
      photo: item.photo,
      total_item_price: item.total_item_price,
      status: item.status,
      user: item.user
    }));
  }).flat();

  // Écrire les données transformées dans un nouveau fichier
  fs.writeFile('sales.json', JSON.stringify(transformedData, null, 2), 'utf8', (err) => {
    if (err) {
      console.error('Erreur lors de l\'écriture du fichier transformé:', err);
      return;
    }
    console.log('Données transformées et enregistrées dans transformedData.json');
  });
});
