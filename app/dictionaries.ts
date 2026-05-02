import "server-only";

export const getDictionary = async () => {
  return (await import("./dictionaries/en.json")).default;
};
