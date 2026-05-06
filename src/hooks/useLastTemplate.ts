import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { cvService, type CVTemplate } from "../services/cv.service";

export interface LastTemplate {
  templateId: CVTemplate;
  fileUrl: string | null;
  createdAt: string;
}

export interface UseLastTemplateResult {
  data: LastTemplate | null;
  loading: boolean;
}

export function useLastTemplate(): UseLastTemplateResult {
  const { user } = useAuth();
  const [data, setData] = useState<LastTemplate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    cvService.getLastTemplate(user.id).then((result) => {
      if (!active) return;
      setData(result);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [user?.id]);

  return { data, loading };
}
