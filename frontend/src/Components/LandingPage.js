// LandingPage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Chart from 'chart.js/auto';
import '../styles/styles.css'; // Import external CSS
import Login from './Login'; // Import the Login component
const LandingPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState([]);
  const [mostSearchedKeywords, setMostSearchedKeywords] = useState([]);
  const [chart, setChart] = useState(null);
  const [error, setError] = useState(null);
  const [authToken, setAuthToken] = useState(null);

  useEffect(() => {
    // Fetch most searched keywords from the backend
    const fetchMostSearchedKeywords = async () => {
      try {
        const response = await axios.get('http://localhost:5000/most-searched/desc');
        setMostSearchedKeywords(response.data);
      } catch (error) {
        console.error('Error fetching most searched keywords:', error);
      }
    };

    fetchMostSearchedKeywords();
  }, []);

  const handleSearch = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/search?term=${searchTerm}`);
      const result = response.data.query.search;
      setSearchResult(result);
      setError(null);

      if (chart) {
        chart.destroy();
      }

      const ctx = document.getElementById('mostSearchedChart').getContext('2d');
      const newChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: mostSearchedKeywords.map((keyword) => keyword.keyword),
          datasets: [
            {
              label: 'Search Count',
              data: mostSearchedKeywords.map((keyword) => keyword.count),
              backgroundColor: 'rgba(75,192,192,0.2)',
              borderColor: 'rgba(75,192,192,1)',
              borderWidth: 1,
            },
          ],
        },
        options: {
          scales: {
            x: {
              type: 'category',
              beginAtZero: true,
            },
            y: {
              beginAtZero: true,
            },
          },
        },
      });

      setChart(newChart);
    } catch (error) {
      console.error('Error fetching data from Wikipedia:', error);
      setError('Error fetching data from Wikipedia. Please try again.');
    }
  };

  return (
    <div className="container">
      <h1 className="title">TinyWiki - Search Page</h1>
      <div className="search-container">
        <input
          type="text"
          placeholder="Enter a topic"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <button onClick={handleSearch} className="search-button">
          Search
        </button>
      </div>
      {error && <p className="error">{error}</p>}
      {searchResult.length > 0 && (
        <div>
          <h2 className="subtitle">Search Results</h2>
          {searchResult.map((result) => (
            <div key={result.pageid} className="result-container">
              <h3 className="result-title">{result.title}</h3>
              <p className="result-snippet">{result.snippet}</p>
              <Link to={`/wiki/${encodeURIComponent(result.title)}`} className="read-more-link">
                Read More
              </Link>
            </div>
          ))}
        </div>
      )}
      <div>
        <h2 className="subtitle">Most Searched Keywords</h2>
        <canvas id="mostSearchedChart" className="chart"></canvas>
      </div>
      {!authToken && (
        // If not authenticated, show login
        <Login setAuthToken={setAuthToken} />
      )}
    </div>
  );
};

export default LandingPage;
