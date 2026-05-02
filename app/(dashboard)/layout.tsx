import DashBoardLayoutProvider from "@/provider/dashboard.layout.provider";

import { getDictionary } from "@/app/dictionaries";

const layout = async ({ children }: { children: React.ReactNode }) => {
  const trans = await getDictionary();

  return (
    <DashBoardLayoutProvider trans={trans}>{children}</DashBoardLayoutProvider>
  );
};

export default layout;
