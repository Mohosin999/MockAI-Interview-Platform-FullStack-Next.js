import { getCurrentUser } from "@/lib/actions/auth.action";
import Agent from "@/components/Agent";

const Page = async () => {
  const user = await getCurrentUser();

  if (!user?.id) return null;

  return (
    <>
      <h3 className="text-center">Sharpen Your Skills Today!</h3>
      <Agent userName={user.name} userId={user.id} type="generate" />
    </>
  );
};

export default Page;
