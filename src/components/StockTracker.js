import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const STOCK_LIST = ['AAPL', 'GOOGL', 'MSFT', 'AMZN'];
const API_KEY = '*************************';

const StockTracker = () => {
  const [stocksData, setStocksData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchSymbol, setSearchSymbol] = useState('');

  useEffect(() => {
    fetchStocksData(STOCK_LIST);
  }, []);

  const fetchStocksData = async (symbols) => {
    setLoading(true);
    setError('');
    const newStocksData = [];

    for (const symbol of symbols) {
      try {
        const data = await fetchStockData(symbol);
        if (data) {
          newStocksData.push(data);
        }
      } catch (err) {
        console.error(`Error fetching data for ${symbol}:`, err);
      }
    }

    setStocksData(newStocksData);
    setLoading(false);
  };

  const fetchStockData = async (symbol) => {
    try {
      const response = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${API_KEY}`);
      const data = await response.json();

      if (data['Time Series (Daily)']) {
        const timeSeriesData = data['Time Series (Daily)'];
        const dates = Object.keys(timeSeriesData).slice(0, 30);
        const historicalData = dates.map(date => ({
          date,
          price: parseFloat(timeSeriesData[date]['4. close'])
        })).reverse();

        const latestData = timeSeriesData[dates[0]];
        const previousData = timeSeriesData[dates[1]];

        return {
          quote: {
            symbol: symbol,
            price: parseFloat(latestData['4. close']),
            change: (parseFloat(latestData['4. close']) - parseFloat(previousData['4. close'])).toFixed(2),
            changePercent: ((parseFloat(latestData['4. close']) - parseFloat(previousData['4. close'])) / parseFloat(previousData['4. close']) * 100).toFixed(2),
            open: parseFloat(latestData['1. open']),
            high: parseFloat(latestData['2. high']),
            low: parseFloat(latestData['3. low']),
            volume: parseInt(latestData['5. volume']),
          },
          historicalData
        };
      }
      throw new Error('Invalid data received from API');
    } catch (err) {
      console.error(`Error fetching data for ${symbol}:`, err);
      return null;
    }
  };

  const handleSearch = () => {
    if (searchSymbol) {
      fetchStocksData([searchSymbol]);
    }
  };

  return (
    <div className="stock-tracker">
      <h1>Stock Price Tracker</h1>
      
      <div className="search-container">
        <input
          type="text"
          value={searchSymbol}
          onChange={(e) => setSearchSymbol(e.target.value.toUpperCase())}
          placeholder="Enter stock symbol"
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {loading && <p className="loading">Loading stock data...</p>}
      {error && <p className="error">{error}</p>}

      <div className="stocks-list">
        {stocksData.map((stock, index) => (
          <div key={index} className="stock-data">
            <h2>{stock.quote.symbol}</h2>
            <p>Price: ${stock.quote.price.toFixed(2)}</p>
            <p className={stock.quote.change >= 0 ? "positive" : "negative"}>
              Change: ${stock.quote.change} ({stock.quote.changePercent}%)
            </p>
            <p>Open: ${stock.quote.open.toFixed(2)}</p>
            <p>High: ${stock.quote.high.toFixed(2)}</p>
            <p>Low: ${stock.quote.low.toFixed(2)}</p>
            <p>Volume: {stock.quote.volume.toLocaleString()}</p>
            <div className="stock-chart">
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={stock.historicalData}>
                  <XAxis dataKey="date" />
                  <YAxis domain={['auto', 'auto']} />
                  <Tooltip />
                  <Line type="monotone" dataKey="price" stroke="#4A90E2" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StockTracker;
