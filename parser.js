const fs = require("fs/promises");

const result = {};

const readToResult = (contents) => {
  const lines = contents.split("\n");
  lines.forEach((line) => {
    if (line[0] === "U") {
      const found = line.match(/^U\+([0-9A-F]+)\s+(\w+)\s+(.+)$/);
      if (!found) throw new Error(`Data error: ${line}`);
      const [codeStr, key, value] = found.slice(1);
      const codePoint = Number.parseInt(codeStr, 16);
      if (!result[codePoint]) result[codePoint] = {};
      result[codePoint][key] = value;
    }
  });
};

(async () => {
  const files = await fs.readdir("Unihan/");
  for (let i = 0; i < files.length; i++) {
    if (files[i].includes(".txt")) {
      console.log(`Reading ${files[i]}...`);
      const contents = await fs.readFile("Unihan/"+files[i], "utf8");
      readToResult(contents);
    }
  }

  fs.writeFile("unihan.json", JSON.stringify(result, null, 2));
})();
