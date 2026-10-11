import { formatDate, STATUS_LABELS } from "../utils/format";

function RequestCard({ item }) {
  return (
    <li className="card">
      <div className="card__top">
        <h3 className="card__title">{item.subject}</h3>
        <span className={`badge badge--${item.status}`}>{STATUS_LABELS[item.status] ?? item.status}</span>
      </div>
      <p className="card__desc">{item.description}</p>
      <p className="card__meta">
        {item.name} · {formatDate(item.created_at)}
      </p>
    </li>
  );
}

export default function RequestList({ items, status, error, onRetry }) {
  if (status === "loading") {
    return (
      <div className="panel__state" role="status" aria-live="polite">
        <span className="spinner" aria-hidden="true" /> Loading service requests…
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="panel__state panel__state--error" role="alert">
        <p>
          <strong>Couldn’t load service requests.</strong>
        </p>
        <p>{error}</p>
        <button type="button" className="btn btn--secondary" onClick={onRetry}>
          Try again
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="panel__state">
        <p>
          <strong>No service requests yet.</strong>
        </p>
        <p>Submit the first one using the form.</p>
      </div>
    );
  }

  return (
    <ul className="cards">
      {items.map((item) => (
        <RequestCard key={item.id} item={item} />
      ))}
    </ul>
  );
}
