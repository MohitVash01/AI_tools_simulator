import React, { useState, useEffect } from "react";
import axios from "axios";
import Confetti from "react-confetti";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const API_BASE_URL = "http://localhost:3001/api";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#845EC2",
  "#D65DB1",
  "#FF6F91",
  "#FF9671",
  "#FFC75F",
  "#F9F871",
];

function App() {
  // State variables
  const [tools, setTools] = useState([]);
  const [filteredTools, setFilteredTools] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingTools, setLoadingTools] = useState(false);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [error, setError] = useState("");
  const [viewFavorites, setViewFavorites] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Fetch all tools
  useEffect(() => {
    fetchTools();
    fetchFavorites();
  }, []);


// Fetch tools from backend
  async function fetchTools() {
  setLoadingTools(true);
  setError("");
  try {
    const res = await axios.get(`${API_BASE_URL}/tools`);
    console.log("Fetched tools:", res.data); // 🔍 Check this in your browser console
    setTools(res.data);
    setFilteredTools(res.data);
  } catch (err) {
    setError("Failed to load tools");
  } finally {
    setLoadingTools(false);
  }
}


  // Fetch favorites from backend
  async function fetchFavorites() {
    setLoadingFavorites(true);
    setError("");
    try {
      const res = await axios.get(`${API_BASE_URL}/favorites`);
      setFavorites(res.data);
    } catch (err) {
      setError("Failed to load favorites");
    } finally {
      setLoadingFavorites(false);
    }
  }

  // Handle category filter change
  function handleCategoryChange(e) {
    const cat = e.target.value;
    setCategoryFilter(cat);
    filterTools(cat, searchTerm);
  }

  // Handle search input change
  function handleSearchChange(e) {
    const val = e.target.value;
    setSearchTerm(val);
    filterTools(categoryFilter, val);
  }

  // Filter tools based on category and search term
  function filterTools(category, search) {
    let filtered = tools;
    if (category) {
      filtered = filtered.filter(
        (t) => t.category.toLowerCase() === category.toLowerCase()
      );
    }
    if (search) {
      filtered = filtered.filter((t) =>
        t.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFilteredTools(filtered);
  }

  // Add a tool to favorites
  async function addFavorite(toolId) {
    setError("");
    try {
      await axios.post(`${API_BASE_URL}/favorites`, { toolId });
      setConfetti(true);
      setTimeout(() => setConfetti(false), 4000);
      fetchFavorites();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save favorite");
    }
  }

  // Remove tool from favorites
  async function removeFavorite(toolId) {
    setError("");
    try {
      await axios.delete(`${API_BASE_URL}/favorites/${toolId}`);
      fetchFavorites();
    } catch {
      setError("Failed to remove favorite");
    }
  }


  // Check if tool is favorited
  function isFavorite(toolId) {
    return favorites.some((fav) => fav.id === toolId);
  }

  // Prepare data for category chart
  const categoryCounts = tools.reduce((acc, tool) => {
    acc[tool.category] = (acc[tool.category] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(categoryCounts).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className={darkMode ? "app dark" : "app"}>
      {confetti && <Confetti />}
      <header>
        <h1>AI Tools Explorer</h1>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="dark-mode-btn"
          aria-label="Toggle dark mode"
        >
          {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
        <nav>
          <button
            onClick={() => setViewFavorites(false)}
            disabled={!viewFavorites}
          >
            All Tools
          </button>
          <button
            onClick={() => setViewFavorites(true)}
            disabled={viewFavorites}
          >
            My Favorites ({favorites.length})
          </button>
        </nav>
      </header>

      {!viewFavorites && (
        <section className="filters">
          <input
            type="text"
            placeholder="Search by tool name..."
            value={searchTerm}
            onChange={handleSearchChange}
            aria-label="Search tools by name"
          />
          <select
            value={categoryFilter}
            onChange={handleCategoryChange}
            aria-label="Filter tools by category"
          >
            <option value="">All Categories</option>
            {[...new Set(tools.map((t) => t.category))]
              .sort()
              .map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
          </select>
          <button
            onClick={() => {
              setCategoryFilter("");
              setSearchTerm("");
              setFilteredTools(tools);
            }}
            aria-label="Clear filters"
          >
            Clear Filters
          </button>
        </section>
      )}

      {error && <div className="error" role="alert">{error}</div>}

      {loadingTools && !viewFavorites && (
        <div className="loading" role="status">
          Loading tools...
        </div>
      )}
      {loadingFavorites && viewFavorites && (
        <div className="loading" role="status">
          Loading favorites...
        </div>
      )}

      {!loadingTools && !viewFavorites && (
        <main className="tools-list" aria-live="polite">
          {filteredTools.length === 0 ? (
            <p>No tools found</p>
          ) : (
            filteredTools.map((tool) => (
              <div className="tool-card" key={tool.id}>
                <h3>{tool.name}</h3>
                <p>
                  <b>Category:</b> {tool.category}
                </p>
                {tool.excerpt && <p>{tool.excerpt}</p>}
                <a href={tool.url} target="_blank" rel="noopener noreferrer">
                  Visit
                </a>
                <button
                  className="favorite-btn"
                  onClick={() => addFavorite(tool.id)}
                  disabled={isFavorite(tool.id)}
                  aria-label={
                    isFavorite(tool.id)
                      ? `${tool.name} is already favorited`
                      : `Add ${tool.name} to favorites`
                  }
                >
                  {isFavorite(tool.id) ? "❤️ Favorited" : "🤍 Favorite"}
                </button>
              </div>
            ))
          )}
        </main>
      )}

      {viewFavorites && (
  <main className="tools-list" aria-live="polite">
    {favorites.length === 0 ? (
      <p>No favorites saved</p>
    ) : (
      favorites.map((tool) => (
        <div className="tool-card" key={tool.id}>
          <h3>{tool.name}</h3>
          <p>
            <b>Category:</b> {tool.category}
          </p>
          {tool.excerpt && <p>{tool.excerpt}</p>}
          <a href={tool.url} target="_blank" rel="noopener noreferrer">
            Visit
          </a>
          <button
            className="remove-fav-btn"
            onClick={() => removeFavorite(tool.id)}
            aria-label={`Remove ${tool.name} from favorites`}
          >
            ❌ Remove from Favorites
          </button>
        </div>
      ))
    )}
  </main>
)}

      

      <section className="chart-section" aria-label="Chart showing number of tools by category">
        <h2>Tools by Category</h2>
        {tools.length === 0 ? (
          <p>No data</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                fill="#8884d8"
                label
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </section>

      {/* Styles */}
      <style>{`
        * {
          box-sizing: border-box;
        }
        body, html, #root {
          margin: 0; padding: 0; font-family: Arial, sans-serif;
          background-color: ${darkMode ? "#121212" : "#f9f9f9"};
          color: ${darkMode ? "#eee" : "#222"};
          min-height: 100vh;
        }
        .app {
          max-width: 900px;
          margin: auto;
          padding: 1rem;
        }
        header {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        header h1 {
          margin: 0;
        }
        nav button {
          margin-left: 0.5rem;
          padding: 0.5rem 1rem;
          font-size: 1rem;
          cursor: pointer;
          background-color: ${darkMode ? "#333" : "#eee"};
          border: none;
          border-radius: 5px;
        }
        nav button[disabled] {
          background-color: ${darkMode ? "#555" : "#ccc"};
          cursor: default;
        }
        .filters {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1rem;
          align-items: center;
        }
        input[type="text"], select {
          padding: 0.5rem;
          font-size: 1rem;
          flex-grow: 1;
          min-width: 150px;
          border: 1px solid ${darkMode ? "#555" : "#ccc"};
          border-radius: 5px;
          background-color: ${darkMode ? "#222" : "#fff"};
          color: ${darkMode ? "#eee" : "#222"};
        }
        button {
          padding: 0.5rem 1rem;
          cursor: pointer;
          border-radius: 5px;
          border: none;
          background-color: ${darkMode ? "#444" : "#eee"};
          color: ${darkMode ? "#eee" : "#222"};
          user-select: none;
          transition: background-color 0.3s;
        }
        button:hover:not([disabled]) {
          background-color: ${darkMode ? "#666" : "#ccc"};
        }
        .tools-list {
          display: grid;
          grid-template-columns: repeat(auto-fill,minmax(260px,1fr));
          gap: 1rem;
        }
        .tool-card {
          background-color: ${darkMode ? "#222" : "#fff"};
          padding: 1rem;
          border-radius: 8px;
          box-shadow: 0 0 8px rgba(0,0,0,0.1);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .tool-card h3 {
          margin: 0 0 0.5rem;
        }
        .tool-card p {
          flex-grow: 1;
        }
        .tool-card a {
          margin: 0.5rem 0;
          color: ${darkMode ? "#64b5f6" : "#1976d2"};
          text-decoration: none;
          font-weight: bold;
        }
        .tool-card a:hover {
          text-decoration: underline;
        }
        .favorite-btn, .remove-fav-btn {
          background-color: ${darkMode ? "#444" : "#eee"};
          border: none;
          border-radius: 5px;
          padding: 0.5rem;
          font-size: 1rem;
          cursor: pointer;
          user-select: none;
        }
        .favorite-btn[disabled] {
          cursor: default;
          background-color: ${darkMode ? "#333" : "#ccc"};
          color: ${darkMode ? "#999" : "#666"};
        }
        .error {
          color: #b00020;
          margin-bottom: 1rem;
        }
        .loading {
          font-style: italic;
          margin: 1rem 0;
        }
        .dark-mode-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          margin-bottom: 0.5rem;
        }
        .chart-section {
          margin-top: 2rem;
          text-align: center;
        }
        @media (max-width: 600px) {
          .tools-list {
            grid-template-columns: 1fr;
          }
          header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }
          nav button {
            margin-left: 0;
          }
          .filters {
            flex-direction: column;
            align-items: stretch;
          }
        }
      `}</style>
    </div>
  );
}

export default App;
