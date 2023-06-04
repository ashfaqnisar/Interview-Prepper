export const extractRawData = (data: { raw: string } | string | undefined): string | null => {
  if (typeof data === "object" && data?.raw) {
    return data.raw;
  }
  if (typeof data === "string") {
    return data;
  }
  return null;
};
