import { useEffect, useState } from "react";

const API = "http://127.0.0.1:8000";

function AttackTimeline() {
    const [path, setPath] = useState([]);
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadAttackPath = async () => {
        try {
            setLoading(true);

            const response = await fetch(
                `${API}/attack-path`
            );

            const data = await response.json();

            setPath(data.attack_path || []);
            setAnalysis(data.analysis || null);

        } catch (error) {
            console.error(
                "Attack path loading failed:",
                error
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAttackPath();

        const interval = setInterval(
            loadAttackPath,
            3000
        );

        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <p className="empty">
                Loading attack path...
            </p>
        );
    }

    return (
        <div>

            {analysis && (
                <div
                    style={{
                        marginBottom: "20px",
                        padding: "15px",
                        background: "#171016",
                        border: "1px solid #6d333a",
                        borderRadius: "10px",
                    }}
                >

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >

                        <div>
                            <small>
                                OVERALL INCIDENT RISK
                            </small>

                            <h2
                                style={{
                                    margin: "6px 0 0",
                                }}
                            >
                                {analysis.overall_risk}
                            </h2>
                        </div>

                        <div
                            style={{
                                textAlign: "right",
                            }}
                        >

                            <small>
                                RISK SCORE
                            </small>

                            <h2
                                style={{
                                    margin: "6px 0 0",
                                }}
                            >
                                {analysis.highest_risk_score}
                            </h2>

                        </div>

                    </div>

                    <p
                        style={{
                            color: "#9ca7b7",
                            fontSize: "13px",
                            lineHeight: "1.6",
                        }}
                    >
                        {analysis.explanation}
                    </p>

                </div>
            )}

            {path.length > 0 ? (

                <div
                    style={{
                        position: "relative",
                        paddingLeft: "30px",
                    }}
                >

                    {path.map((item, index) => (

                        <div
                            key={item.step}
                            style={{
                                position: "relative",
                                paddingBottom:
                                    index === path.length - 1
                                        ? "0"
                                        : "28px",
                            }}
                        >

                            {index !== path.length - 1 && (
                                <div
                                    style={{
                                        position: "absolute",
                                        left: "-22px",
                                        top: "25px",
                                        width: "2px",
                                        height:
                                            "calc(100% - 5px)",
                                        background: "#354052",
                                    }}
                                />
                            )}

                            <div
                                style={{
                                    position: "absolute",
                                    left: "-30px",
                                    top: "2px",
                                    width: "16px",
                                    height: "16px",
                                    borderRadius: "50%",
                                    background:
                                        item.risk_level ===
                                            "CRITICAL"
                                            ? "#ff5964"
                                            : "#e5b94f",
                                }}
                            />

                            <div
                                style={{
                                    background: "#111722",
                                    border: "1px solid #2a3342",
                                    borderRadius: "10px",
                                    padding: "15px",
                                }}
                            >

                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent:
                                            "space-between",
                                        gap: "15px",
                                    }}
                                >

                                    <div>

                                        <small
                                            style={{
                                                color: "#7f8999",
                                            }}
                                        >
                                            STEP {item.step} ·{" "}
                                            {item.stage}
                                        </small>

                                        <h4
                                            style={{
                                                margin:
                                                    "7px 0 5px",
                                            }}
                                        >
                                            {item.event}
                                        </h4>

                                        <small
                                            style={{
                                                color: "#737e90",
                                            }}
                                        >
                                            {item.user} ·{" "}
                                            {item.device}
                                        </small>

                                    </div>

                                    <div
                                        style={{
                                            textAlign: "right",
                                        }}
                                    >

                                        <strong>
                                            {item.risk_score}
                                        </strong>

                                        <small
                                            style={{
                                                display: "block",
                                                marginTop: "4px",
                                            }}
                                        >
                                            {item.risk_level}
                                        </small>

                                    </div>

                                </div>

                            </div>

                        </div>

                    ))}

                </div>

            ) : (

                <p className="empty">
                    No attack path detected.
                </p>

            )}

        </div>
    );
}

export default AttackTimeline;