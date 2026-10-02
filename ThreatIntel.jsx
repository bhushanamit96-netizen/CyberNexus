import { useState } from "react";

function ThreatIntel({ events = [] }) {
  const [filter, setFilter] = useState("ALL");

  const getThreatInfo = (event) => {
    const risk = event.risk_level?.toUpperCase();

    const threatInfo = {
      CRITICAL: {
        category: "Critical Security Threat",
        description:
          "A critical-risk event was detected in the simulated environment.",
        action: "Investigate the event and review affected systems.",
      },
      HIGH: {
        category: "High-Risk Activity",
        description:
          "A high-risk security event requires further investigation.",
        action: "Review event details and monitor related activity.",
      },
      MEDIUM: {
        category: "Suspicious Activity",
        description: "An event with moderate risk was identified.",
        action: "Monitor the activity and check for repeated events.",
      },
      LOW: {
        category: "Low-Risk Activity",
        description: "A low-risk event was recorded.",
        action: "Continue routine monitoring.",
      },
    };

    return (
      threatInfo[risk] || {
        category: "Unclassified Event",
        description: "No threat classification is available.",
        action: "Review the event details.",
      }
    );
  };

  const filteredEvents =
    filter === "ALL"
      ? events
      : events.filter(
          (event) => event.risk_level?.toUpperCase() === filter
        );

  if (events.length === 0) {
    return (
      <div className="threat-empty">
        No threat intelligence available. Simulate an incident to view events.
      </div>
    );
  }

  return (
    <div>
      <div className="threat-filters">
        {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((level) => (
          <button
            key={level}
            className={`threat-filter ${
              filter === level ? "active" : ""
            }`}
            onClick={() => setFilter(level)}
          >
            {level}
            {level === "ALL"
              ? ` (${events.length})`
              : ` (${events.filter(
                  (event) => event.risk_level?.toUpperCase() === level
                ).length})`}
          </button>
        ))}
      </div>

      {filteredEvents.length === 0 ? (
        <div className="threat-empty">
          No {filter.toLowerCase()} risk events found.
        </div>
      ) : (
        <div className="threat-intel-list">
          {filteredEvents.slice(0, 5).map((event, index) => {
            const info = getThreatInfo(event);

            return (
              <div className="threat-intel-card" key={index}>
                <div className="threat-intel-header">
                  <div>
                    <h4>{info.category}</h4>
                    <small>{event.event_type || "Security Event"}</small>
                  </div>

                  <span
                    className={`badge ${(event.risk_level || "unknown").toLowerCase()}`}
                  >
                    {event.risk_level || "UNKNOWN"}
                  </span>
                </div>

                <p>{info.description}</p>

                <div className="threat-action">
                  <strong>Recommended action:</strong>
                  <p>{info.action}</p>
                </div>

                <small className="threat-source">
                  User: {event.user || "Unknown"} · Device:{" "}
                  {event.device || "Unknown"}
                </small>
              </div>
            );
          })}
        </div>
      )}

      <p className="threat-disclaimer">
        Demonstration only — classifications and actions are based on simulated events.
      </p>
    </div>
  );
}

export default ThreatIntel;