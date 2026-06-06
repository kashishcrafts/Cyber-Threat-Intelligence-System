import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  ResponsiveContainer,
} from "recharts";

import { useState, useEffect } from "react";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function App() {
  // =========================
  // AUTH
  // =========================

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loggedIn, setLoggedIn] =
    useState(false);

  // =========================
  // THREAT INPUT
  // =========================

  const [threatType, setThreatType] =
    useState("");

  const [source, setSource] =
    useState("");

  // =========================
  // DATA
  // =========================

  const [predictions, setPredictions] =
    useState([]);

  const [predictionResult,
    setPredictionResult] =
    useState("");

  // =========================
  // SEARCH
  // =========================

  const [searchTerm,
    setSearchTerm] =
    useState("");

  // =========================
  // MODAL
  // =========================

  const [selectedThreat,
    setSelectedThreat] =
    useState(null);

  const [showModal,
    setShowModal] =
    useState(false);

  // =========================
  // STATIC DATA
  // =========================

  const threatNews = [
    "New ransomware campaign detected",
    "Critical Microsoft vulnerability reported",
    "Banking malware activity increasing",
    "Zero-day exploit discovered",
  ];

  const mitreCategories = [
    "Initial Access",
    "Execution",
    "Persistence",
    "Privilege Escalation",
    "Defense Evasion",
    "Credential Access",
    "Discovery",
    "Collection",
  ];

  // =========================
  // LOAD USER
  // =========================

  useEffect(() => {
    const token =
      localStorage.getItem("token");

    const savedUser =
      localStorage.getItem("username");

    if (savedUser) {
      setUsername(savedUser);
    }

    if (token) {
      setLoggedIn(true);
      fetchPredictionHistory();
    }
  }, []);

  // =========================
  // AUTO REFRESH
  // =========================

  useEffect(() => {
    const interval =
      setInterval(() => {
        fetchPredictionHistory();
      }, 10000);

    return () =>
      clearInterval(interval);
  }, []);

  // =========================
  // LOGIN
  // =========================

  const handleLogin = async () => {
    try {
      const response =
        await fetch(
          "http://127.0.0.1:8000/auth/login",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              username,
              password,
            }),
          }
        );

      const data =
        await response.json();

      if (data.access_token) {
        localStorage.setItem(
          "token",
          data.access_token
        );

        localStorage.setItem(
          "username",
          username
        );

        setLoggedIn(true);

        fetchPredictionHistory();
      } else {
        alert(
          "Invalid Credentials"
        );
      }
    } catch (error) {
      console.error(error);
      alert("Server Error");
    }
  };

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "username"
    );

    setLoggedIn(false);

    setUsername("");

    setPredictions([]);

    setPredictionResult("");
  };

  // =========================
  // HISTORY
  // =========================

  const fetchPredictionHistory =
    async () => {
      try {
        const response =
          await fetch(
            "http://127.0.0.1:8000/predictions/"
          );

        const data =
          await response.json();

        setPredictions(data);
      } catch (error) {
        console.error(error);
      }
    };

  // =========================
  // PREDICT
  // =========================

  const handlePredict =
    async () => {
      try {
        const response =
          await fetch(
            "http://127.0.0.1:8000/predict/",
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                threat_type:
                  threatType,
                source,
              }),
            }
          );

        const data =
          await response.json();

        setPredictionResult(
          data.predicted_severity
        );

        fetchPredictionHistory();

        setThreatType("");
        setSource("");
      } catch (error) {
        console.error(error);
      }
    };

  // =========================
  // DELETE
  // =========================

  const handleDelete =
    async (id) => {
      try {
        await fetch(
          `http://127.0.0.1:8000/predictions/${id}`,
          {
            method: "DELETE",
          }
        );

        fetchPredictionHistory();
      } catch (error) {
        console.error(error);
      }
    };

  // =========================
  // MODAL
  // =========================

  const openThreatDetails =
    (threat) => {
      setSelectedThreat(threat);
      setShowModal(true);
    };

  // =========================
  // EXPORT PDF
  // =========================

  const exportPDF = () => {
    const doc =
      new jsPDF();

    doc.text(
      "Cyber Threat Report",
      14,
      15
    );

    autoTable(doc, {
      head: [[
        "ID",
        "Threat",
        "Source",
        "Severity",
      ]],
      body: predictions.map(
        (item) => [
          item.id,
          item.threat_type,
          item.source,
          item.predicted_severity,
        ]
      ),
    });

    doc.save(
      "CyberThreatReport.pdf"
    );
  };

  // =========================
  // EXPORT CSV
  // =========================

  const exportCSV = () => {
    const rows =
      predictions.map(
        (item) =>
          `${item.id},${item.threat_type},${item.source},${item.predicted_severity}`
      );

    const csv =
      "ID,Threat Type,Source,Severity\n" +
      rows.join("\n");

    const blob =
      new Blob([csv], {
        type: "text/csv",
      });

    const url =
      window.URL.createObjectURL(
        blob
      );

    const a =
      document.createElement("a");

    a.href = url;

    a.download =
      "CyberThreatReport.csv";

    a.click();
  };

    // =========================
  // DASHBOARD CALCULATIONS
  // =========================

  const totalThreats =
    predictions.length;

  const highCount =
    predictions.filter(
      (p) =>
        p.predicted_severity ===
        "High"
    ).length;

  const mediumCount =
    predictions.filter(
      (p) =>
        p.predicted_severity ===
        "Medium"
    ).length;

  const lowCount =
    predictions.filter(
      (p) =>
        p.predicted_severity ===
        "Low"
    ).length;

  const currentTime =
    new Date().toLocaleString();

  const topThreat =
    predictions.length > 0
      ? predictions[0].threat_type
      : "None";

  // =========================
  // RISK ENGINE
  // =========================

  const riskScore =
    highCount * 20 +
    mediumCount * 10 +
    lowCount * 5;

  let riskLevel = "LOW";
  let riskColor = "#22c55e";

  if (riskScore >= 80) {
    riskLevel = "HIGH";
    riskColor = "#ef4444";
  } else if (
    riskScore >= 40
  ) {
    riskLevel = "MEDIUM";
    riskColor = "#facc15";
  }

  const securityScore =
    Math.max(
      0,
      100 - riskScore
    );

  const alertMessage =
    highCount > 5
      ? "🚨 CRITICAL THREAT ACTIVITY DETECTED"
      : highCount > 0
      ? "⚠ HIGH RISK THREATS PRESENT"
      : "✅ SYSTEM SECURE";

  // =========================
  // SYSTEM HEALTH
  // =========================

  const systemStatus =
    "ONLINE";

  const databaseStatus =
    "CONNECTED";

  const aiEngineStatus =
    "ACTIVE";

  const threatCoverage =
    95;

  const detectionAccuracy =
    98;

  const responseReadiness =
    92;

  const responseStatus =
    responseReadiness > 90
      ? "READY"
      : "IMPROVEMENT NEEDED";

  const trendStatus =
    highCount >
    mediumCount
      ? "Escalating"
      : "Stable";

  // =========================
  // CHART DATA
  // =========================

  const chartData = [
    {
      name: "High",
      value: highCount,
    },
    {
      name: "Medium",
      value: mediumCount,
    },
    {
      name: "Low",
      value: lowCount,
    },
  ];

  const COLORS = [
    "#ef4444",
    "#facc15",
    "#22c55e",
  ];

  const trendData = [
    {
      name: "High",
      count: highCount,
    },
    {
      name: "Medium",
      count: mediumCount,
    },
    {
      name: "Low",
      count: lowCount,
    },
  ];

  // =========================
  // SOURCE ANALYTICS
  // =========================

  const sourceData =
    Object.entries(
      predictions.reduce(
        (acc, item) => {
          acc[item.source] =
            (acc[
              item.source
            ] || 0) + 1;

          return acc;
        },
        {}
      )
    ).map(
      ([source, count]) => ({
        source,
        count,
      })
    );

  const topSources =
    [...sourceData]
      .sort(
        (a, b) =>
          b.count -
          a.count
      )
      .slice(0, 5);

  // =========================
  // THREAT TYPE ANALYTICS
  // =========================

  const threatCounts =
    {};

  predictions.forEach(
    (item) => {
      threatCounts[
        item.threat_type
      ] =
        (threatCounts[
          item.threat_type
        ] || 0) + 1;
    }
  );

  const barData =
    Object.entries(
      threatCounts
    ).map(
      ([name, count]) => ({
        name,
        count,
      })
    );

  // =========================
  // SEARCH
  // =========================

  const filteredPredictions =
    predictions.filter(
      (item) =>
        item.threat_type
          ?.toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          )
    );

  // =========================
  // LIVE FEED
  // =========================

  const recentThreats =
    predictions
      .slice()
      .reverse()
      .slice(0, 5);

  const recentPredictions =
    predictions.slice(0, 5);

  // =========================
  // VERSION 8+
  // FUTURE MODULES
  // =========================

  const futureModules = [
    "CVE Feed Integration",
    "VirusTotal Integration",
    "MITRE ATT&CK Mapping",
    "Threat Recommendation Engine",
    "Explainable AI Module",
    "PostgreSQL Migration",
    "Docker Deployment",
    "Role Based Access Control",
  ];

    // =========================
  // DASHBOARD UI
  // =========================

  if (loggedIn) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0f172a",
          color: "white",
          padding: "30px",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            color: "#00d4ff",
            fontSize: "52px",
            fontWeight: "bold",
            textShadow:
              "0 0 20px #00d4ff",
          }}
        >
          🛡️ AI Cyber Threat Intelligence Platform
        </h1>

        <div
          style={{
            background:
              highCount > 5
                ? "#7f1d1d"
                : highCount > 0
                ? "#78350f"
                : "#14532d",
            padding: "15px",
            borderRadius: "10px",
            marginBottom: "20px",
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "18px",
          }}
        >
          {alertMessage}
        </div>

        <p
          style={{
            textAlign: "center",
            color: "#94a3b8",
          }}
        >
          Last Updated:
          {" "}
          {currentTime}
        </p>

        <div
          style={{
            textAlign: "center",
            marginBottom: "25px",
            color: "#22c55e",
            fontWeight: "bold",
          }}
        >
          🟢 Live Monitoring Active
        </div>

        {/* RISK SCORE */}

        <div
          style={{
            background: "#1e293b",
            padding: "25px",
            borderRadius: "12px",
            marginBottom: "25px",
            textAlign: "center",
            border:
              `2px solid ${riskColor}`,
          }}
        >
          <h2>
            🤖 AI Risk Score
          </h2>

          <h1
            style={{
              color: riskColor,
              fontSize: "50px",
            }}
          >
            {riskScore}
          </h1>

          <h2
            style={{
              color: riskColor,
            }}
          >
            {riskLevel} RISK
          </h2>

          <h3>
            Security Score:
            {" "}
            {securityScore}/100
          </h3>
        </div>

        {/* KPI CARDS */}

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "20px",
            marginBottom: "25px",
          }}
        >
          {[
            {
              title:
                "Total Threats",
              value:
                totalThreats,
            },
            {
              title:
                "High Threats",
              value:
                highCount,
            },
            {
              title:
                "Medium Threats",
              value:
                mediumCount,
            },
            {
              title:
                "Low Threats",
              value:
                lowCount,
            },
          ].map(
            (
              card,
              index
            ) => (
              <div
                key={index}
                style={{
                  background:"#1e293b",
                  padding:
                    "20px",
                  borderRadius:
                    "10px",
                  minWidth:
                    "220px",
                  flex: 1,
                }}
              >
                <h3>
                  {card.title}
                </h3>

                <h1>
                  {card.value}
                </h1>
              </div>
            )
          )}
        </div>

        
          <button
  onClick={handleLogout}
  style={{
    background:"#ef4444",
    border:"none",
    color:"white",
    padding:"12px 20px",
    borderRadius:"8px",
    cursor:"pointer",
    marginBottom:"20px",
  }}
>
  Logout
</button>

        {/* PREDICTION */}

        <div
          style={{
            background: "#1e293b",
            padding: "20px",
            borderRadius: "10px",
            marginBottom:"20px",
          }}
        >
          <h2>
            Threat Prediction
          </h2>

          <input
            type="text"
            placeholder="Threat Type"
            value={threatType}
            onChange={(e) =>
              setThreatType(
                e.target.value
              )
            }
            style={{
              width:
                "250px",
              padding:
                "10px",
              marginRight:
                "10px",
            }}
          />

          <input
            type="text"
            placeholder="Source"
            value={source}
            onChange={(e) =>
              setSource(
                e.target.value
              )
            }
            style={{
              width:
                "250px",
              padding:
                "10px",
              marginRight:
                "10px",
            }}
          />

          <button
            onClick={
              handlePredict
            }
          >
            Predict
          </button>

          {predictionResult && (
            <h3
              style={{
                marginTop:
                  "15px",
              }}
            >
              Severity:
              {" "}
              {
                predictionResult
              }
            </h3>
          )}
        </div>

        {/* EXECUTIVE SUMMARY */}

        <div
          style={{
            background: "#1e293b",
            padding: "20px",
            borderRadius: "10px",
            marginBottom:"20px",
          }}
        >
          <h3>
            Executive Summary
          </h3>

          <p>
            Total Threats:
            {" "}
            {
              totalThreats
            }
          </p>

          <p>
            Top Threat:
            {" "}
            {
              topThreat
            }
          </p>

          <p>
            Threat Trend:
            {" "}
            {
              trendStatus
            }
          </p>

          <p>
            Security Score:
            {" "}
            {
              securityScore
            }
            /100
          </p>
        </div>

        {/* SYSTEM HEALTH */}

        <div
          style={{
            background: "#1e293b",
            padding: "20px",
            borderRadius: "10px",
            marginBottom:"20px",
          }}
        >
          <h3>
            System Health Monitor
          </h3>

          <p>
            🟢 System:
            {" "}
            {
              systemStatus
            }
          </p>

          <p>
            🟢 Database:
            {" "}
            {
              databaseStatus
            }
          </p>

          <p>
            🟢 AI Engine:
            {" "}
            {
              aiEngineStatus
            }
          </p>

          <p>
            Incident Response:
            {" "}
            {
              responseStatus
            }
          </p>
        </div>

        {/* THREAT METRICS */}

        <div
          style={{
            background: "#1e293b",
            padding: "20px",
            borderRadius: "10px",
            marginBottom:"20px",
          }}
        >
          <h3>
            Threat Intelligence Metrics
          </h3>

          <p>
            Coverage:
            {" "}
            {
              threatCoverage
            }
            %
          </p>

          <p>
            Detection:
            {" "}
            {
              detectionAccuracy
            }
            %
          </p>

          <p>
            Readiness:
            {" "}
            {
              responseReadiness
            }
            %
          </p>
        </div>

              {/* MITRE ATT&CK */}

        <div
          style={{
            background: "#1e293b",
            padding: "20px",
            borderRadius: "10px",
            marginBottom: "20px",
          }}
        >
          <h3>
            MITRE ATT&CK Categories
          </h3>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            {mitreCategories.map(
              (
                category,
                index
              ) => (
                <span
                  key={index}
                  style={{
                    background:"#0f172a",
                    border:
                      "1px solid #00d4ff",
                    color:
                      "#00d4ff",
                    fontWeight:
                      "bold",
                    padding:
                      "10px 15px",
                    borderRadius:
                      "8px",
                  }}
                >
                  {category}
                </span>
              )
            )}
          </div>
        </div>

        {/* SOC COMMAND CENTER */}

        <div
          style={{
            background: "#1e293b",
            padding: "20px",
            borderRadius: "10px",
            marginBottom: "20px",
          }}
        >
          <h3>
            🛡 SOC Command Center
          </h3>

          <p>
            🚨 Active Alerts:
            {" "}
            {highCount}
          </p>

          <p>
            👀 Monitoring:
            Active
          </p>

          <p>
            ⚡ Threat Level:
            {" "}
            {riskLevel}
          </p>

          <p>
            📋 Incident Queue:
            {" "}
            {totalThreats}
          </p>
        </div>

        {/* GLOBAL MONITOR */}

        <div
          style={{
            background: "#1e293b",
            padding: "20px",
            borderRadius: "10px",
            textAlign:
              "center",
            marginBottom:"20px",
          }}
        >
          <h3>
            Global Threat Monitor
          </h3>

          <h1>🌍</h1>

          <p>
            Monitoring Global
            Threat Activity
          </p>
        </div>

        {/* PIE CHART */}

        <div
          style={{
            background: "#1e293b",
            padding: "20px",
            borderRadius: "10px",
            marginBottom:"20px",
          }}
        >
          <h2>
            Threat Analytics
          </h2>

          <PieChart
            width={400}
            height={320}
          >
            <Pie
              data={chartData}
              dataKey="value"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {chartData.map(
                (
                  entry,
                  index
                ) => (
                  <Cell
                    key={index}
                    fill={
                      COLORS[
                        index
                      ]
                    }
                  />
                )
              )}
            </Pie>

            <Tooltip />
            <Legend />
          </PieChart>
        </div>

        {/* LINE CHART */}

        <div
          style={{
            background: "#1e293b",
            padding: "20px",
            borderRadius: "10px",
            marginBottom:"20px",
          }}
        >
          <h3>
            Threat Trend
            Analysis
          </h3>

          <ResponsiveContainer
            width="100%"
            height={320}
          >
            <LineChart
              data={trendData}
            >
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis
                dataKey="name"
              />

              <YAxis />

              <Tooltip />

              <Line
                type="monotone"
                dataKey="count"
                stroke="#00d4ff"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* BAR CHART */}

        <div
          style={{
            background: "#1e293b",
            padding: "20px",
            borderRadius: "10px",
            marginBottom:
              "20px",
          }}
        >
          <h3>
            Threat Sources
          </h3>

          <ResponsiveContainer
            width="100%"
            height={320}
          >
            <BarChart
              data={sourceData}
            >
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis
                dataKey="source"
              />

              <YAxis />

              <Tooltip />

              <Bar
                dataKey="count"
                fill="#22c55e"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* HEATMAP */}

        <div
          style={{
            background: "#1e293b",
            padding: "20px",
            borderRadius: "10px",
            marginBottom:"20px",
          }}
        >
          <h3>
            Threat Severity
            Heatmap
          </h3>

          <div
            style={{
              display:
                "flex",
              gap: "20px",
              flexWrap:
                "wrap",
            }}
          >
            <div
              style={{
                flex: 1,
                minWidth:
                  "200px",
                background:"#7f1d1d",
                padding:
                  "20px",
                borderRadius:
                  "10px",
                textAlign:
                  "center",
              }}
            >
              <h2>
                🔴 High
              </h2>

              <h1>
                {highCount}
              </h1>
            </div>

            <div
              style={{
                flex: 1,
                minWidth:
                  "200px",
                background:"#78350f",
                padding:
                  "20px",
                borderRadius:
                  "10px",
                textAlign:
                  "center",
              }}
            >
              <h2>
                🟡 Medium
              </h2>

              <h1>
                {
                  mediumCount
                }
              </h1>
            </div>

            <div
              style={{
                flex: 1,
                minWidth:
                  "200px",
                background:
                  "#14532d",
                padding:
                  "20px",
                borderRadius:
                  "10px",
                textAlign:
                  "center",
              }}
            >
              <h2>
                🟢 Low
              </h2>

              <h1>
                {lowCount}
              </h1>
            </div>
          </div>
        </div>

        {/* LIVE FEED */}

        <div
          style={{
            background: "#1e293b",
            padding: "20px",
            borderRadius: "10px",
            marginBottom:"20px",
          }}
        >
          <h3>
            🚨 Live Threat Feed
          </h3>

          {recentThreats.map(
            (item) => (
              <div
                key={item.id}
                style={{
                  background:"#334155",
                  padding:"10px",
                  marginBottom:"10px",
                  borderRadius:"8px",
                }}
              >
                <strong>
                  {
                    item.threat_type
                  }
                </strong>

                {" | "}

                {item.source}

                {" | "}

                {
                  item.predicted_severity
                }
              </div>
            )
          )}
        </div>

                {/* TOP SOURCES */}

        <div
          style={{
            background: "#1e293b",
            padding: "20px",
            borderRadius: "10px",
            marginBottom: "20px",
          }}
        >
          <h3>
            Top Threat Sources
          </h3>

          {topSources.map(
            (item, index) => (
              <p key={index}>
                {item.source}
                {" : "}
                {item.count}
              </p>
            )
          )}
        </div>

        {/* FUTURE MODULES */}

        <div
          style={{
            background: "#1e293b",
            padding: "20px",
            borderRadius: "10px",
            marginBottom: "20px",
          }}
        >
          <h3>
             Planned Security Enhancements
          </h3>

          {futureModules.map(
            (
              module,
              index
            ) => (
              <p key={index}>
                ✅ {module}
              </p>
            )
          )}
        </div>

        {/* SEARCH */}

        <input
          type="text"
          placeholder="Search Threat Type..."
          value={searchTerm}
          onChange={(e) =>
            setSearchTerm(
              e.target.value
            )
          }
          style={{
            width: "300px",
            padding: "10px",
            marginBottom:"20px",
            borderRadius:"8px",
          }}
        />

        {/* EXPORTS */}

        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom:"20px",
          }}
        >
          <button
            onClick={
              exportPDF
            }
          >
            Export PDF
          </button>

          <button
            onClick={
              exportCSV
            }
          >
            Export CSV
          </button>
        </div>

        {/* HISTORY */}

        <h2>
          Prediction History
        </h2>

        <table
          style={{
            width: "100%",
            borderCollapse:
              "collapse",
            background:
              "white",
            color: "black",
          }}
        >
          <thead>
            <tr>
              <th>ID</th>
              <th>
                Threat Type
              </th>
              <th>
                Source
              </th>
              <th>
                Severity
              </th>
              <th>
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredPredictions.map(
              (item) => (
                <tr
                  key={item.id}
                  onClick={() =>
                    openThreatDetails(
                      item
                    )
                  }
                  style={{
                    cursor:
                      "pointer",
                  }}
                >
                  <td>
                    {item.id}
                  </td>

                  <td>
                    {
                      item.threat_type
                    }
                  </td>

                  <td>
                    {
                      item.source
                    }
                  </td>

                  <td>
                    <span
                      style={{
                        background:
                          item.predicted_severity ===
                          "High"
                            ? "#dc2626"
                            : item.predicted_severity ===
                              "Medium"
                            ? "#ca8a04"
                            : "#16a34a",

                        color:
                          "white",

                        padding:
                          "6px 10px",

                        borderRadius:
                          "8px",
                      }}
                    >
                      {
                        item.predicted_severity
                      }
                    </span>
                  </td>

                  <td>
                    <button
                      onClick={(
                        e
                      ) => {
                        e.stopPropagation();

                        handleDelete(
                          item.id
                        );
                      }}
                      style={{
                        background:
                          "#ef4444",
                        color:
                          "white",
                        border:
                          "none",
                        padding:
                          "6px 10px",
                        borderRadius:
                          "6px",
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>

        {/* MODAL */}

        {showModal &&
          selectedThreat && (
            <div
              onClick={() =>
                setShowModal(
                  false
                )
              }
              style={{
                position:
                  "fixed",
                top: 0,
                left: 0,
                width:
                  "100%",
                height:
                  "100%",
                background:
                  "rgba(0,0,0,0.7)",

                display:
                  "flex",

                justifyContent:
                  "center",

                alignItems:
                  "center",
              }}
            >
              <div
                onClick={(
                  e
                ) =>
                  e.stopPropagation()
                }
                style={{
                  background:"#1e293b",
                  color:"white",
                  padding:"30px",
                  borderRadius:"12px",
                  width:"500px",
                }}
              >
                <h2>
                  Threat Details
                </h2>

                <p>
                  <strong>
                    ID:
                  </strong>{" "}
                  {
                    selectedThreat.id
                  }
                </p>

                <p>
                  <strong>
                    Threat:
                  </strong>{" "}
                  {
                    selectedThreat.threat_type
                  }
                </p>

                <p>
                  <strong>
                    Source:
                  </strong>{" "}
                  {
                    selectedThreat.source
                  }
                </p>

                <p>
                  <strong>
                    Severity:
                  </strong>{" "}
                  {
                    selectedThreat.predicted_severity
                  }
                </p>

                <button
                  onClick={() =>
                    setShowModal(
                      false
                    )
                  }
                >
                  Close
                </button>
              </div>
            </div>
          )}

      </div>
    );
  }

  return (
    <div
      style={{
        minHeight:"100vh",
        display:"flex",
        justifyContent:"center",
        alignItems:"center",
        background:"linear-gradient(to right,#001f3f,#000814)",
      }}
    >
      <div
        style={{
          width:"400px",
          padding:"30px",
          background:"white",
          borderRadius:"15px",
        }}
      >
        <h1
          style={{
            textAlign:"center",
            marginBottom:"20px",
          }}
        >
          Cyber Threat
          Intelligence
        </h1>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) =>
            setUsername(
              e.target.value
            )
          }
          style={{
            width:"100%",
            padding:"12px",
            marginBottom:"10px",
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(
              e.target.value
            )
          }
          style={{
            width:"100%",
            padding:"12px",
            marginBottom: "15px",
          }}
        />

        <button
          onClick={
            handleLogin
          }
          style={{
            width:"100%",
            padding:"12px",
            background:"#00d4ff",
            border:"none",
          }}
        >
          LOGIN
        </button>
      </div>
    </div>
  );
}

export default App;