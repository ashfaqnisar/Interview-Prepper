import { useEffect, useState } from "react";
import clsx from "clsx";

import { Icons } from "@/shared/icons";

const CustomPagination = ({
  currentPage,
  totalPages,
  updatePage,
}: {
  totalPages: number;
  currentPage: number;
  updatePage: (newPage: number) => void;
}) => {
  const [pageNumbers, setPageNumbers] = useState<(number | string)[]>([]);

  const getPageNumbers = (currentPage: number, totalPages: number): (number | string)[] => {
    // Array to store the page numbers
    const pageNumbers = [];

    // If the total pages are less than or equal to 5, return all the pages
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
      return pageNumbers;
    }

    // Add the first page
    pageNumbers.push(1);

    // Add the '...' if the current page is not the first or second page
    if (currentPage > 2) {
      pageNumbers.push("...");
    }

    // Calculate the range of page numbers to display
    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);

    // Add the page numbers within the range
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    // Add the '...' if the current page is not the second last or last page
    if (currentPage < totalPages - 1) {
      pageNumbers.push("...");
    }

    // Add the last page
    pageNumbers.push(totalPages);

    return pageNumbers;
  };

  useEffect(() => {
    setPageNumbers(getPageNumbers(currentPage, totalPages));
  }, [currentPage, totalPages]);

  return (
    <div className={"w-fit bg-zinc-900"}>
      <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
        <a
          href="#"
          className={clsx(
            "relative inline-flex items-center rounded-l-md p-2 ring-1 ring-inset ring-gray-300 focus:z-20 focus:outline-offset-0",
            currentPage === 1
              ? "pointer-events-none text-zinc-400"
              : "text-zinc-200 hover:bg-zinc-800"
          )}
          {...(currentPage === 1 && { "aria-disabled": "true" })}
          onClick={(event) => {
            event.preventDefault();
            if (currentPage !== 1) {
              updatePage(currentPage - 1);
            }
          }}
        >
          <span className="sr-only">Previous</span>
          <Icons.leftArrow className="h-5 w-5" aria-hidden="true" />
        </a>
        {pageNumbers.map((pageNumber, index) => {
          return (
            <a
              href={"#"}
              key={index}
              className={clsx(
                "z-10 inline-flex w-fit items-center px-3 py-2 text-sm focus:z-20",
                pageNumber === currentPage
                  ? "bg-zinc-100 font-semibold text-zinc-900"
                  : "font-semibold text-zinc-200 ring-1 ring-inset ring-gray-300 hover:bg-zinc-800 focus:outline-offset-0"
              )}
              onClick={(event) => {
                event.preventDefault();
                if (typeof pageNumber === "number") {
                  updatePage(pageNumber);
                }
              }}
            >
              {Number(pageNumber) < 10 ? `0${pageNumber}` : pageNumber}
            </a>
          );
        })}
        <a
          href="#"
          className={clsx(
            "relative inline-flex items-center rounded-r-md p-2 ring-1 ring-inset ring-gray-300 focus:z-20 focus:outline-offset-0",
            currentPage === totalPages
              ? "pointer-events-none text-zinc-400"
              : "text-zinc-200 hover:bg-zinc-800"
          )}
          {...(currentPage === totalPages && { "aria-disabled": "true" })}
          onClick={(event) => {
            event.preventDefault();
            if (currentPage !== totalPages) {
              updatePage(currentPage + 1);
            }
          }}
        >
          <span className="sr-only">Next</span>
          <Icons.rightArrow className="h-5 w-5" aria-hidden="true" />
        </a>
      </nav>
    </div>
  );
};

export default CustomPagination;
