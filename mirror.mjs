#!/usr/bin/env node
import fs from "fs/promises";
import { URL } from "url";
import scrape from "website-scraper";

const SITE = new URL("https://em-preprod.herokuapp.com/app");

const USER_AGENT =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4472.114 Safari/537.36";

const COOKIES =
  "user_id=MTM1--b7fbc4d335659f27f7421ffc86f248790b633117; _prototype_app_session=Y1ZMQ2JRMk5ZV0RHR1RZV3VBbGhzeDMxN1FwT2tSeVRyRkhVaVZpZ05peXBsNC9jekNhK3VpcXVwREZGOVRCOERCcEVvZEE5bDh6ZnRuL0Y5cnRQTWw2bUZIbFJDaEVGdUhrU2JVa2htcXR6MU10WCt4QWhyQjRGYldtOHdCZmliRUFxclVNTUM5djBRVnFtUXprd01CbFVPUVFuRkVQaEQyTHdySkZDM3hhakd0ZHEvMGkxR3JXanBxM052dHBkVUpDa3loVTVFS2xMeENIUTJtaUlSZERCY0NxTXFPTHd1VCtjTXRISDAwaz0tLTVLb0hrWTZhS3RqZFFEOS80Uk5xTFE9PQ%3D%3D--9723c3e7f83b0b41b8f84fc0352ccf59bd26ef73;"
function isInDomain(href) {
  const url = new URL(href);
  return SITE.hostname === url.hostname;
}

function isFont(href) {
  const ret = /\.(eot|svg|ttf|woff|woff2)(\?.*)?$/i.test(href);
  return ret;
}

async function mirror() {
  const options = {
    urls: [SITE.href],
    urlFilter: (url) => {
      return isInDomain(url) && !isFont(url);
    },
    directory: "site/",
    request: {
      headers: {
        "Cookie": COOKIES,
        "User-Agent": USER_AGENT
      }
    },
    plugins: [
      {
        apply(registerAction) {
          registerAction("afterResponse", ({ response }) => {
            if (response.headers["content-type"].includes("text/html")) {
              // console.log('afterResponse', response.body);
              const body = response.body
                .replace(/<meta name="csrf-token" content=.*?>/, "")
                .replace(/<script>window.NREUM.*?<\/script>/g, "");
              return body;
            }
            return response.body;
          });
        }
      }
    ]
  };

  const result = await scrape(options);
  await fs.appendFile(
    "mirror.log",
    `sync with site complete at ${new Date().toGMTString()}\n`
  );
  console.log("done");
}

mirror();
