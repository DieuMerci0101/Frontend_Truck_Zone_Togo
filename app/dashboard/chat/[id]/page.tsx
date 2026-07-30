"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ChatConversationRedirect() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    router.replace(`/dashboard/chat?conv=${params.id}`);
  }, [params.id, router]);

  return null;
}
