import * as Nightmare from "nightmare";

const fs = require("fs");
const pixelmatch = require("pixelmatch");
const PNG = require("pngjs").PNG;

interface ImageDimensions {
    width: number,
    height: number
}

class SiteScreenshot {
    public image: any;
    public dimensions: ImageDimensions;
    private ownInstance: Boolean = false;

    constructor(private url: string, private nightmare?: Nightmare) {
        if(!nightmare) {
            this.nightmare = new Nightmare({
                openDevTools: true, 
                show: true
            });
            this.ownInstance = true;
        } 
    }

    public getSiteDimensions() {
        console.log(`Getting dimensions for url: ${this.url}`);

        return this.navigateToUrl()
            .evaluate(function() {
                var body = document.querySelector("body");
                return {
                    height: body.scrollHeight,
                    width: body.scrollWidth
                };
            })
            .then((dimensions: ImageDimensions) => {
                this.dimensions = dimensions;
                return dimensions;
            });
    }

    public takeScreenshot() {
        console.log(`Taking screenshot for url: ${this.url}`);

        return this.navigateToUrl()
            .viewport(this.dimensions.width, this.dimensions.height)
            .wait(1000)
            .screenshot(null)
            .then((data) => {
                this.image = new PNG();
                const imgPromise = new Promise((resolve, _) => this.image.parse(data, resolve));
                return imgPromise;
            })
    }

    private navigateToUrl() {
        return this.nightmare.goto(this.url)
            .wait("body");
    }
}


export async function compare(url1:string, url2:string, outputFileName: string) {
    const nightmare = new Nightmare({ show: true });
    const ss1 = new SiteScreenshot(url1, nightmare);
    const ss2 = new SiteScreenshot(url2, nightmare);
    
    await ss1.getSiteDimensions();
    await ss2.getSiteDimensions();
    
    const newDimensions = getMaxDimensions(ss1.dimensions, ss2.dimensions);

    ss1.dimensions = newDimensions;
    ss2.dimensions = newDimensions;

    await ss1.takeScreenshot();
    await ss2.takeScreenshot();

    const diff = new PNG({width: ss1.dimensions.width, height: ss1.dimensions.height});

    const result = pixelmatch(ss1.image.data, ss2.image.data, diff.data, ss1.image.width, ss1.image.height);

    diff.pack().pipe(fs.createWriteStream(outputFileName));

    return nightmare.end();
}

function getMaxDimensions(dimensions1: ImageDimensions, dimensions2: ImageDimensions): ImageDimensions {
    return {
        width: Math.max(dimensions1.width, dimensions2.width),
        height: Math.max(dimensions1.height, dimensions2.height)
    };
}
