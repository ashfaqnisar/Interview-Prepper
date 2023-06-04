// Add metadata to this page  from app router.

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interview Prepper - Exam"
};

const Page = () => {
  return (
    <div className={"w-full px-4 pb-8 sm:pt-16"}>
      <div className={"md:container md:mx-auto"}>
        <h1
          className={
            "pt-4 text-center text-lg font-bold tracking-tight duration-150 sm:text-left sm:text-xl md:text-2xl"
          }
        >
          Exam
        </h1>
      </div>
    </div>
  );
};

export default Page;
