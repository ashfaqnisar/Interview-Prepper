import { ChangeEvent, FormEvent, Fragment, useEffect, useState } from "react";

import { SearchResult } from "@elastic/search-ui";
import axios from "axios";
import { FaEdit, FaSave, FaTimes } from "react-icons/fa";

import CustomMarkdown from "@/shared/CustomMarkdown";

interface QuestionEditorProps {
  answer: string[];
  id: string;
  setEditing: (b: boolean) => void;
  updateQuestion: (b: SearchResult) => void;
}
const QuestionEditor = ({ answer, id, setEditing, updateQuestion }: QuestionEditorProps) => {
  const [markdown, setMarkdown] = useState("");

  useEffect(() => {
    setMarkdown(answer.join("---"));
  }, [answer]);

  const handleMarkdownChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMarkdown(e.target.value);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const answer = markdown.split("---");
      await axios({
        method: "PATCH",
        url: "/api/questions/update",
        data: {
          id,
          answer
        }
      });
      updateQuestion({ answer: { raw: answer } });
    } catch (e) {
      console.log(e);
    }
  };

  const handleCancel = () => {
    setMarkdown(answer.join("---"));
    setEditing(false);
  };

  return (
    <form onSubmit={handleSubmit} className={"my-2 grid  grid-cols-1 gap-2  "}>
      <p>Answer:</p>
      <textarea
        className={"rounded px-3 py-2 text-base 2xl:text-lg"}
        value={markdown}
        onChange={handleMarkdownChange}
        rows={8}
        cols={80}
      />
      <div className={"mt-2"}>
        <p>Preview:</p>
        {markdown.split("---").length > 0 && (
          <div
            className={
              "prose grid max-w-none grid-cols-1 gap-2 dark:prose-invert md:prose-base 2xl:prose-lg prose-p:m-0 prose-p:text-zinc-300 prose-code:font-mono prose-pre:my-2 prose-pre:p-0"
            }
          >
            {markdown.split("---").map((answer: string, index: number) => (
              <CustomMarkdown key={answer + index} answer={answer} />
            ))}
          </div>
        )}
      </div>
      <div className={"mt-2 flex flex-row items-center gap-2"}>
        <button
          className="flex items-center rounded bg-neutral-100 px-2 py-1 text-sm font-bold text-neutral-900 ring-2 ring-neutral-100 hover:bg-transparent hover:text-neutral-100"
          type="submit"
        >
          <FaSave className="mr-1 text-sm" />
          Save
        </button>
        <button
          className="flex items-center rounded px-2 py-1 text-sm font-bold text-white ring-2 ring-gray-400 hover:ring-gray-50"
          onClick={handleCancel}
        >
          <FaTimes className="mr-1 text-sm" />
          Cancel
        </button>
      </div>
    </form>
  );
};

const QuestionCard = ({ result, editable = false }: { result: SearchResult; editable?: boolean }) => {
  const [question, setQuestion] = useState(result);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setQuestion(result);
  }, [result]);

  const updateQuestion = async (data: SearchResult) => {
    setEditing(false);
    setQuestion({ ...question, ...data });
  };

  return (
    <div className={"grid grid-cols-1 gap-3 rounded-lg p-4 shadow-lg ring-2 ring-zinc-50 duration-150"}>
      <div className={"flex flex-row items-center justify-between"}>
        <p
          className={
            "w-min rounded-full px-2 py-0.5 text-xs font-medium capitalize text-neutral-200 ring-2 ring-neutral-200 2xl:text-sm"
          }
        >
          {question?.language?.raw ?? "unknown"}
        </p>
      </div>

      <div className={"grid grid-cols-1"}>
        <div className={"flex flex-row items-center gap-2"}>
          <h4 className={"font-semibold text-neutral-50 duration-150 md:text-base 2xl:text-lg"}>
            {"->"} {question?.question?.raw ?? "Question Not Found"}
          </h4>

          {editable && !editing && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center rounded bg-zinc-800 px-2 py-1 text-sm font-bold text-white duration-150 hover:bg-zinc-700"
            >
              <FaEdit className="mr-2 text-gray-200" />
              Edit
            </button>
          )}
        </div>
        {editing ? (
          <QuestionEditor
            id={question?.id?.raw}
            answer={question?.answer?.raw}
            setEditing={setEditing}
            updateQuestion={updateQuestion}
          />
        ) : (
          question?.answer?.raw.length > 0 && (
            <div
              className={
                "prose grid max-w-none grid-cols-1 gap-2 dark:prose-invert md:prose-base 2xl:prose-lg prose-p:m-0 prose-p:text-zinc-300 prose-code:font-mono prose-pre:my-2 prose-pre:p-0"
              }
            >
              {/*Check whether the answer is a string or an array*/}
              {typeof question?.answer?.raw === "string" ? (
                <CustomMarkdown answer={question?.answer?.raw} />
              ) : (
                question?.answer?.raw.map((answer: string, index: number) => (
                  <CustomMarkdown key={answer + index} answer={answer} />
                ))
              )}
            </div>
          )
        )}
      </div>
      <div className={"flex flex-row flex-wrap gap-2 "}>
        {(question?.tags?.raw ?? []).map((tag: string, index: number) => (
          <Fragment key={tag}>
            <span className={"font text-xs capitalize text-neutral-400 2xl:text-sm"}>{tag}</span>
            {index !== (question?.tags?.raw?.length - 1 ?? 0) && (
              <span className={" text-xs font-medium 2xl:text-sm"}>|</span>
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );
};
export default QuestionCard;
