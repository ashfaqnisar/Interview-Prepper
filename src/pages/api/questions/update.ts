import { NextApiRequest, NextApiResponse } from "next";

import { QuestionAndAnswer } from "@/types/question";
import { elasticClient } from "@/utils/api";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Record<"message", string>>
) {
  if (req.method === "PATCH") {
    try {
      // Get the data from the request body.
      const { id, ...rest }: QuestionAndAnswer = req.body;

      if (!id) {
        return res.status(400).send({ message: "Bad Request" });
      }

      // Update the document in the index using the id.
      const response = await elasticClient.app.putDocuments({
        engine_name: process.env.ELASTIC_ENGINE_NAME as string,
        documents: [{ id, ...rest }],
      });

      // @ts-ignore
      if (response?.errors) {
        // @ts-ignore
        console.error(`Error: ${response?.errors}`);
        return res.status(500).json({ message: "Unable to update the document." });
      }

      return res.status(200).send({
        message: "Successfully updated the question.",
      });
    } catch (err) {
      console.error(`Error: ${err}`);
      return res.status(500).send({ message: "Unable to update the document." });
    }
  } else {
    return res.status(400).send({ message: "Bad Request" });
  }
}
