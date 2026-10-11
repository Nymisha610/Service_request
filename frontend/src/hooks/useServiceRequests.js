import { useCallback, useEffect, useState } from "react";
import { fetchServiceRequests } from "../api/serviceRequests";

/** Loads the request list and exposes a reload() for after a submission. */
export function useServiceRequests() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const list = await fetchServiceRequests();
      setItems(list ?? []);
      setStatus("success");
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { items, status, error, reload: load };
}
