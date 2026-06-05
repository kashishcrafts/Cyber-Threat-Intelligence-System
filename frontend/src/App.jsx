import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  const [threatType, setThreatType] = useState("");
  const [source, setSource] = useState("");

  const [predictionResult, setPredictionResult] =
    useState("");

  const [predictions, setPredictions] =
    useState([]);
  const [searchTerm, setSearchTerm] =
  useState("");

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
          marginBottom: "30px",
        }}
      >
        🛡️ Cyber Threat Intelligence System
      </h1>

      <div
        style={{
          display: "flex",
          gap: "20px",
          flexWrap: "wrap",
          marginBottom: "20px",
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
          <h1>{totalThreats}</h1>
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
          <h1>{highCount}</h1>
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
          <h1>{mediumCount}</h1>
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
          <h1>{lowCount}</h1>
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
        <h2>Prediction History</h2>

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
              <th>Severity</th>
            </tr>
          </thead>

          <tbody>
            {filteredPredictions.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.threat_type}</td>
                <td>{item.source}</td>
                <td>{item.predicted_severity}</td>
              </tr>
            ))}
          </tbody>
        </table>
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