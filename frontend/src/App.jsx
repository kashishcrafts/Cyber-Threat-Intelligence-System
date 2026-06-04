import { useState } from "react";

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  const handleLogin = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            password,
          }),
        }
      );

      const data = await response.json();

      console.log(data);

      if (data.access_token) {
        localStorage.setItem(
          "token",
          data.access_token
        );

        setLoggedIn(true);
      } else {
        alert(
          JSON.stringify(data)
        );
      }
    } catch (error) {
      console.error(error);
      alert("SERVER ERROR");
    }
  };

  if (loggedIn) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0f172a",
          color: "white",
          padding: "40px",
        }}
      >
        <h1>
          🛡️ AI Cyber Threat Intelligence Platform
        </h1>

        <h2>
          Welcome {username}
        </h2>

        <p>
          Login successful.
        </p>
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
        }}
      >
        <h1
          style={{
            textAlign: "center",
          }}
        >
          Login
        </h1>

        <p>
          USERNAME STATE = {username}
        </p>

        <p>
          PASSWORD STATE = {password}
        </p>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) =>
            setUsername(e.target.value)
          }
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "10px",
            border:
              "1px solid black",
            color: "black",
            backgroundColor:
              "white",
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "15px",
            border:
              "1px solid black",
            color: "black",
            backgroundColor:
              "white",
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
          }}
        >
          LOGIN
        </button>
      </div>
    </div>
  );
}

export default App;