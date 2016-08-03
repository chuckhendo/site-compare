#!/usr/bin/env node

const meow = require("meow");

import { compare } from "./index";

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

async function main(url1: string, url2: string, outputFileName: string) {
    await compare(url1, url2, outputFileName);
    console.log("Done!");
}

main(cli.input[0], cli.input[1], cli.input[2]);




