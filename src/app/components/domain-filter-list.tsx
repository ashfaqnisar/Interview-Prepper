import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { cn } from "@/lib/utils";
import { Badge } from "@/shared/ui/badge";

interface DomainBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  text: string;
  isActive: boolean;
}

const DomainBadge = ({ text, isActive, ...props }: DomainBadgeProps) => {
  return (
    <Badge
      variant={isActive ? "default" : "outline"}
      className={cn(
        "cursor-pointer capitalize focus:ring-0 2xl:text-sm",
        !isActive && "hover:bg-secondary"
      )}
      {...props}
    >
      {text}
    </Badge>
  );
};

const DomainFilterList = ({ updateDomain }: { updateDomain: (domain: string) => void }) => {
  const [filter, setFilter] = useState("");

  const { data: domains, isSuccess } = useQuery<{ value: string; count: string }[]>({
    queryKey: ["domains"],
    queryFn: async ({ signal }) => {
      const res = await axios({
        method: "POST",
        url: `${process.env.NEXT_PUBLIC_APP_SEARCH_ENDPOINT}/api/as/v1/engines/${process.env.NEXT_PUBLIC_ENGINE_NAME}/search`,
        data: {
          query: "",
          facets: {
            domain: [
              {
                type: "value",
                sort: {
                  count: "desc",
                },
              },
            ],
          },
          page: {
            size: 0,
          },
        },
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_APP_SEARCH_KEY}`,
        },
        signal,
      });
      return res.data.facets.domain[0].data;
    },
    keepPreviousData: true,
    staleTime: 20 * 1000,
    initialDataUpdatedAt: Date.now(),
  });

  const handleDomainUpdate = (newDomainValue: string) => {
    setFilter(newDomainValue);
    updateDomain(newDomainValue);
  };

  return (
    isSuccess && (
      <div className={"flex flex-wrap gap-2"}>
        <DomainBadge
          isActive={filter === ""}
          text={"all"}
          onClick={() => {
            handleDomainUpdate("");
          }}
        />
        {domains.map((domain) => (
          <DomainBadge
            key={domain.value}
            text={`${domain.value} | ${domain.count}`}
            isActive={domain.value === filter}
            onClick={() => {
              handleDomainUpdate(domain.value);
            }}
          />
        ))}
      </div>
    )
  );
};

export default DomainFilterList;
