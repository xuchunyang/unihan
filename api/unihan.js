const MongoClient = require("mongodb").MongoClient;

let cacheDb = null;
async function connectToDatabase() {
  if (cacheDb) return cacheDb;

  const uri = process.env.MONGODB_URI || `mongodb://localhost:27017/unihan`;
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await client.connect();
  const db = await client.db(new URL(uri).pathname.slice(1));
  cacheDb = db;

  return db;
}

async function search(char) {
  const db = await connectToDatabase();
  const collection = await db.collection("chars");
  const found = await collection.findOne({char});
  return found;
}

module.exports = async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "max-age=0, s-maxage=86400");

  const { q } = req.query;
  if (!q) {
    res.status(400).json({error: "Missing query argument"});
    return;
  }
  if (q.length !== 1) {
    res.status(400).json({error: "Invalid query argument"});
    return;
  }

  const found = await search(q);
  if (!found) {
    res.status(400).json({error: "No result"});
    return;
  }
  delete found._id;
  res.status(200).json(found);
};
