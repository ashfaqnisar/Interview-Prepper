import { useEffect, useRef } from "react";

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
    <div className={"text-xs tracking-normal duration-150 md:text-sm"}>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <p>
          Showing{" "}
          <span className={"font-medium text-zinc-100"}>
            {startIndexRef?.current ?? 0} - {Math.min(startIndexRef.current + pageSize - 1, totalItems) ?? 0}
          </span>{" "}
          of <span className={"font-medium text-zinc-100"}>{totalItems ?? 0}</span>
        </p>
      )}
    </div>
  );
};

export default CustomPagingInfo;
