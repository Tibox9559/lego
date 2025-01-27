const fetchSales = async (id = 42182) => {
    try {
      const response = await fetch(
        `https://lego-api-blue.vercel.app/sales?id=${id}`
      );
      const vinted = await response.json();
  
      if (vinted.success !== true) {
        console.error("Error response from API:", body);
        return null; // Retourne null en cas d'erreur
      }
      console.log(vinted.data.result);
      return vinted.data.result; // Retourne les données en cas de succès
      
    } catch (error) {
      console.error("Error fetching sales data:", error);
      return null; // Retourne null en cas d'erreur réseau ou autre
    }
  };