import { useEffect, useState } from "react";
import { getHealth } from "../api/serviceRequests";

export default function HealthBadge() {
  const [state, setState] = useState("checking"); // checking | online | offline

  useEffect(() => {
    let cancelled = false;
    getHealth()
      .then((h) => !cancelled && setState(h.status === "ok" ? "online" : "offline"))
      .catch(() => !cancelled && setState("offline"));
    return () => {
      cancelled = true;
    };
  }, []);

  const label = { checking: "Checking API…", online: "API online", offline: "API unreachable" }[state];
  return (
    <span className={`health health--${state}`} role="status">
      <span className="health__dot" aria-hidden="true" />
      {label}
    </span>
  );
}
