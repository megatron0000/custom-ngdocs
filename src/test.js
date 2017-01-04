"use strict";
var console = require("console");
var fs = require("fs");
fs.writeFileSync("test.txt", "haha");
var dom = require("./dom");
var func = dom.normalizeHeaderToId;
console.log(func("We are GOOD"));
console.log(func(["HA"]));
// Log: "o"
console.log("Some string"[1]);
var isMatch = /someREGEXP/.test("There is more than someREGEXP only");
console.log(isMatch);
//# sourceMappingURL=test.js.map