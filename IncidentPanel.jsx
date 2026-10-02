import { useState } from "react";

function IncidentPanel({ analysis, events }) {
    const [showDetails, setShowDetails] = useState(false);

    if (!analysis) {
        return (
            <div className="empty">
                No active incident available.
            </div>
        );
    }

    return (
        <div>
            <div className="incident-header">
                <div>
                    <span>INCIDENT ID</span>
                    <h2>INC-001</h2>
                </div>

                <button
                    className="incident-status"
                    onClick={() => setShowDetails(true)}
                >
                    OPEN
                </button>
            </div>

            <div className="incident-grid">
                <div className="incident-stat">
                    <span>Risk Level</span>
                    <strong>{analysis.risk_level}</strong>
                </div>

                <div className="incident-stat">
                    <span>Risk Score</span>
                    <strong>{analysis.risk_score}</strong>
                </div>

                <div className="incident-stat">
                    <span>Events Analyzed</span>
                    <strong>{analysis.events_analyzed}</strong>
                </div>

                <div className="incident-stat">
                    <span>Affected Assets</span>
                    <strong>
                        {new Set(
                            events.map((event) => event.device)
                        ).size}
                    </strong>
                </div>
            </div>

            <div className="incident-section">
                <h4>Threat Summary</h4>
                <p>{analysis.threat_summary}</p>
            </div>

            <div className="incident-section">
                <h4>Detected Activity</h4>

                <div className="incident-events">
                    {events.map((event, index) => (
                        <div className="incident-event" key={index}>
                            <div>
                                <strong>{event.event_type}</strong>
                                <small>
                                    {event.user} · {event.device}
                                </small>
                            </div>

                            <div>
                                <span
                                    className={`badge ${event.risk_level.toLowerCase()}`}
                                >
                                    {event.risk_level}
                                </span>

                                <strong>{event.risk_score}</strong>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="incident-section">
                <h4>Recommended Defensive Actions</h4>

                <ul>
                    {analysis.recommended_actions?.map((action, index) => (
                        <li key={index}>{action}</li>
                    ))}
                </ul>
            </div>

            {/* Incident Details Popup */}
            {showDetails && (
                <div
                    className="modal-overlay"
                    onClick={() => setShowDetails(false)}
                >
                    <div
                        className="incident-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="modal-close"
                            onClick={() => setShowDetails(false)}
                        >
                            ×
                        </button>

                        <h2>Incident Details — INC-001</h2>

                        <p><strong>Status:</strong> OPEN</p>
                        <p>
                            <strong>Risk Level:</strong>{" "}
                            {analysis.risk_level}
                        </p>
                        <p>
                            <strong>Risk Score:</strong>{" "}
                            {analysis.risk_score}
                        </p>
                        <p>
                            <strong>Events Analyzed:</strong>{" "}
                            {analysis.events_analyzed}
                        </p>
                        <p>
                            <strong>Affected Assets:</strong>{" "}
                            {new Set(
                                events.map((event) => event.device)
                            ).size}
                        </p>

                        <h3>Threat Summary</h3>
                        <p>{analysis.threat_summary}</p>

                        <h3>Recommended Defensive Actions</h3>
                        <ul>
                            {analysis.recommended_actions?.map(
                                (action, index) => (
                                    <li key={index}>{action}</li>
                                )
                            )}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}

export default IncidentPanel;