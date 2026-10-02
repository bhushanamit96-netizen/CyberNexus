import { useEffect, useState } from "react";

import "./App.css";

import AttackTimeline from "./AttackTimeline";
import AttackGraph from "./AttackGraph";
import IncidentPanel from "./IncidentPanel";
import ResponseCenter from "./ResponseCenter";
import ThreatIntel from "./ThreatIntel";
import jsQR from "jsqr";
import { Html5Qrcode } from "html5-qrcode";

const API = "http://127.0.0.1:8000";

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [events, setEvents] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [eventSearch, setEventSearch] = useState("");
  const [linkInput, setLinkInput] = useState("");
  const [linkResult, setLinkResult] = useState(null);
  const [history, setHistory] = useState(() => {
  try {
    return JSON.parse(localStorage.getItem("cybernexusHistory")) || [];
  } catch {
    return [];
  }
});
  const [linkLoading, setLinkLoading] = useState(false);
  const [qrResult, setQrResult] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [showQrOptions, setShowQrOptions] = useState(false);
  const [scannerRunning, setScannerRunning] = useState(false);
  const [scannerMessage, setScannerMessage] = useState("");
  const [showQrUpload, setShowQrUpload] = useState(false);
  const filteredEvents = events.filter((event) => {
  const search = eventSearch.toLowerCase();

  return (
    String(event.event_type || "").toLowerCase().includes(search) ||
    String(event.user || "").toLowerCase().includes(search) ||
    String(event.device || "").toLowerCase().includes(search)
  );
});

  const loadData = async () => {
    try {
      const eventsResponse = await fetch(`${API}/events`);
      const eventsData = await eventsResponse.json();

      setEvents(eventsData.events || []);

      const analysisResponse = await fetch(`${API}/ai-analysis`);
      const analysisData = await analysisResponse.json();

      setAnalysis(analysisData.ai_analysis || null);
    } catch (error) {
      console.error("Backend connection failed:", error);
    }
  };

    const analyzeLink = async () => {
    if (!linkInput.trim()) {
      setLinkResult({
        error: "Please enter a link to analyze."
      });
      return;
    }

    setLinkLoading(true);
    setLinkResult(null);

    try {
      const response = await fetch(`${API}/analyze-link`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ url: linkInput.trim() })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Link analysis failed.");
      }

      setLinkResult(data);

setHistory((previousHistory) => {
  const updatedHistory = [
    {
      type: "Link",
      input: linkInput.trim(),
      risk_level: data.risk_level,
      risk_score: data.risk_score,
      indicators: data.indicators,
      date: new Date().toLocaleString(),
    },
    ...previousHistory,
  ];

  localStorage.setItem(
    "cybernexusHistory",
    JSON.stringify(updatedHistory)
  );

  return updatedHistory;
});
    } catch (error) {
      setLinkResult({
        error: error.message || "Could not connect to the backend."
      });
    } finally {
      setLinkLoading(false);
    }
  };

  const handleQrUpload = async (event) => {
    const file = event.target.files[0];

    setQrResult(null);

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setQrResult({ error: "Please upload an image file." });
      return;
    }

    setQrLoading(true);

    try {
      const imageUrl = URL.createObjectURL(file);
      const image = new Image();

      image.onload = async () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = image.naturalWidth;
          canvas.height = image.naturalHeight;

          const context = canvas.getContext("2d");
          context.drawImage(image, 0, 0);

          const imageData = context.getImageData(
            0,
            0,
            canvas.width,
            canvas.height
          );

          const code = jsQR(
            imageData.data,
            imageData.width,
            imageData.height
          );

          URL.revokeObjectURL(imageUrl);

          if (!code) {
            setQrResult({ error: "No QR code was detected in this image." });
            setQrLoading(false);
            return;
          }

          const extractedText = code.data;
          setQrResult({ extractedText });

          const response = await fetch(`${API}/analyze-link`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ url: extractedText })
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.detail || "QR link analysis failed.");
          }

          setQrResult({ extractedText, analysis: data });
        } catch (error) {
          setQrResult({
            error: error.message || "Could not analyze this QR code."
          });
        } finally {
          setQrLoading(false);
        }
      };

      image.onerror = () => {
        URL.revokeObjectURL(imageUrl);
        setQrResult({ error: "Could not read this image." });
        setQrLoading(false);
      };

      image.src = imageUrl;
    } catch (error) {
      setQrResult({ error: "Could not process this image." });
      setQrLoading(false);
    }
  };
  
  const startScanner = async () => {
    setScannerMessage("");
    setQrResult(null);

    try {
      const scanner = new Html5Qrcode("qr-reader");

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        async (decodedText) => {
          setScannerMessage("QR code detected!");
          setLinkInput(decodedText);
          setScannerRunning(false);

          try {
            await scanner.stop();
            await scanner.clear();
          } catch (error) {
            console.log("Scanner stopped.");
          }

          try {
            const response = await fetch(`${API}/analyze-link`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({ url: decodedText })
            });

            const data = await response.json();

            if (!response.ok) {
              throw new Error(data.detail || "QR analysis failed.");
            }

            setQrResult({
              extractedText: decodedText,
              analysis: data
            });
          } catch (error) {
            setQrResult({
              error: error.message || "Could not analyze the scanned content."
            });
          }
        },
        () => {}
      );

      setScannerRunning(true);
      setScannerMessage("Camera is running. Point it at a QR code.");
    } catch (error) {
      setScannerMessage(
        "Could not start the camera. Check browser camera permission."
      );
      setScannerRunning(false);
    }
  };


 const exportReport = () => {
  const reportRows = [];

  const addRow = (section, field, value) => {
    reportRows.push([section, field, value ?? ""]);
  };

  // Report information
  addRow("REPORT", "Project", "CyberNexus");
  addRow("REPORT", "Generated At", new Date().toLocaleString());
  addRow("REPORT", "Report Type", "Cybersecurity Analysis Summary");
  addRow(
    "IMPORTANT NOTE",
    "Data Status",
    "CyberNexus is a prototype. Some security events may be simulated. This report is not an official forensic report or proof of a crime."
  );

  // Dashboard summary
  addRow("DASHBOARD SUMMARY", "Security Score", `${securityScore}/100`);
  addRow("DASHBOARD SUMMARY", "Security Status", scoreStatus);
  addRow("DASHBOARD SUMMARY", "Total Events", events.length);

  // Security events
  events.forEach((event, index) => {
    const section = `SECURITY EVENT ${index + 1}`;

    addRow(section, "Event Type", event.event_type);
    addRow(section, "Risk Level", event.risk_level);
    addRow(section, "Risk Score", event.risk_score);
    addRow(section, "User", event.user);
    addRow(section, "Device", event.device);
  });

  // Saved analysis history
  history.forEach((item, index) => {
    const section = `SAVED ANALYSIS ${index + 1}`;

    addRow(section, "Type", item.type);
    addRow(section, "Input", item.input);
    addRow(section, "Risk Level", item.risk_level);
    addRow(section, "Risk Score", item.risk_score);
    addRow(section, "Date", item.date);

    if (Array.isArray(item.indicators)) {
      addRow(section, "Indicators", item.indicators.join("; "));
    }
  });

  // Latest link analysis
  if (linkResult && !linkResult.error) {
    addRow("LATEST LINK ANALYSIS", "Risk Level", linkResult.risk_level);
    addRow("LATEST LINK ANALYSIS", "Risk Score", linkResult.risk_score);

    if (Array.isArray(linkResult.indicators)) {
      addRow(
        "LATEST LINK ANALYSIS",
        "Indicators",
        linkResult.indicators.join("; ")
      );
    }

    addRow("LATEST LINK ANALYSIS", "Note", linkResult.note);
  }

  // Latest QR analysis
  if (qrResult && !qrResult.error) {
    addRow("LATEST QR ANALYSIS", "Risk Level", qrResult.risk_level);
    addRow("LATEST QR ANALYSIS", "Risk Score", qrResult.risk_score);

    if (Array.isArray(qrResult.indicators)) {
      addRow(
        "LATEST QR ANALYSIS",
        "Indicators",
        qrResult.indicators.join("; ")
      );
    }

    addRow("LATEST QR ANALYSIS", "Note", qrResult.note);
  }

  const headers = ["Section", "Field", "Details"];

  const csvContent = [headers, ...reportRows]
    .map((row) =>
      row
        .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "CyberNexus-Complete-Report.csv";
  link.click();

  URL.revokeObjectURL(url);
};


  const simulateIncident = async () => {
    setLoading(true);

    try {
      await fetch(`${API}/simulate-incident`, {
        method: "POST",
      });

      await loadData();
    } catch (error) {
      console.error("Simulation failed:", error);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const criticalEvents = events.filter(
    (event) => event.risk_level === "CRITICAL"
  ).length;

  const highEvents = events.filter(
    (event) => event.risk_level === "HIGH"
  ).length;

  // Demo security score based on simulated events
  const securityScore = Math.max(
    0,
    100 -
      events.reduce((deduction, event) => {
        const risk = event.risk_level?.toUpperCase();

        const points = {
          CRITICAL: 20,
          HIGH: 10,
          MEDIUM: 5,
          LOW: 2,
        };

        return deduction + (points[risk] || 0);
      }, 0)
  );

  const scoreStatus =
    securityScore >= 80
      ? "GOOD"
      : securityScore >= 50
      ? "MODERATE"
      : "NEEDS ATTENTION";


if (currentPage === "home") {
  return (
    <div className="landing-page">
      <nav className="landing-nav">
        <h2>⚡ CyberNexus</h2>
        <div className="landing-nav-links">
          <button onClick={() => setCurrentPage("home")}>Home</button>
          <button onClick={() => setCurrentPage("about")}>About CyberNexus</button>
          <button onClick={() => setCurrentPage("history")}>History</button>
        </div>
      </nav>

      <section className="landing-hero">
        <p className="landing-tag">AI-DRIVEN CYBER THREAT INTELLIGENCE</p>
        <h1>Secure Your Digital World</h1>
        <p className="landing-description">
          Analyze suspicious links, inspect QR codes, and explore cyber
          threats with CyberNexus.
        </p>

        <div className="landing-actions">
          <button onClick={() => setCurrentPage("dashboard")}>
            Open Dashboard →
          </button>
          <button onClick={() => setCurrentPage("guide")}>
            Explore Guide
          </button>
        </div>
      </section>

      <section className="landing-preview">
        <div className="preview-sidebar">
          <span>⚡</span>
          <span>◈</span>
          <span>⌕</span>
          <span>▦</span>
        </div>
        <div className="preview-content">
          <div className="preview-heading">
            <div>
              <small>CYBERNEXUS / OVERVIEW</small>
              <h3>Security Dashboard</h3>
            </div>
            <span className="preview-status">● SYSTEM ACTIVE</span>
          </div>

          <div className="preview-cards">
  <div>
    <small>Security Score</small>
    <strong>{securityScore}/100</strong>
  </div>
  <div>
    <small>Security Status</small>
    <strong>{scoreStatus}</strong>
  </div>
  <div>
    <small>Total Events</small>
    <strong>{events.length}</strong>
  </div>
</div>

          <div className="preview-chart">
            <div className="chart-line"></div>
            <div className="chart-label">THREAT ACTIVITY OVERVIEW</div>
          </div>
        </div>
      </section>
    </div>
  );
}

if (currentPage === "about") {
  return (
    <div className="home-screen">
      <h1>ABOUT CYBERNEXUS</h1>

      <h2>What is CyberNexus?</h2>
      <p>
        CyberNexus is a cybersecurity awareness and demonstration
        project designed to help users explore suspicious links,
        QR codes, and simulated security events.
      </p>

      <h2>Our Key Features</h2>

      <h3>1. Link Analyzer</h3>
      <p>
        Enter a URL to view its risk score, risk level, and
        indicators. The analyzer checks the URL text without
        opening or visiting the website.
      </p>

      <h3>2. QR Code Analyzer</h3>
      <p>
        Scan a QR code using the camera or upload an image.
        CyberNexus decodes the QR content and analyzes the link
        when one is found.
      </p>

      <h3>3. Attack Relationship Map</h3>
      <p>
        Explore a visual map of simulated security events and
        their relationships. Map points and connections are
        demonstration data, not confirmed real-world threats.
      </p>

      <h3>4. History and Report</h3>
      <p>
        Review saved link-analysis results and export a CSV
        report containing available dashboard and analysis data.
      </p>

      <h2>Technology Used</h2>
      <p>
        <strong>Frontend:</strong> React and Vite
      </p>
      <p>
        <strong>Backend:</strong> Python and FastAPI
      </p>
      <p>
        <strong>Map:</strong> Leaflet and React-Leaflet
      </p>

      <h2>Project Scope</h2>
      <p>
        CyberNexus is a demonstration prototype, not a
        production security service. Its results are indicators
        for awareness and should not be treated as a guarantee
        that a link is safe or malicious.
      </p>

      <button onClick={() => setCurrentPage("home")}>
        BACK TO HOME
      </button>

      <button onClick={() => setCurrentPage("dashboard")}>
        OPEN SECURITY DASHBOARD
      </button>
    </div>
  );
}

if (currentPage === "history") {
  return (
    <div className="home-screen">
      <h1>ANALYSIS HISTORY</h1>
      <p>Your previously analyzed links and QR codes.</p>

      {history.length === 0 ? (
        <p>No analysis history yet. Analyze a link or QR code first.</p>
      ) : (
        <div className="history-list">
          {history.map((item, index) => (
            <div className="history-item" key={index}>
              <h2>{item.type} Analysis</h2>
              <p><strong>Input:</strong> {item.input}</p>
              <p><strong>Risk:</strong> {item.risk_level}</p>
              <p><strong>Score:</strong> {item.risk_score}/100</p>
              <p><strong>Date:</strong> {item.date}</p>
            </div>
          ))}
        </div>
      )}

      <button onClick={() => setCurrentPage("home")}>
        BACK TO HOME
      </button>
      <button onClick={() => setCurrentPage("dashboard")}>
        OPEN DASHBOARD
      </button>
    </div>
  );
}

  return (
    <div className="app">
      <button
  className="back-home-button"
  onClick={() => setCurrentPage("home")}
>
  ← BACK TO HOME
</button>
      <header className="topbar">
        <div>
          <h1>CYBERNEXUS</h1>
          <p>AI-Driven Cyber Threat Intelligence Platform</p>
        </div>

       <div className="topbar-actions">
  <button
    className="export-button"
    onClick={exportReport}
  >
    DOWNLOAD REPORT
  </button>

  <div className="system-status">
    <span className="status-dot"></span>
    SYSTEM ONLINE
  </div>
</div> 
      </header>

            <section className="panel">
        <h2>SCAM LINK ANALYZER</h2>
        <p>Paste a suspicious URL to check for basic warning signs. The link will not be opened.</p>

        <div className="link-analyzer-form">
          <input
            type="text"
            value={linkInput}
            onChange={(e) => setLinkInput(e.target.value)}
            placeholder="Paste suspicious link here"
          />

          <button onClick={analyzeLink} disabled={linkLoading}>
            {linkLoading ? "ANALYZING..." : "ANALYZE LINK"}
          </button>
        </div>

        {linkResult && (
          <div className="link-analysis-result">
            {linkResult.error ? (
              <p>{linkResult.error}</p>
            ) : (
              <>
                <h3>Risk: {linkResult.risk_level}</h3>
                <p>Risk Score: {linkResult.risk_score}/100</p>
                <ul>
                  {linkResult.indicators.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
                <small>{linkResult.note}</small>
              </>
            )}
          </div>
        )}
      </section>

            <section className="panel">
        <h2>QR CODE ANALYZER</h2>

<button onClick={() => setShowQrOptions(true)}>
  OPEN QR CODE OPTIONS
</button>

{showQrOptions && (
  <div className="qr-popup">
    <h3>Choose QR Code Method</h3>

    <button
      onClick={() => {
        setShowQrOptions(false);
        startScanner();
      }}
    >
      Camera
    </button>

    <button
  onClick={() => {
    setShowQrOptions(false);
    setShowQrUpload(true);
  }}
>
  Upload QR Code
</button>

    <button onClick={() => setShowQrOptions(false)}>
      Cancel
    </button>
  </div>
)}
                

        {scannerMessage && <p>{scannerMessage}</p>}

        <div
          id="qr-reader"
          style={{ width: "100%", maxWidth: "500px", margin: "15px auto" }}
        ></div>
        <p>Upload a QR-code image to extract and check its text. The link will not be opened.</p>

        {showQrUpload && (
  <div className="link-analyzer-form">
    <input type="file" accept="image/*" onChange={handleQrUpload} />
  </div>
)}

        {qrLoading && <p>Reading and analyzing QR code...</p>}

        {qrResult && (
          <div className="link-analysis-result">
            {qrResult.error ? (
              <p>{qrResult.error}</p>
            ) : (
              <>
                <h3>Extracted QR Content</h3>
                <p>{qrResult.extractedText}</p>

                {qrResult.analysis && (
                  <>
                    <h3>Risk: {qrResult.analysis.risk_level}</h3>
                    <p>Risk Score: {qrResult.analysis.risk_score}/100</p>
                    <ul>
                      {qrResult.analysis.indicators.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                    <small>{qrResult.analysis.note}</small>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </section>

      <main className="dashboard">
        <nav className="dashboard-nav" aria-label="Dashboard sections">
  <a href="#overview">Overview</a>
  <a href="#summary">Summary</a>
  <a href="#attack-graph">Attack Graph</a>
  <a href="#threat-intelligence">Threat Intel</a>
  <a href="#incident-investigation">Investigation</a>
  <a href="#attack-timeline">Timeline</a>
  <a href="#response-center">Response</a>
  <a href="#security-events">Events</a>
</nav>
        {/* HERO */}
        <section className="hero" id="overview">
          <div>
            <h2>Security Operations Center</h2>

            <p>
              Monitor security events, analyze potential attack paths,
              and investigate simulated threats.
            </p>
          </div>

          <div className="hero-actions">
  <button onClick={simulateIncident} disabled={loading}>
    {loading ? "SIMULATING..." : "SIMULATE INCIDENT"}
  </button>
</div>
        </section>

        {/* DASHBOARD CARDS */}
          <section className="cards" id="summary">
          <div className="card">
            <span>Total Events</span>
            <strong>{events.length}</strong>
            <small>Security events detected</small>
          </div>

          <div className="card">
            <span>High Risk</span>
            <strong>{highEvents}</strong>
            <small>High-risk events</small>
          </div>

          <div className="card critical">
            <span>Critical</span>
            <strong>{criticalEvents}</strong>
            <small>Critical events</small>
          </div>

          <div className="card">
            <span>Threat Level</span>
            <strong>{analysis?.risk_level || "—"}</strong>
            <small>Current assessment</small>
          </div>

          {/* SECURITY SCORE CARD */}
          <div className="card security-score-card">
            <span>Security Score</span>

            <strong>{securityScore}/100</strong>

            <small>{scoreStatus}</small>

            <div className="score-progress">
              <div
                className="score-progress-fill"
                style={{ width: `${securityScore}%` }}
              ></div>
            </div>

            <small>Demo score based on simulated events</small>
          </div>
        </section>

        {/* ATTACK GRAPH + AI ANALYST */}
          <section className="content-grid" id="attack-graph">
          <div className="panel attack-graph-panel">
            <div className="panel-header">
              <h3>Attack Graph</h3>
              <span>LIVE GRAPH</span>
            </div>

            <AttackGraph />
          </div>

          <div className="panel">
            <div className="panel-header">
              <h3>AI Analyst</h3>
              <span>AI</span>
            </div>

            {analysis ? (
              <>
                <div className="risk-box">
                  <span>RISK SCORE</span>
                  <strong>{analysis.risk_score}</strong>
                  <b>{analysis.risk_level}</b>
                </div>

                <p className="summary">
                  {analysis.threat_summary}
                </p>

                <h4>Observations</h4>

                <ul>
                  {analysis.observations?.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="empty">
                No active threat analysis available.
              </p>
            )}
          </div>
        </section>
{/* THREAT INTELLIGENCE */}
  <section className="panel" id="threat-intelligence">
  <div className="panel-header">
    <h3>Threat Intelligence</h3>
    <span>THREAT ANALYSIS</span>
  </div>

  <ThreatIntel events={events} />
</section>
        {/* INCIDENT INVESTIGATION */}
          <section className="panel" id="incident-investigation">
          <div className="panel-header">
            <h3>Incident Investigation</h3>
            <span>SOC ANALYSIS</span>
          </div>

          <IncidentPanel analysis={analysis} events={events} />
        </section>

        {/* ATTACK PATH TIMELINE */}
          <section className="panel" id="attack-timeline">
          <div className="panel-header">
            <h3>Attack Path Timeline</h3>
            <span>INCIDENT ANALYSIS</span>
          </div>

          <AttackTimeline />
        </section>

        {/* DEFENSIVE RESPONSE CENTER */}
          <section className="panel" id="response-center">
          <div className="panel-header">
            <h3>Defensive Response Center</h3>
            <span>RESPONSE SIMULATOR</span>
          </div>

          <ResponseCenter />
        </section>

        {/* RECENT SECURITY EVENTS */}
  <section className="panel events-panel" id="security-events">
  <div className="panel-header">
    <h3>Recent Security Events</h3>
    <span>{events.length} EVENTS</span>
  </div>

  <input
    type="text"
    placeholder="Search by event type, user, or device..."
    value={eventSearch}
    onChange={(e) => setEventSearch(e.target.value)}
    className="event-search"
  />

  {/* Keep the rest of your existing events panel below this */}

          {events.length === 0 ? (
  <p className="empty">
    No security events detected.
  </p>
) : filteredEvents.length === 0 ? (
  <p className="empty">
    No matching events found.
  </p>
) : (
  <div className="event-list">
    {filteredEvents.map((event, index) => (
                <div className="event-row" key={index}>
                  <div>
                    <b>{event.event_type}</b>

                    <small>
                      {event.user} · {event.device}
                    </small>
                  </div>

                  <span
                    className={`badge ${event.risk_level.toLowerCase()}`}
                  >
                    {event.risk_level}
                  </span>

                  <strong>{event.risk_score}</strong>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;