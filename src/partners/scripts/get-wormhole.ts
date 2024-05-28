import * as core from "@actions/core";
import { DownloaderHelper } from "node-downloader-helper";
import path from "path";

const wormholeCsvUrl =
  "https://raw.githubusercontent.com/certusone/wormhole-token-list/main/content/by_dest.csv";
const wormholePath = path.resolve(__dirname, "../../../src/partners/data");

const run = async () => {
  try {
    const dl = new DownloaderHelper(wormholeCsvUrl, wormholePath, {
      fileName: "wormhole.csv",
      override: true,
    });

    dl.on("end", () => console.log("Download complete"));
    dl.start();
  } catch (error: any) {
    core.setFailed(error.message);
  }
};

run();
