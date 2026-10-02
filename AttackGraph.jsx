import LocationMap from "./LocationMap";
import { useEffect, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
} from "reactflow";
import "reactflow/dist/style.css";

const API = "http://127.0.0.1:8000";

function AttackGraph() {
  const [showLocationMap, setShowLocationMap] = useState(false);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);

  const loadGraph = async () => {
    try {
      const response = await fetch(`${API}/attack-graph`);
      const data = await response.json();

      const backendNodes = data.graph?.nodes || [];
      const backendEdges = data.graph?.edges || [];

      const graphNodes = backendNodes.map((node, index) => {
        let background = "#172638";
        let border = "#4b8ac4";
        let glow = "rgba(75, 138, 196, 0.18)";

        if (node.type === "Device") {
          background = "#182b25";
          border = "#45a878";
          glow = "rgba(69, 168, 120, 0.18)";
        }

        if (node.type === "Approximate Location") {
          background = "#252044";
          border = "#a78bfa";
          glow = "rgba(167, 139, 250, 0.22)";
    }

        if (node.type === "Security Event") {
          background = "#43361b";
          border = "#e5b94f";
          glow = "rgba(229, 185, 79, 0.18)";
        }

        if (node.risk_level === "CRITICAL") {
          background = "#421d24";
          border = "#ff5964";
          glow = "rgba(255, 89, 100, 0.28)";
        }

        if (node.risk_level === "HIGH") {
          background = "#43361b";
          border = "#e5b94f";
          glow = "rgba(229, 185, 79, 0.22)";
        }

        return {
          id: node.id,
          position: {
            x: 100 + (index % 3) * 280,
            y: 80 + Math.floor(index / 3) * 210,
          },
          data: {
            label: (
              <div className="attack-node-content">
                <strong>{node.label}</strong>

                <span className="attack-node-type">
                  {node.type}
                </span>

                {node.risk_score !== undefined && (
                  <span className="attack-node-risk">
                    Risk: {node.risk_score}
                  </span>
                )}
              </div>
            ),
            originalNode: node,
          },
          style: {
            background,
            border: `1.5px solid ${border}`,
            color: "#e8edf5",
            borderRadius: "12px",
            padding: "16px",
            width: 190,
            minHeight: 90,
            textAlign: "center",
            boxShadow: `0 0 22px ${glow}`,
            fontSize: "12px",
          },
        };
      });

      const graphEdges = backendEdges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.relationship,
        animated: true,
        style: {
          stroke: "#64748b",
          strokeWidth: 2,
        },
        labelStyle: {
          fill: "#cbd5e1",
          fontSize: 11,
          fontWeight: 600,
        },
        labelBgStyle: {
          fill: "#0b1220",
          fillOpacity: 0.95,
        },
        labelBgPadding: [6, 4],
        labelBgBorderRadius: 4,
      }));

      setNodes(graphNodes);
      setEdges(graphEdges);
    } catch (error) {
      console.error("Attack graph loading failed:", error);
    }
  };

  useEffect(() => {
    loadGraph();

    const interval = setInterval(loadGraph, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleNodeClick = (event, node) => {
  const original = node.data.originalNode;

  if (original.type === "Approximate Location") {
    setSelectedNode(null);
    setShowLocationMap(true);
    return;
  }

  setSelectedNode(original);
};

  const getNodeColor = (node) => {
    const original = node.data?.originalNode;

    if (original?.risk_level === "CRITICAL") return "#ff5964";
    if (original?.risk_level === "HIGH") return "#e5b94f";
    if (original?.type === "User") return "#4b8ac4";
    if (original?.type === "Device") return "#45a878";

    return "#64748b";
  };

  return (
    <div className="attack-graph-wrapper">
      {showLocationMap ? (
  <LocationMap onBack={() => setShowLocationMap(false)} />
) : (
  <>
    <div className="attack-graph-toolbar">
        <div>
          <strong>ATTACK RELATIONSHIP MAP</strong>
          <small>Explore connected users, devices and security events</small>
        </div>

        <span className="graph-live-status">
          <span className="graph-live-dot" />
          AUTO REFRESH · 3 SEC
        </span>
      </div>

      <div className="attack-graph-canvas">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          fitViewOptions={{ padding: 0.25 }}
          onNodeClick={handleNodeClick}
          nodesDraggable={true}
          nodesConnectable={false}
          elementsSelectable={true}
          minZoom={0.25}
          maxZoom={1.8}
        >
          <Background
            color="#263449"
            gap={22}
            size={1}
          />

          <Controls
            showInteractive={false}
          />

          <MiniMap
            nodeColor={getNodeColor}
            maskColor="rgba(5, 8, 22, 0.75)"
            style={{
              background: "#111827",
              border: "1px solid #334155",
              borderRadius: "10px",
            }}
          />
        </ReactFlow>
      </div>

      <div className="attack-graph-legend">
        <span><i className="legend-user" /> User</span>
        <span><i className="legend-device" /> Device</span>
        <span><i className="legend-high" /> High Risk</span>
        <span><i className="legend-critical" /> Critical</span>
      </div>

      {selectedNode && (
        <div className="node-investigation">
          <div className="node-investigation-header">
            <div>
              <small>SELECTED GRAPH NODE</small>
              <h4>Node Investigation</h4>
            </div>

            <button
              onClick={() => setSelectedNode(null)}
              className="node-investigation-close"
            >
              ×
            </button>
          </div>

          <div className="node-investigation-grid">
            <div>
              <small>Node</small>
              <strong>{selectedNode.label}</strong>
            </div>

            <div>
              <small>Type</small>
              <strong>{selectedNode.type}</strong>
            </div>

            {selectedNode.user && (
              <div>
                <small>User</small>
                <strong>{selectedNode.user}</strong>
              </div>
            )}

            {selectedNode.device && (
              <div>
                <small>Device</small>
                <strong>{selectedNode.device}</strong>
              </div>
            )}

            {selectedNode.type === "Approximate Location" && (
  <>
    <div>
      <small>Location</small>
      <strong>{selectedNode.location}</strong>
    </div>

    <div>
      <small>Note</small>
      <strong>{selectedNode.note}</strong>
    </div>
  </>
)}

            {selectedNode.risk_score !== undefined && (
              <div>
                <small>Risk Score</small>
                <strong>{selectedNode.risk_score}</strong>
              </div>
            )}

            {selectedNode.risk_level && (
              <div>
                <small>Risk Level</small>
                <strong>{selectedNode.risk_level}</strong>
              </div>
            )}
          </div>
        </div>
           )}
  </>
  )}
    </div>
  );
}

export default AttackGraph;