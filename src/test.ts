import * as console from 'console';
// import fs = require('fs');
// fs.writeFileSync("test.txt", "haha");

import dom = require('./dom');
let func = dom.normalizeHeaderToId;

console.log(func("We are GOOD"));
console.log(func(["HA"]));

// Log: "o"
console.log("Some string"[1]);

var isMatch = /someREGEXP/.test("There is more than someREGEXP only");
console.log(isMatch);