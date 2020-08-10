const fs = require("fs");

const jsonFile = fs.existsSync("unihan.json") ?
      // local
      "unihan.json" :
      // vercel
      "../unihan.json";

const json = JSON.parse(fs.readFileSync(jsonFile, "utf8"));

module.exports = (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "max-age=0, s-maxage=86400");

  const { q } = req.query;

  if (!q) {
    res.statusCode = 400;
    res.end(JSON.stringify({error: "Missing argument"}, null, 2))
    return;
  }

  let codepoint = null;
  if (q.length === 1) {
    codepoint = q.codePointAt(0);
  } else {
    codepoint = Number(q);
    if (isNaN(codepoint)) {
      res.statusCode = 400;
      res.end(JSON.stringify({error: "Invalid argument: " + q}, null, 2));
      return;
    }
  }

  const result = json[codepoint];
  if (!result) {
    res.statusCode = 404;
    res.end(JSON.stringify({error: "Not found: " + q}, null, 2));
    return;
  }

  result.codepoint = codepoint;

  res.statusCode = 200;
  res.end(JSON.stringify(result, null, 2));
};
