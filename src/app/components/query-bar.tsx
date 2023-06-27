import * as React from "react";
import { ChangeEvent, FormEvent, memo, useEffect, useState } from "react";

import { SearchOptions } from "@/types/search";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Icons } from "@/shared/icons";

const sortOptionsList: SearchOptions["sort"][] = [
  {
    field: "relevance",
  },
  {
    field: "id",
    direction: "asc",
  },
  {
    field: "id",
    direction: "desc",
  },
];

const QueryBar = memo(
  ({
    updateQuery,
    defaultState,
  }: {
    updateQuery: (queryState: SearchOptions) => void;
    defaultState: SearchOptions;
  }) => {
    const [searchState, setSearchState] = useState<SearchOptions>(defaultState);

    const handleSearchTextUpdate = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const searchTextArea = event.target as HTMLFormElement;
      const query = searchTextArea["search-textarea"].value;
      setSearchState({ ...searchState, query });
    };

    const [renderCount, setRenderCount] = useState(1);

    useEffect(() => {
      setRenderCount((prev) => prev + 1);
      updateQuery(searchState);
    }, [searchState]);

    return (
      <>
        <form className={"flex flex-col gap-2"} onSubmit={handleSearchTextUpdate}>
          <div
            className={
              "relative flex w-full content-center rounded-md border border-input py-1.5 pl-3 shadow-sm focus-within:ring-1 focus-within:ring-ring 2xl:py-2"
            }
          >
            <textarea
              name={"search-textarea"}
              className={
                "grow resize-none items-center bg-transparent pr-12 text-sm font-medium placeholder:text-muted-foreground focus-visible:outline-none 2xl:text-base"
              }
              rows={1}
              placeholder={"Search Questions"}
              style={{
                height: "22.5px",
                maxHeight: "200px",
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && event.ctrlKey) {
                  event.preventDefault();
                  event.stopPropagation();

                  // @ts-ignore
                  event.target?.form.requestSubmit();
                }
              }}
              onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
                const target = event.target;
                target.style.height = "22.5px";
                target.style.height = target.scrollHeight + "px";
              }}
            />
            <Button
              size={"icon"}
              variant={"default"}
              type={"submit"}
              className={
                "absolute bottom-1 right-2 h-6 w-6 rounded hover:bg-primary/80 2xl:bottom-2"
              }
            >
              <Icons.send className={"h-3 w-3 2xl:h-4 2xl:w-4"} />
            </Button>
          </div>
          <div className={"flex flex-wrap items-center gap-2 text-sm "}>
            <div className={"flex grow items-center space-x-2"}>
              {searchState.query.length > 0 && (
                <>
                  <p className={"text-sm font-medium"}>Search: </p>
                  <Badge
                    variant={"outline"}
                    className={
                      "cursor-pointer text-sm font-medium text-secondary-foreground hover:bg-destructive hover:text-destructive-foreground"
                    }
                    onClick={() => {
                      setSearchState({ ...searchState, query: "" });
                    }}
                  >
                    {searchState.query.length > 25
                      ? `${searchState.query.slice(0, 25)}...`
                      : searchState.query}
                    <Icons.close
                      className={"ml-1 h-3 w-3 fill-current font-medium"}
                      strokeWidth={3}
                    />
                  </Badge>
                </>
              )}
            </div>
            <div className={"flex gap-3"}>
              <div className={"flex items-center space-x-2"}>
                <p className={"text-xs font-medium 2xl:text-sm"}>Rows Per Page</p>
                <Select
                  value={searchState?.page?.size}
                  onValueChange={(value) => {
                    setSearchState({
                      ...searchState,
                      page: {
                        ...searchState.page,
                        size: value,
                      },
                    });
                  }}
                >
                  <SelectTrigger className="h-8 w-[70px] text-xs hover:bg-accent hover:text-accent-foreground focus:ring-0 2xl:text-sm">
                    <SelectValue className={"py-1"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem className={"text-xs 2xl:text-sm"} value={"10"}>
                        10
                      </SelectItem>
                      <SelectItem className={"text-xs 2xl:text-sm"} value="25">
                        25
                      </SelectItem>
                      <SelectItem className={"text-xs 2xl:text-sm"} value="50">
                        50
                      </SelectItem>
                      <SelectItem className={"text-xs 2xl:text-sm"} value="100">
                        100
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <Select
                value={`${searchState?.sort?.field}-${searchState?.sort?.direction}`}
                onValueChange={(value) => {
                  const [field, direction] = value.split("-");
                  value.split("-");
                  setSearchState({
                    ...searchState,
                    sort: {
                      field,
                      ...(direction !== "undefined" && {
                        direction: direction as SearchOptions["sort"]["direction"],
                      }),
                    },
                  });
                }}
              >
                <SelectTrigger className="h-8 w-[120px] text-xs capitalize hover:bg-accent hover:text-accent-foreground focus:ring-0 2xl:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel className={"text-xs text-muted-foreground 2xl:text-sm"}>
                      Sort By
                    </SelectLabel>
                    {sortOptionsList.map((sortOption) => (
                      <SelectItem
                        className={"text-xs capitalize 2xl:text-sm"}
                        key={`${sortOption.field}-${sortOption.direction}`}
                        value={`${sortOption.field}-${sortOption.direction}`}
                      >
                        {sortOption.field} {sortOption?.direction}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        </form>
        <p>Render Count: {renderCount}</p>
      </>
    );
  }
);

QueryBar.displayName = "QueryBar";

export default QueryBar;
