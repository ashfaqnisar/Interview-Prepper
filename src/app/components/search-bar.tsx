import { useForm } from "react-hook-form";

import { Button } from "@/shared/ui/button";
import { Icons } from "@/shared/icons";

const SearchBar = ({ updateQuery }: { updateQuery: (query: string) => void }) => {
  const { register, getValues, handleSubmit } = useForm<{ searchText: string }>({
    mode: "onSubmit",
    defaultValues: {
      searchText: "",
    },
  });

  const handleSearchTextUpdate = (values: { searchText: string }) => {
    updateQuery(values.searchText);
  };

  return (
    <form className={"flex flex-col gap-2"} onSubmit={handleSubmit(handleSearchTextUpdate)}>
      <div
        className={
          "relative flex w-full flex-col rounded-md border border-input py-1.5 pl-3 pr-12 shadow-sm focus-within:ring-1 focus-within:ring-ring 2xl:py-2.5"
        }
      >
        <textarea
          {...register("searchText")}
          className={
            "resize-none bg-transparent text-sm font-medium placeholder:text-muted-foreground focus-visible:outline-none 2xl:text-base"
          }
          rows={1}
          placeholder={"Search Questions"}
          style={{
            maxHeight: "200px",
            height: "24px",
          }}
          onChange={(event) => {
            const target = event.target as HTMLTextAreaElement;
            target.style.height = "24px";
            target.style.height = target.scrollHeight + "px";
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && event.ctrlKey) {
              event.preventDefault();
              handleSubmit(handleSearchTextUpdate)();
            }
          }}
        />
        <Button
          size={"icon"}
          variant={"default"}
          type={"submit"}
          className={
            "absolute bottom-1.5 right-2 h-6 w-6 rounded hover:bg-primary/80 2xl:bottom-2.5 2xl:h-7 2xl:w-7"
          }
        >
          <Icons.gitHub className={"h-4 w-4"} />
        </Button>
      </div>
      <div></div>
    </form>
  );
};

export default SearchBar;
