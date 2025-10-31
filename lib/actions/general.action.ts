"use server";

import { db } from "@/firebase/admin";
import { revalidatePath } from "next/cache";

export async function getFeedbacksByUserId(
  userId: string
): Promise<Feedback[]> {
  try {
    const snapshot = await db
      .collection("feedback")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    const feedbacks = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Feedback[];

    return feedbacks;
  } catch (error) {
    console.error("Error fetching feedbacks:", error);
    return [];
  }
}

export const deleteInterview = async (feedbackId: string) => {
  try {
    // Admin SDK diye delete korar way
    await db.collection("feedback").doc(feedbackId).delete();

    revalidatePath("/dashboard"); // jekhane cards show hocche sei path
    return { success: true };
  } catch (error) {
    console.error("Error deleting interview:", error);
    return { success: false, error };
  }
};
