#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const meow = require("meow");
const index_1 = require("./index");
const cli = meow(`
    Usage
        $ site-comp <url1> <url2> <output-file-name>

    Example
        $ site-comp http://google.com http://bing.com diff.png

`, {
    alias: {
        h: "help"
    }
});
function main(url1, url2, outputFileName) {
    return __awaiter(this, void 0, void 0, function* () {
        yield index_1.compare(url1, url2, outputFileName);
        console.log("Done!");
    });
}
main(cli.input[0], cli.input[1], cli.input[2]);
