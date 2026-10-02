import { useState } from "react";

function ResponseCenter() {
    const [selectedAction, setSelectedAction] =
        useState(null);

    const [incidentStatus, setIncidentStatus] =
        useState("OPEN");

    const [responseLog, setResponseLog] =
        useState([]);

        const [responseMessage, setResponseMessage] = useState("");

    const actions = [
        {
            id: "isolate",
            title: "Isolate Device",
            description:
                "Simulate isolating the affected device.",
            nextStatus: "CONTAINED",
        },
        {
            id: "session",
            title: "Suspend Session",
            description:
                "Simulate suspending the suspicious session.",
            nextStatus: "INVESTIGATING",
        },
        {
            id: "credential",
            title: "Force Credential Reset",
            description:
                "Simulate requiring a credential reset.",
            nextStatus: "INVESTIGATING",
        },
        {
            id: "monitor",
            title: "Increase Monitoring",
            description:
                "Simulate increased monitoring.",
            nextStatus: "INVESTIGATING",
        },
        {
            id: "escalate",
            title: "Escalate Incident",
            description:
                "Simulate escalation to a security analyst.",
            nextStatus: "INVESTIGATING",
        },
    ];

    const executeAction = () => {
        if (!selectedAction) {
            return;
        }

        const action = actions.find(
            (item) => item.id === selectedAction
        );

        setIncidentStatus(action.nextStatus);
        
        setResponseMessage(
    `${action.title} simulated successfully.`
);
        setResponseLog((previous) => [
            {
                action: action.title,
                status: action.nextStatus,
                time: new Date().toLocaleTimeString(),
            },
            ...previous,
        ]);

        setSelectedAction(null);
    };

    return (
        <div>

            <div className="response-intro">

                <p>
                    Select a simulated defensive response for
                    the current security incident.
                </p>

                <span>
                    SIMULATION MODE
                </span>

            </div>


            <div className="incident-response-status">

                <span>
                    INCIDENT STATUS
                </span>

                <strong className={`incident-status-badge ${incidentStatus.toLowerCase()}`}>
    {incidentStatus}
</strong>

            </div>


            <div className="response-actions">

                {actions.map((action) => (

                    <button
                        key={action.id}
                        className={`response-action ${selectedAction === action.id
                                ? "selected"
                                : ""
                            }`}
                        onClick={() =>
                            setSelectedAction(action.id)
                        }
                    >

                        <strong>
                            {action.title}
                        </strong>

                        <small>
                            {action.description}
                        </small>

                    </button>

                ))}

            </div>


            <button
                className="execute-response"
                onClick={executeAction}
                disabled={!selectedAction}
            >
                EXECUTE SIMULATED RESPONSE
            </button>

            {responseMessage && (
    <div className="response-success-message">
        ✓ {responseMessage}
    </div>
)}


            {responseLog.length > 0 && (

                <div className="response-log">

                    <h4>
                        Response Activity
                    </h4>

                    {responseLog.map(
                        (item, index) => (

                            <div
                                className="response-log-row"
                                key={index}
                            >

                                <div>

                                    <strong>
                                        {item.action}
                                    </strong>

                                    <small>
                                        {item.time}
                                    </small>

                                </div>

                                <span className={`response-log-status ${item.status.toLowerCase()}`}>
    {item.status}
</span>

                            </div>

                        )
                    )}

                </div>

            )}

        </div>
    );
}

export default ResponseCenter;