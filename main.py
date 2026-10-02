from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
from urllib.parse import urlparse
import ipaddress

class ScamLinkRequest(BaseModel):
    url: str

app = FastAPI(
    title="CyberNexus",
    description="AI-Driven Cyber Threat Intelligence Platform",
    version="1.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:5175"
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Temporary security event storage
security_events = []


# Security Event Model
class SecurityEvent(BaseModel):
    user: str
    device: str
    event_type: str
    severity: str
    location: str


# Home
@app.get("/")
def home():
    return {
        "project": "CyberNexus",
        "status": "online",
        "message": "CyberNexus backend is running"
    }


# Health Check
@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


# Receive and Analyze Security Event
@app.post("/events")
def create_event(event: SecurityEvent):

    # Risk score based on severity
    severity_scores = {
        "LOW": 20,
        "MEDIUM": 40,
        "HIGH": 70,
        "CRITICAL": 90
    }

    severity = event.severity.upper()

    risk_score = severity_scores.get(severity, 10)

    # Determine risk level
    if risk_score >= 80:
        risk_level = "CRITICAL"
    elif risk_score >= 60:
        risk_level = "HIGH"
    elif risk_score >= 30:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    # Create analyzed event
    analyzed_event = {
        "user": event.user,
        "device": event.device,
        "event_type": event.event_type,
        "severity": severity,
        "location": event.location,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "timestamp": datetime.now().isoformat()
    }

    # Store event
    security_events.append(analyzed_event)

    return {
        "message": "Security event analyzed and stored",
        "event": analyzed_event
    }


# View Stored Events
@app.get("/events")
def get_events():
    return {
        "total_events": len(security_events),
        "events": security_events
    }

    # Correlate related security events
@app.get("/incidents")
def get_incidents():

    incidents = []

    # Group events by user and device
    grouped_events = {}

    for event in security_events:
        key = (event["user"], event["device"])

        if key not in grouped_events:
            grouped_events[key] = []

        grouped_events[key].append(event)

    # Create incidents from grouped events
    for key, events in grouped_events.items():

        user, device = key

        highest_risk = max(
            event["risk_score"]
            for event in events
        )

        if highest_risk >= 80:
            incident_level = "CRITICAL"
        elif highest_risk >= 60:
            incident_level = "HIGH"
        elif highest_risk >= 30:
            incident_level = "MEDIUM"
        else:
            incident_level = "LOW"

        incident = {
            "incident_id": f"INC-{len(incidents) + 1:03d}",
            "user": user,
            "device": device,
            "total_events": len(events),
            "incident_level": incident_level,
            "highest_risk_score": highest_risk,
            "events": events
        }

        incidents.append(incident)

    return {
        "total_incidents": len(incidents),
        "incidents": incidents
    }

    # Generate Attack Graph
@app.get("/attack-graph")
def get_attack_graph():

    nodes = []
    edges = []

    # Process stored security events
    for event in security_events:

        user_id = f"user-{event['user']}"
        device_id = f"device-{event['device']}"

        # Add user node
        if not any(node["id"] == user_id for node in nodes):
            nodes.append({
                "id": user_id,
                "label": event["user"],
                "type": "User"
            })

        # Add device node
        if not any(node["id"] == device_id for node in nodes):
            nodes.append({
                "id": device_id,
                "label": event["device"],
                "type": "Device"
            })

        # Connect user to device
        edge_id = f"{user_id}-{device_id}"

        if not any(edge["id"] == edge_id for edge in edges):
            edges.append({
                "id": edge_id,
                "source": user_id,
                "target": device_id,
                "relationship": "uses"
            })

        # Create event node
        event_id = f"event-{len(nodes) + 1}"

        nodes.append({
            "id": event_id,
            "label": event["event_type"],
            "type": "Security Event",
            "risk_level": event["risk_level"],
            "risk_score": event["risk_score"]
        })

        # Connect device to event
        edges.append({
            "id": f"{device_id}-{event_id}",
            "source": device_id,
            "target": event_id,
            "relationship": "generated"
        })

                # Connect event to the shared location node
        edges.append({
            "id": f"{event_id}-location-unknown",
            "source": event_id,
            "target": "location-unknown",
            "relationship": "location not verified"
        })

    # Add one shared location node (demo data only)
    nodes.append({
        "id": "location-unknown",
        "label": "Location Unknown",
        "type": "Approximate Location",
        "location": "Not verified",
        "note": "Demo data only — not a confirmed scammer location"
    })

    return {
        "graph": {
            "nodes": nodes,
            "edges": edges
        }
    }

    # Clear all stored security events
@app.delete("/events")
def clear_events():
    security_events.clear()

    return {
        "message": "All security events cleared",
        "total_events": len(security_events)
    }

    # Generate a simulated security incident
@app.post("/simulate-incident")
def simulate_incident():

    simulated_events = [
        {
            "user": "student01",
            "device": "LAPTOP-07",
            "event_type": "Suspicious Login",
            "severity": "HIGH",
            "location": "Unknown"
        },
        {
            "user": "student01",
            "device": "LAPTOP-07",
            "event_type": "Unusual Application Access",
            "severity": "HIGH",
            "location": "Unknown"
        },
        {
            "user": "student01",
            "device": "LAPTOP-07",
            "event_type": "Privilege Attempt",
            "severity": "CRITICAL",
            "location": "Unknown"
        }
    ]

    created_events = []

    severity_scores = {
        "LOW": 20,
        "MEDIUM": 40,
        "HIGH": 70,
        "CRITICAL": 90
    }

    for event in simulated_events:

        severity = event["severity"]
        risk_score = severity_scores[severity]

        if risk_score >= 80:
            risk_level = "CRITICAL"
        elif risk_score >= 60:
            risk_level = "HIGH"
        elif risk_score >= 30:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"

        analyzed_event = {
            **event,
            "risk_score": risk_score,
            "risk_level": risk_level,
            "timestamp": datetime.now().isoformat()
        }

        security_events.append(analyzed_event)
        created_events.append(analyzed_event)

    return {
        "message": "Simulated security incident generated",
        "events_created": len(created_events),
        "events": created_events
    }

    # Analyze potential attack path
@app.get("/attack-path")
def analyze_attack_path():

    if not security_events:
        return {
            "message": "No security events available",
            "attack_path": []
        }

    events = sorted(
        security_events,
        key=lambda event: event["timestamp"]
    )

    path = []

    for index, event in enumerate(events):

        if index == 0:
            stage = "Initial Access"
        elif index == 1:
            stage = "Suspicious Activity"
        elif index == 2:
            stage = "Privilege Activity"
        else:
            stage = "Further Investigation"

        path.append({
            "step": index + 1,
            "stage": stage,
            "event": event["event_type"],
            "user": event["user"],
            "device": event["device"],
            "risk_score": event["risk_score"],
            "risk_level": event["risk_level"],
            "timestamp": event["timestamp"]
        })

    highest_risk = max(
        event["risk_score"]
        for event in events
    )

    if highest_risk >= 80:
        overall_risk = "CRITICAL"
    elif highest_risk >= 60:
        overall_risk = "HIGH"
    elif highest_risk >= 30:
        overall_risk = "MEDIUM"
    else:
        overall_risk = "LOW"

    return {
        "analysis": {
            "overall_risk": overall_risk,
            "highest_risk_score": highest_risk,
            "stages_detected": len(path),
            "explanation": (
                "CyberNexus correlated multiple security "
                "events involving the same user and device "
                "into a potential multi-stage incident."
            )
        },
        "attack_path": path
    }

    # AI-style threat explanation
@app.get("/ai-analysis")
def ai_analysis():

    if not security_events:
        return {
            "message": "No security events available"
        }

    events = sorted(
        security_events,
        key=lambda event: event["timestamp"]
    )

    event_types = [
        event["event_type"]
        for event in events
    ]

    highest_risk = max(
        event["risk_score"]
        for event in events
    )

    if highest_risk >= 80:
        risk_level = "CRITICAL"
    elif highest_risk >= 60:
        risk_level = "HIGH"
    elif highest_risk >= 30:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    explanations = []

    if "Suspicious Login" in event_types:
        explanations.append(
            "A suspicious authentication event was detected."
        )

    if "Unusual Application Access" in event_types:
        explanations.append(
            "The same device accessed an application in an unusual sequence."
        )

    if "Privilege Attempt" in event_types:
        explanations.append(
            "A privilege-related activity was detected after the previous suspicious events."
        )

    return {
        "ai_analysis": {
            "risk_level": risk_level,
            "risk_score": highest_risk,
            "events_analyzed": len(events),
            "threat_summary": (
                "CyberNexus detected a potential multi-stage "
                "security incident involving the same user and device."
            ),
            "observations": explanations,
            "recommended_actions": [
                "Review the user's recent authentication activity.",
                "Verify whether the application access was authorized.",
                "Investigate the privilege attempt.",
                "Review the affected device for additional suspicious activity.",
                "Escalate the incident for analyst review if the activity is confirmed."
            ]
        }
    }

@app.get("/threat-intelligence")
def get_threat_intelligence():

    indicators = [
        {
            "indicator": "203.0.113.45",
            "type": "IP",
            "category": "Suspicious Login Source",
            "confidence": 92,
            "risk_level": "HIGH",
            "status": "FLAGGED"
        },
        {
            "indicator": "suspicious-demo.example",
            "type": "DOMAIN",
            "category": "Phishing Simulation",
            "confidence": 87,
            "risk_level": "HIGH",
            "status": "FLAGGED"
        },
        {
            "indicator": "DEMO-HASH-7A91",
            "type": "HASH",
            "category": "Malware Simulation",
            "confidence": 96,
            "risk_level": "CRITICAL",
            "status": "FLAGGED"
        },
        {
            "indicator": "198.51.100.27",
            "type": "IP",
            "category": "Unusual Network Activity",
            "confidence": 74,
            "risk_level": "MEDIUM",
            "status": "MONITORING"
        }
    ]

    return {
        "total_indicators": len(indicators),
        "indicators": indicators
    }

@app.post("/analyze-link")
def analyze_link(request: ScamLinkRequest):
    raw_url = request.url.strip()
    parsed = urlparse(raw_url)

    indicators = []
    score = 0

    if parsed.scheme not in ["http", "https"]:
        indicators.append("URL must start with http:// or https://")
        score += 30

    hostname = parsed.hostname

    if not hostname:
        indicators.append("The URL does not contain a valid hostname.")
        score += 40
    else:
        try:
            ipaddress.ip_address(hostname)
            indicators.append("The link uses an IP address instead of a domain name.")
            score += 25
        except ValueError:
            pass

        if hostname.startswith("xn--") or ".xn--" in hostname:
            indicators.append("The domain contains punycode, which can be used to imitate other domains.")
            score += 25

    suspicious_words = [
        "login", "verify", "password", "bank",
        "account", "update", "secure", "free", "claim"
    ]

    lower_url = raw_url.lower()
    found_words = [word for word in suspicious_words if word in lower_url]

    if found_words:
        indicators.append(
            "The URL contains words sometimes used in deceptive links: "
            + ", ".join(found_words)
        )
        score += 10

    if "@" in parsed.netloc:
        indicators.append("The URL contains an @ symbol in its address section.")
        score += 20

    if len(raw_url) > 100:
        indicators.append("The URL is unusually long.")
        score += 10

    score = min(score, 100)

    if score >= 50:
        risk_level = "High"
    elif score >= 25:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    if not indicators:
        indicators.append("No basic suspicious indicators were found.")

    return {
        "url": raw_url,
        "risk_score": score,
        "risk_level": risk_level,
        "indicators": indicators,
        "note": "This is a basic prototype check. It does not visit the link and cannot guarantee whether a URL is safe."
    }