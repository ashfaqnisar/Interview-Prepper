import { Client } from "@elastic/enterprise-search";
import { NextApiRequest, NextApiResponse } from "next";

const client = new Client({
  url: process.env.ELASTIC_APP_SEARCH_ENDPOINT as string,
  auth: {
    token: process.env.ELASTIC_PRIVATE_KEY as string
  }
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "DELETE") {
    try {
      const { id } = req.query;
      if (!id || typeof id !== "string") {
        return res.status(400).send("Please provide the id of the document.");
      }

      // Delete the document from the Elastic App Search using the id.
      const response = await client.app.deleteDocuments({
        engine_name: process.env.ELASTIC_ENGINE_NAME as string,
        documentIds: [id]
      });

      // Wait for the document to be deleted.
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return res.status(200).send(response);
    } catch (err) {
      console.error(`Error processing the documents: ${err}`);
      return res.status(500).send({ message: "Error processing the documents" });
    }
  }
  return res.status(400).send({ message: "Bad Request" });
}
