import { getAccessToken } from "../modules/onedrive/onedrive.routes.js";
import axios from "axios";

const encodeGraphShareUrl = (shareUrl) => {
    let base64;
  
  if (typeof Buffer !== 'undefined') {
    // Node.js environment
    base64 = Buffer.from(shareUrl, "utf8").toString("base64");
  } else {
    // Browser environment
    base64 = btoa(shareUrl);
  }

  console.log(`u!${base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")}`);
  
  return `u!${base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")}`;
};

const getGraphDownloadLink = async (inputUrl) => {
    const access = await getAccessToken();
    if (!inputUrl) {
        throw new Error("Please provide a SharePoint/OneDrive share URL.");
    }

    const encoded = encodeGraphShareUrl(inputUrl);
    const response = await fetch(
        `https://graph.microsoft.com/v1.0/shares/${encoded}/driveItem`,
        {
            method: 'GET',
            headers: { Authorization: `Bearer ${access}` }
        }
    );

    if (!response.ok) {
        const text = await response.text().catch(() => null);
        console.error("Graph API returned error:", response.status, response.statusText, text);
        throw new Error(`Failed to fetch from Microsoft Graph: ${response.status}`);
    }

    const data = await response.json();
    if (data.error) {
        console.error("Error object from Graph:", data.error);
        throw new Error("Microsoft Graph responded with an error");
    }

    const downloadLink = data["@microsoft.graph.downloadUrl"];
    if (!downloadLink) {
        console.error("No download link found in Graph response:", data);
        throw new Error("No download link found in Graph response.");
    }
    return downloadLink;
};

// For single file 'a.click()' download
export const downloadFiles = async (req, res) => {
    try {
        const inputUrl = req.body?.url;
        const downloadLink = await getGraphDownloadLink(inputUrl);
        return res.status(200).json({ downloadLink });
    } catch (err) {
        console.error("Unexpected error in downloadFiles:", err);
        return res.status(500).json({ error: "Internal server error", detail: err?.message ?? err });
    }
};

// For JSZip. Fetches the file on the server and streams it.
export const downloadFilesProxy = async (req, res) => {
    try {
        const inputUrl = req.body?.url;

        // Step 1: Get the link
        const downloadLink = await getGraphDownloadLink(inputUrl);

        // Step 2: Fetch file on server as a stream
        const fileResponse = await axios({
            method: "get",
            url: downloadLink,
            responseType: "stream",
        });

        // Step 3: Set headers and pipe the stream to the client
        res.setHeader("Content-Type", fileResponse.headers["content-type"]);
        res.setHeader("Content-Length", fileResponse.headers["content-length"]);
        fileResponse.data.pipe(res);

    } catch (err) {
        console.error("Unexpected error in downloadFilesProxy:", err);
        return res.status(500).json({ error: "Internal server error", detail: err?.message ?? err });
    }
};