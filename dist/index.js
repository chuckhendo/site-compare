"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const Nightmare = require("nightmare");
const fs = require("fs");
const pixelmatch = require("pixelmatch");
const PNG = require("pngjs").PNG;
class SiteScreenshot {
    constructor(url, nightmare) {
        this.url = url;
        this.nightmare = nightmare;
        this.ownInstance = false;
        if (!nightmare) {
            this.nightmare = new Nightmare({
                openDevTools: true,
                show: true
            });
            this.ownInstance = true;
        }
    }
    getSiteDimensions() {
        console.log(`Getting dimensions for url: ${this.url}`);
        return this.navigateToUrl()
            .evaluate(function () {
            var body = document.querySelector("body");
            return {
                height: body.scrollHeight,
                width: body.scrollWidth
            };
        })
            .then((dimensions) => {
            this.dimensions = dimensions;
            return dimensions;
        });
    }
    takeScreenshot() {
        console.log(`Taking screenshot for url: ${this.url}`);
        return this.navigateToUrl()
            .viewport(this.dimensions.width, this.dimensions.height)
            .wait(1000)
            .screenshot(null)
            .then((data) => {
            this.image = new PNG();
            const imgPromise = new Promise((resolve, _) => this.image.parse(data, resolve));
            return imgPromise;
        });
    }
    navigateToUrl() {
        return this.nightmare.goto(this.url)
            .wait("body");
    }
}
function compare(url1, url2, outputFileName) {
    return __awaiter(this, void 0, void 0, function* () {
        const nightmare = new Nightmare({ show: true });
        const ss1 = new SiteScreenshot(url1, nightmare);
        const ss2 = new SiteScreenshot(url2, nightmare);
        yield ss1.getSiteDimensions();
        yield ss2.getSiteDimensions();
        const newDimensions = getMaxDimensions(ss1.dimensions, ss2.dimensions);
        ss1.dimensions = newDimensions;
        ss2.dimensions = newDimensions;
        yield ss1.takeScreenshot();
        yield ss2.takeScreenshot();
        const diff = new PNG({ width: ss1.dimensions.width, height: ss1.dimensions.height });
        const result = pixelmatch(ss1.image.data, ss2.image.data, diff.data, ss1.image.width, ss1.image.height);
        diff.pack().pipe(fs.createWriteStream(outputFileName));
        return nightmare.end();
    });
}
exports.compare = compare;
function getMaxDimensions(dimensions1, dimensions2) {
    return {
        width: Math.max(dimensions1.width, dimensions2.width),
        height: Math.max(dimensions1.height, dimensions2.height)
    };
}
