import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [inputUrl, setInputUrl] = useState("");
  const [shortUrl, setShortUrl] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("shorten");

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("urlHistory")) || [];
    setHistory(saved);
  }, []);

  const saveHistory = (newHistory) => {
    localStorage.setItem("urlHistory", JSON.stringify(newHistory));
  };

  const shortenUrl = async (url) => {
    try {
      const res = await fetch("http://localhost:5000/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ originalUrl: url }),
      });

      if (!res.ok) throw new Error("Failed to shorten URL");
      const data = await res.json();
      return data.shortUrl;
    } catch (err) {
      console.error(err);
      alert("Error shortening URL");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputUrl) return;

    const newShortUrl = await shortenUrl(inputUrl);
    if (!newShortUrl) return;

    const newEntry = {
      originalUrl: inputUrl,
      shortUrl: newShortUrl,
      createdAt: new Date().toISOString(),
      visits: 0,
    };

    const updatedHistory = [newEntry, ...history];
    setHistory(updatedHistory);
    saveHistory(updatedHistory);
    setInputUrl("");
    setShortUrl(newShortUrl);
  };

  return (
    <div className="container">
      <h1 className="title">🔗 URL Shortener</h1>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={activeTab === "shorten" ? "active" : ""}
          onClick={() => setActiveTab("shorten")}
        >
          Shorten URL
        </button>
        <button
          className={activeTab === "history" ? "active" : ""}
          onClick={() => setActiveTab("history")}
        >
          History
        </button>
        <button
          className={activeTab === "stats" ? "active" : ""}
          onClick={() => setActiveTab("stats")}
        >
          Stats
        </button>
      </div>

      {/* Shorten Form */}
      {activeTab === "shorten" && (
        <form onSubmit={handleSubmit} className="form">
          <input
            type="url"
            placeholder="Enter your URL..."
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            required
          />
          <button type="submit">Shorten</button>
        </form>
      )}

      {/* Show result */}
      {shortUrl && (
        <div className="result">
          <p>
            Short URL:{" "}
            <a href={shortUrl} target="_blank" rel="noreferrer">
              {shortUrl}
            </a>
          </p>
        </div>
      )}

      {/* History */}
      {activeTab === "history" && (
        <div className="history">
          {history.length === 0 ? (
            <p>No history yet</p>
          ) : (
            <ul>
              {history.map((item, idx) => (
                <li key={idx}>
                  <a href={item.shortUrl} target="_blank" rel="noreferrer">
                    {item.shortUrl}
                  </a>{" "}
                  → {item.originalUrl}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Stats */}
      {activeTab === "stats" && (
        <div className="stats">
          <p>Total URLs shortened: {history.length}</p>
          <p>Total visits (local only): {history.reduce((sum, i) => sum + i.visits, 0)}</p>
        </div>
      )}
    </div>
  );
}

export default App;
