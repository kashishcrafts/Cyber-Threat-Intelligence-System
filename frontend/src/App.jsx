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
BarChart,
Bar

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  const [threatType, setThreatType] = useState("");
  const [source, setSource] = useState("");

  const [predictions, setPredictions] =
    useState([]);

  const recentPredictions =
  predictions.slice(0, 5);

  const [predictionResult, setPredictionResult] =
    useState("");
    const [selectedThreat, setSelectedThreat] =
  useState(null);

const [showModal, setShowModal] =
  useState(false);

  const [searchTerm, setSearchTerm] =
  useState("");
  const threatCounts = {};

predictions.forEach((item) => {
  threatCounts[item.threat_type] =
    (threatCounts[item.threat_type] || 0) + 1;
});

const barData =
  Object.entries(threatCounts).map(
    ([name, count]) => ({
      name,
      count,
    })
  );
  
  useEffect(() => {
    const token =
      localStorage.getItem("token");

      const savedUsername =
  localStorage.getItem("username");

if (savedUsername) {
  setUsername(savedUsername);
}

    if (token) {
      setLoggedIn(true);
      fetchPredictionHistory();
    }
  }, []);

  useEffect(() => {
  const interval = setInterval(() => {
    fetchPredictionHistory();
  }, 10000);

  return () =>
    clearInterval(interval);
}, []);

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

  setUsername(username);

  setLoggedIn(true);

  fetchPredictionHistory();
}
      
      else {
        alert(
          data.message ||
            "Login Failed"
        );
      }
    } catch (error) {
      console.error(error);
      alert("SERVER ERROR");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
     localStorage.removeItem("username");

    setLoggedIn(false);
    setUsername("");

    setPredictionResult("");
    setPredictions([]);
  };

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

  const handlePredict = async () => {
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
              source:
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
      alert(
        "Prediction Failed"
      );
    }
  };

  const handleDelete =
  async (id) => {
    try {
      await fetch(
        `http://127.0.0.1:8000/predictions/${id}`,
        {
          method:
            "DELETE",
        }
      );

      fetchPredictionHistory();
    } catch (error) {
      console.error(error);
    }
  };

  const openThreatDetails = (
  threat
) => {
  setSelectedThreat(threat);
  setShowModal(true);
};

 const exportPDF = () => {
  const doc = new jsPDF();

  doc.text(
    "Cyber Threat Report",
    14,
    15
  );

  autoTable(doc, {
    head: [
      [
        "ID",
        "Threat Type",
        "Source",
        "Severity",
      ],
    ],
    body: predictions.map((item) => [
      item.id,
      item.threat_type,
      item.source,
      item.predicted_severity,
    ]),
  });

  doc.save(
    "CyberThreatReport.pdf"
  );
}; 

const exportCSV = () => {
  const rows = predictions.map(
    (item) =>
      `${item.id},${item.threat_type},${item.source},${item.predicted_severity}`
  );

  const csv =
    "ID,Threat Type,Source,Severity\n" +
    rows.join("\n");

  const blob = new Blob([csv], {
    type: "text/csv",
  });

  const url =
    window.URL.createObjectURL(blob);

  const a =
    document.createElement("a");

  a.href = url;
  a.download =
    "CyberThreatReport.csv";

  a.click();
};

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

const topThreat =
  predictions.length > 0 
    ? predictions[0].threat_type
    : "None"; 
    const currentTime =
  new Date().toLocaleString();

const riskScore =
  highCount * 20 +
  mediumCount * 10 +
  lowCount * 5;

let riskLevel = "LOW";
let riskColor = "#22c55e";

if (riskScore >= 80) {
  riskLevel = "HIGH";
  riskColor = "#ef4444";
} else if (riskScore >= 40) {
  riskLevel = "MEDIUM";
  riskColor = "#facc15";
}

const sourceData = Object.entries(
  predictions.reduce((acc, item) => {
    acc[item.source] =
      (acc[item.source] || 0) + 1;
    return acc;
  }, {})
).map(([source, count]) => ({
  source,
  count,
}));

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

const COLORS = [
  "#ef4444",
  "#facc15",
  "#22c55e",
];

const filteredPredictions =
  predictions.filter((item) =>
    item.threat_type
      ?.toLowerCase()
      .includes(
        searchTerm.toLowerCase()
      )
  );

  const recentThreats =
  predictions
    .slice()
    .reverse()
    .slice(0, 5);

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
    marginBottom: "30px",
    textShadow: "0 0 20px #00d4ff",
  }}
>
  🛡️ AI Cyber Threat Intelligence Platform
</h1>
<p
  style={{
    color: "#94a3b8",
    textAlign: "center",
    marginBottom: "20px",
  }}
>
  Last Updated:
  {" "}
  {currentTime}
</p>
<div
  style={{
    color: "#22c55e",
    fontWeight: "bold",
    fontSize: "18px",
    textAlign: "center",
    marginBottom: "20px",
  }}
>
  🟢 Live Monitoring Active
</div>

<div
  style={{
    background: "#1e293b",
    padding: "25px",
    borderRadius: "12px",
    marginBottom: "25px",
    textAlign: "center",
    border: `2px solid ${riskColor}`,
  }}
>
  <h2>🤖 AI Risk Score</h2>

  <h1
    style={{
      color: riskColor,
      fontSize: "48px",
      margin: "10px 0",
    }}
  >
    {riskScore}
  </h1>

  <h2
    style={{
      color: riskColor,
    }}
  >
    <div
  style={{
    background: "#1e293b",
    padding: "25px",
    borderRadius: "12px",
    marginBottom: "25px",
    textAlign: "center",
    border: `2px solid ${riskColor}`,
  }}
>
  <h2>🤖 AI Risk Score</h2>

  <h1
    style={{
      color: riskColor,
      fontSize: "48px",
      margin: "10px 0",
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
</div>
  </h2>
</div>

      <div
        style={{
          display: "flex",
          gap: "20px",
          flexWrap: "wrap",
          marginBottom: "20px",
          fontSize: "32px",
          fontWeight: "bold",
        }}
      >
        <div
          style={{
            background: "#1e293b",
            padding: "20px",
            borderRadius: "10px",
            minWidth: "220px",
          }}
        >
          <h3>Total Threats</h3>
          <h1>{totalThreats}+</h1>
        </div>

        <div
          style={{
            background: "#1e293b",
            padding: "20px",
            borderRadius: "10px",
            minWidth: "220px",
          }}
        >
          <h3>User</h3>
          <h2>{username}</h2>
        </div>

        <div
          style={{
            background: "#1e293b",
            padding: "20px",
            borderRadius: "10px",
            minWidth: "220px",
          }}
        >
          <h3>🔴 High</h3>
          <h1>{highCount}+</h1>
        </div>

        <div
          style={{
            background: "#1e293b",
            padding: "20px",
            borderRadius: "10px",
            minWidth: "220px",
          }}
        >
          <h3>🟡 Medium</h3>
          <h1>{mediumCount}+</h1>
        </div>

        <div
          style={{
            background: "#1e293b",
            padding: "20px",
            borderRadius: "10px",
            minWidth: "220px",
          }}
        >
          <h3>🟢 Low</h3>
          <h1>{lowCount}+</h1>
        </div>
      </div>

      <button
        onClick={handleLogout}
        style={{
          background: "#ef4444",
          color: "white",
          border: "none",
          padding: "12px 20px",
          borderRadius: "8px",
          cursor: "pointer",
          marginBottom: "25px",
        }}
      >
        Logout
      </button>

      <div
        style={{
          background: "#1e293b",
          padding: "20px",
          borderRadius: "10px",
          marginBottom: "20px",
        }}
      >
        <h2>Threat Prediction</h2>

        <input
          type="text"
          placeholder="Threat Type (Malware, DDoS, Brute Force)"
          value={threatType}
          onChange={(e) =>
            setThreatType(e.target.value)
          }
          style={{
            width: "250px",
            padding: "10px",
            marginRight: "10px",
            marginTop: "10px",
            color: "white",
            background: "#0f172a",
            border: "1px solid #334155",
            borderRadius: "8px",
          }}
        />

        <input
          type="text"
          placeholder="Source (IDS, Firewall, WAF)"
          value={source}
          onChange={(e) =>
            setSource(e.target.value)
          }
          style={{
            width: "250px",
            padding: "10px",
            marginRight: "10px",
            marginTop: "10px",
            color: "white",
            background: "#0f172a",
            border: "1px solid #334155",
            borderRadius: "8px",
          }}
        />

        <button
          onClick={handlePredict}
          style={{
            padding: "10px 20px",
            background: "#00d4ff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Predict
        </button>

        {predictionResult && (
          <div
            style={{
              marginTop: "20px",
              padding: "15px",
              background: "#0f172a",
              borderRadius: "10px",
              border: "1px solid #00d4ff",
            }}
          >
            <h3>
              Predicted Severity:{" "}
              {predictionResult}
            </h3>
          </div>
        )}
      </div>

      <input
  type="text"
  placeholder="Search Threat Type"
  value={searchTerm}
  onChange={(e) =>
    setSearchTerm(
      e.target.value
    )
  }
  style={{
    width: "300px",
    padding: "10px",
    fontSize: "16px",
    marginBottom: "15px",
    borderRadius: "8px",
  }}
/>

      <div
        style={{
          background: "#1e293b",
          padding: "20px",
          borderRadius: "10px",
        }}
      >
        <div
  style={{
    background: "#1e293b",
    padding: "20px",
    borderRadius: "10px",
    marginTop: "20px",
    marginBottom: "20px",
  }}
>
  <h2>Threat Analytics</h2>

    <div
  style={{
    background: "#7f1d1d",
    padding: "20px",
    borderRadius: "10px",
    marginBottom: "20px",
  }}
>
  <h3>⚠ Most Recent Threat</h3>

  <h2>{topThreat}</h2>
</div>

  <PieChart width={400} height={350}>
    <Pie
      data={chartData}
      cx="50%"
      cy="50%"
      outerRadius={100}
      dataKey="value"
      label
    >
      {chartData.map(
        (entry, index) => (
          <Cell
            key={index}
            fill={
              COLORS[index]
            }
          />
        )
      )}
    </Pie>

    <Tooltip />
    <Legend />
  </PieChart>
</div>
<div
  style={{
    display: "flex",
    gap: "30px",
    alignItems: "center",
    marginTop: "20px",
  }}
></div>
<div
  style={{
    marginTop: "40px",
  }}
>
  <h3>Threat Trend Analysis</h3>

  <ResponsiveContainer
    width="100%"
    height={350}
  >
    <LineChart data={trendData}>
      <CartesianGrid strokeDasharray="3 3" />

      <XAxis dataKey="name" />

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

<div
  style={{
    display: "flex",
    gap: "30px",
    alignItems: "center",
    marginTop: "20px",
  }}
>

</div>
<div
  style={{
    background: "#1e293b",
    padding: "20px",
    borderRadius: "10px",
    marginTop: "20px",
    marginBottom: "20px",
  }}
>
  <h3>Recent Activity</h3>

  <div
  style={{
    background: "#1e293b",
    padding: "20px",
    borderRadius: "10px",
    marginTop: "20px",
    maxHeight: "300px",
    overflowY: "auto",
  }}
>
  <h3>🚨 Live Threat Feed</h3>

  {recentThreats.map((item) => (
    <div
      key={item.id}
      style={{
        background: "#334155",
        padding: "12px",
        marginBottom: "10px",
        borderRadius: "8px",
        borderLeft:
          item.predicted_severity === "High"
            ? "5px solid #ef4444"
            : item.predicted_severity === "Medium"
            ? "5px solid #facc15"
            : "5px solid #22c55e",
      }}
    >
      <strong>{item.threat_type}</strong>
      {" | "}
      {item.source}
      {" | "}
      {item.predicted_severity}
    </div>
  ))}
</div>

  <p>
    Total Predictions: {totalThreats}
  </p>

  <p>
    High Threats: {highCount}
  </p>

  <p>
    Medium Threats: {mediumCount}
  </p>

  <p>
    Low Threats: {lowCount}
  </p>
  <h3>
  Latest Threats
  (
  {recentPredictions.length}
  )
</h3>

{recentPredictions.map((item) => (
  <div
    key={item.id}
    style={{
      background: "#334155",
      padding: "10px",
      marginBottom: "10px",
      borderRadius: "8px",
    }}
  >
    {item.threat_type}
    {" - "}
    {item.predicted_severity}
  </div>
))}
</div>

<h3>Top Threat Types</h3>

<div
  style={{
    background: "#1e293b",
    padding: "20px",
    borderRadius: "10px",
    marginTop: "20px",
  }}
>
  <h3>Threat Sources</h3>

  <ResponsiveContainer
    width="100%"
    height={300}
  >
    <BarChart data={sourceData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="source" />
      <YAxis />
      <Tooltip />
      <Bar
        dataKey="count"
        fill="#22c55e"
      />
    </BarChart>
  </ResponsiveContainer>
</div>

<ResponsiveContainer
  width="100%"
  height={350}
>
  <BarChart data={barData}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="name" />
    <YAxis />
    <Tooltip />

    <Bar
      dataKey="count"
      fill="#00d4ff"
    />
  </BarChart>
</ResponsiveContainer>

<div
  style={{
    background: "#1e293b",
    padding: "20px",
    borderRadius: "10px",
    marginBottom: "20px",
  }}
>
  <h3>Threat Risk Level</h3>

  <progress
    value={highCount}
    max={totalThreats || 1}
    style={{
      width: "100%",
      height: "25px",
    }}
  />

  <p>
    Risk Score:
    {" "}
    {Math.round(
      (highCount /
        (totalThreats || 1)) *
        100
    )}
    %
  </p>
</div>
<div
  style={{
    background: "#1e293b",
    padding: "20px",
    borderRadius: "10px",
    marginBottom: "20px",
  }}
>
  <h3>Threat Distribution</h3>

  <p>🔴 High: {highCount}</p>
  <p>🟡 Medium: {mediumCount}</p>
  <p>🟢 Low: {lowCount}</p>
</div>
<div
  style={{
    background: "#1e293b",
    padding: "20px",
    borderRadius: "10px",
    marginTop: "20px",
    marginBottom: "20px",
  }}
>
  <h3>AI Threat Summary</h3>

  <p>
    Total threats detected:
    {" "}
    {totalThreats}
  </p>

  <p>
    High severity threats:
    {" "}
    {highCount}
  </p>

  <p>
    Current system risk:
    {" "}
    {highCount > 3
      ? "Critical"
      : "Moderate"}
  </p>
</div>

<h2>Prediction History</h2>

{predictions.length === 0 && (
  <div
    style={{
      background: "#1e293b",
      padding: "20px",
      borderRadius: "10px",
      marginBottom: "20px",
    }}
  >
    No Threats Found
  </div>
)}

        <input
  type="text"
  placeholder="Search Threat Type..."
  value={searchTerm}
  onChange={(e) =>
    setSearchTerm(e.target.value)
  }
  style={{
    width: "300px",
    padding: "10px",
    marginBottom: "15px",
    borderRadius: "8px",
  }}
/>
 <div
  style={{
    display: "flex",
    gap: "10px",
    marginBottom: "15px",
  }}
>
  <button
    onClick={exportPDF}
    style={{
      background: "#22c55e",
      color: "white",
      border: "none",
      padding: "10px 20px",
      borderRadius: "8px",
      cursor: "pointer",
    }}
  >
    Export PDF
  </button>

  <button
    onClick={exportCSV}
    style={{
      background: "#3b82f6",
      color: "white",
      border: "none",
      padding: "10px 20px",
      borderRadius: "8px",
      cursor: "pointer",
    }}
  >
    Export CSV
  </button>
</div> 

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "white",
            color: "black",
          }}
        >
          <thead>
            <tr>
              <th>ID</th>
              <th>Threat Type</th>
              <th>Source</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {predictions.map((item) => (
              <tr
  key={item.id}
  onClick={() =>
    openThreatDetails(item)
  }
  style={{
    cursor: "pointer",
  }}
>
                <td>{item.id}</td>
                <td>{item.threat_type}</td>
                <td>{item.source}</td>
                <td>
  <span
    style={{
      padding: "8px 14px",
      borderRadius: "999px",
      color: "white",
      fontWeight: "bold",
      fontSize: "14px",
      boxShadow: "0 0 10px rgba(255,255,255,0.2)",
      background:
        item.predicted_severity === "High"
          ? "#dc2626"
          : item.predicted_severity === "Medium"
          ? "#ca8a04"
          : "#16a34a",
    }}
  >
    <td>
  <span
    style={{
      padding: "5px 10px",
      borderRadius: "6px",
      background:
        item.predicted_severity === "High"
          ? "#dc2626"
          : item.predicted_severity === "Medium"
          ? "#f59e0b"
          : "#16a34a",
      color: "white",
      fontWeight: "bold",
    }}
  >
    {item.predicted_severity}
  </span>
</td>
  </span>
</td>
                <td>
  <button
    onClick={() =>
      handleDelete(
        item.id
      )
    }
    
    style={{
      background:
        "#ef4444",
      color: "white",
      border: "none",
      padding:
        "5px 10px",
      borderRadius:
        "5px",
      cursor: "pointer",
    }}
  >
    Delete
  </button>
</td>
              </tr>
            ))}
          </tbody>
        </table>
        {showModal &&
  selectedThreat && (
    <div
      onClick={() =>
        setShowModal(false)
      }
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background:
          "rgba(0,0,0,0.7)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        onClick={(e) =>
          e.stopPropagation()
        }
        style={{
          background: "#1e293b",
          padding: "30px",
          borderRadius: "12px",
          width: "500px",
          color: "white",
        }}
      >
        <h2>Threat Details</h2>

        <p>
          <strong>ID:</strong>{" "}
          {selectedThreat.id}
        </p>

        <p>
          <strong>Threat Type:</strong>{" "}
          {selectedThreat.threat_type}
        </p>

        <p>
          <strong>Source:</strong>{" "}
          {selectedThreat.source}
        </p>

        <p>
          <strong>Severity:</strong>{" "}
          {selectedThreat.predicted_severity}
        </p>

        <button
          onClick={() =>
            setShowModal(false)
          }
        >
          Close
        </button>
      </div>
    </div>
)}
      </div>
    </div>
  );
}

return (
  <div
    style={{
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background:
        "linear-gradient(to right,#001f3f,#000814)",
    }}
  >
    <div
      style={{
        width: "400px",
        padding: "30px",
        background: "white",
        borderRadius: "15px",
        boxShadow:
          "0 0 20px rgba(0,0,0,0.3)",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          marginBottom: "20px",
        }}
      >
        Cyber Threat Intelligence
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
          width: "100%",
          padding: "12px",
          marginBottom: "10px",
          border:
            "1px solid #ccc",
          borderRadius: "8px",
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
          width: "100%",
          padding: "12px",
          marginBottom: "15px",
          border:
            "1px solid #ccc",
          borderRadius: "8px",
        }}
      />

      <button
        onClick={handleLogin}
        style={{
          width: "100%",
          padding: "12px",
          background: "#00d4ff",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        LOGIN
      </button>
    </div>
  </div>
);
}

export default App;