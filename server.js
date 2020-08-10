const fs = require("fs");
const json = JSON.parse(fs.readFileSync("unihan.json", "utf8"));
const index = fs.readFileSync("index.html", "utf8");

const http = require("http");

const HOSTNAME = "0.0.0.0";
const PORT = process.env.PORT || 5000;

const server = http.createServer((req, res) => {
  console.log(req.url);
  const url = new URL(req.url, `${req.protocol}://${req.headers.host}`);
  const path = url.pathname;

  if (path === "/" || path === "/index.html") {
    res.statusCode = 200;
    res.setHeader("Cache-Control", "public, max-age=604800, immutable");
    res.setHeader("Content-Type", "text/html");
    res.end(index);
    return;
  }

  if (path === "/api/unihan") {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "public, max-age=604800, immutable");

    const q = url.searchParams.get("q");

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

    return;
  }

  res.statusCode = 404;
  res.end(index);
});

server.listen(PORT, HOSTNAME, () => {
  console.log(`Server running at http://${HOSTNAME}:${PORT}/`);
});
