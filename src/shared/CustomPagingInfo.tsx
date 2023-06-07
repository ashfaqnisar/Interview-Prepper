import { useEffect, useRef, useState } from "react";

const CustomPagingInfo = ({
  currentPage,
  pageSize,
  totalItems,
  isLoading
}: {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  isLoading: boolean;
}) => {
  const startIndexRef = useRef((currentPage - 1) * pageSize + 1);

  useEffect(() => {
    startIndexRef.current = (currentPage - 1) * pageSize + 1;
  }, [currentPage, pageSize]);

  return (
    <div className={"text-xs tracking-tight duration-150 md:text-sm xl:text-base"}>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <p>
          Showing{" "}
          <span className={"font-medium text-zinc-100"}>
            {startIndexRef.current} - {Math.min(startIndexRef.current + pageSize - 1, totalItems)}
          </span>{" "}
          of <span className={"font-medium text-zinc-100"}>{totalItems}</span>
        </p>
      )}
    </div>
  );
};

export default CustomPagingInfo;
