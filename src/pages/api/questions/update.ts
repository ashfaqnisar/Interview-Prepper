import { Client } from "@elastic/enterprise-search";
import { NextApiRequest, NextApiResponse } from "next";

const client = new Client({
  url: process.env.ELASTIC_APP_SEARCH_ENDPOINT as string,
  auth: {
    token: process.env.ELASTIC_PRIVATE_KEY as string
  }
});

interface QuestionAndAnswer {
  id: string;
  domain?: string;
  question?: string;
  question_type?: string;
  answer?: string[];
  tags?: string[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "PATCH") {
    try {
      // Get the data from the request body.
      const { id, ...rest }: QuestionAndAnswer = req.body;

      // Update the document in the index using the id.
      const response = await client.app.putDocuments({
        engine_name: process.env.ELASTIC_ENGINE_NAME as string,
        documents: [{ id, ...rest }]
      });

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (response?.errors) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        console.error(`Error updating documents: ${response?.errors}`);
        return res.status(500).json({ message: "Error updating the document in the index." });
      }

      return res.status(200).send({
        message: "Successfully updated the question in the index."
      });
    } catch (err) {
      console.error(`Error updating the document: ${err}`);
      return res.status(500).send({ message: "Error updating the document" });
    }
  } else {
    return res.status(400).send({ message: "Bad Request" });
  }
}
