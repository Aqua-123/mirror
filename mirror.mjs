#!/usr/bin/env node
import fs from "fs/promises";
import { URL } from "url";
import scrape from "website-scraper";

const SITE = new URL("https://emeraldchat.com/app");

const USER_AGENT =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4472.114 Safari/537.36";

const COOKIES =
  "user_id=MjczMzY4MzI%3D--b1510fd18e38571d3bc62a5b2b5657c4017e3739; _prototype_app_session=Ly83cENNZzdYVFA5ZHkvOGRzdUNjYmFmNzBaMUthaWJZZUV2Y3ZNNGJCRkoveFF3R1d1V3FCU2FiNWRBNzk0NWEwZGR6U1cyNU04RUdnYVc1SHBNVWlmZXRMaXlNQmUzajBwZ05pdVAvVmUxRGY1aThyRXlkbkdCeHlLL3lNRmV1dHVFZHZCSEVtaEJtUHU4VGxYUXgvY1U0dTFVaVRjNVgrdXhrTndESXZOS1NySnVBYnJ3Wm0wVkNYbVZQSEJadDJZd09KY0hKOVNMUFBESU11blBRMDJVajRSd1VSdDJqUml4ZmVlRzh3az0tLVRvZVFHcit1a3VFRnFkQkhESVRSeFE9PQ%3D%3D--9c189a37189e664085af000e55709f9c81a6b8c2;"
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
