const connectDB = require('./mongo');

async function main() {
    const db = await connectDB();
    const collections = await db.listCollections().toArray();
    console.log('Collections dans la base de données :', collections.map(c => c.name));
}

main();