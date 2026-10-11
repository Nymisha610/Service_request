import HealthBadge from "./components/HealthBadge";
import RequestForm from "./components/RequestForm";
import RequestList from "./components/RequestList";
import { useServiceRequests } from "./hooks/useServiceRequests";

export default function App() {
  const { items, status, error, reload } = useServiceRequests();

  return (
    <div className="page">
      <header className="header">
        <div>
          <h1>Service Request Dashboard</h1>
          <p className="header__sub">Report an issue and follow what the team is working on.</p>
        </div>
        <HealthBadge />
      </header>

      <main className="layout">
        <section className="panel" aria-labelledby="form-title">
          <h2 id="form-title">New request</h2>
          <RequestForm onCreated={reload} />
        </section>

        <section className="panel" aria-labelledby="list-title">
          <div className="panel__head">
            <h2 id="list-title">Requests</h2>
            {status === "success" && <span className="count">{items.length} total</span>}
          </div>
          <RequestList items={items} status={status} error={error} onRetry={reload} />
        </section>
      </main>
    </div>
  );
}
