import { useEffect, useState } from "react";

export function useProfile() {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    fetch("/api/profile")
      .then((response) => {
        if (!response.ok) throw new Error("Failed to load profile");
        return response.json();
      })
      .then((data) => setData(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return {loading, data};
}