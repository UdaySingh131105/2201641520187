
import React, { useState, useEffect } from 'react';

// --- SVG Icons ---
// Using inline SVGs as we can't import from libraries in this environment.
const LinkIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"></path>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"></path>
  </svg>
);

const CopyIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
  </svg>
);

const TrashIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}>
    <path d="M3 6h18"></path>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

const ClockIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}>
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

const CustomCodeIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
    <polyline points="14 2 14 8 20 8"></polyline><path d="m10 13-2 2 2 2"></path><path d="m14 17 2-2-2-2"></path>
  </svg>
);

const PlusIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}>
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const ChevronDownIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}>
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

// --- Custom Logger (as per requirements) ---
const logger = {
  info: (message, data) => {
    console.log('[INFO]', message, data || '');
  },
  warn: (message, data) => {
    console.warn('[WARN]', message, data || '');
  },
  error: (message, data) => {
    console.error('[ERROR]', message, data || '');
  },
};


export default function App() {
  const [urlEntries, setUrlEntries] = useState([{ id: Date.now(), longUrl: '', shortcode: '', validity: 30, error: '' }]);
  const [latestResults, setLatestResults] = useState([]);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(null);
  const [currentView, setCurrentView] = useState({ view: 'loading', message: '' });
  const [expandedStatsId, setExpandedStatsId] = useState(null);

  // --- Client-Side Navigation & Routing ---
  useEffect(() => {
    const handleLocationChange = () => {
      logger.info('Handling location change.');
      let historyFromStorage = [];
      try {
        const storedHistory = localStorage.getItem('urlHistory');
        if (storedHistory) {
          historyFromStorage = JSON.parse(storedHistory);
          if (JSON.stringify(history) !== JSON.stringify(historyFromStorage)) {
            setHistory(historyFromStorage);
          }
        }
      } catch (e) {
        logger.error('Failed to parse history from localStorage during routing', e);
      }

      const path = window.location.pathname;
      logger.info(`Routing path detected: ${path}`);

      if (path === '/stats') {
        setCurrentView({ view: 'stats' });
        return;
      }

      if (path === '/' || path === '') {
        setCurrentView({ view: 'home' });
        return;
      }

      const shortcode = path.substring(1);
      const link = historyFromStorage.find(item => item.short === shortcode);

      if (link) {
        if (link.expiresAt < Date.now()) {
          logger.warn('Redirect failed: Link has expired.', link);
          setCurrentView({ view: 'notFound', message: 'This link has expired.' });
        } else {
          // Log the click before redirecting
          const updatedHistory = historyFromStorage.map(item => {
            if (item.short === shortcode) {
              const newClick = {
                timestamp: Date.now(),
                referrer: document.referrer || 'Direct',
                location: 'Bhautipratappur, India' // Simulated coarse location
              };
              const updatedItem = {
                ...item,
                clicks: [...(item.clicks || []), newClick]
              };
              logger.info('Logged new click', updatedItem);
              return updatedItem;
            }
            return item;
          });

          localStorage.setItem('urlHistory', JSON.stringify(updatedHistory));
          setHistory(updatedHistory);

          logger.info(`Redirecting from /${shortcode} to ${link.long}`);
          setCurrentView({ view: 'redirect', message: link.long });
          window.location.href = link.long;
        }
      } else {
        logger.warn(`Redirect failed: Shortcode not found: ${shortcode}`);
        setCurrentView({ view: 'notFound', message: 'This short link was not found or has been deleted.' });
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    handleLocationChange(); // Initial route check

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []); // Effect runs once to set up router

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    const navEvent = new PopStateEvent('popstate');
    window.dispatchEvent(navEvent);
  };


  // Update localStorage whenever history changes
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('urlHistory') || '[]';
      // Only update if there's a meaningful change to prevent loops
      if (JSON.stringify(history) !== storedHistory) {
        localStorage.setItem('urlHistory', JSON.stringify(history));
        logger.info('History updated and saved to localStorage.');
      }
    } catch (e) {
      logger.error('Failed to save history to localStorage', e);
    }
  }, [history]);

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const generateShortcode = (length = 6) => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  const handleEntryChange = (id, field, value) => {
    setUrlEntries(entries =>
      entries.map(entry =>
        entry.id === id ? { ...entry, [field]: value, error: '' } : entry
      )
    );
  };

  const addUrlEntry = () => {
    if (urlEntries.length < 5) {
      setUrlEntries([...urlEntries, { id: Date.now(), longUrl: '', shortcode: '', validity: 30, error: '' }]);
    }
  };

  const removeUrlEntry = (id) => {
    if (urlEntries.length > 1) {
      setUrlEntries(urlEntries.filter(entry => entry.id !== id));
    }
  };

  //   const handleShorten = async (url) => {
  //     url.preventDefault();
  //   try {
  //     const res = await fetch("http://localhost:5000/shorturls", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ originalUrl: url }),
  //     });

  //     if (!res.ok) throw new Error("Failed to shorten URL");

  //     const data = await res.json();
  //     return data.shortUrl; // backend should return { shortUrl: "http://localhost:5000/xyz123" }
  //   } catch (err) {
  //     console.error("Error:", err);
  //     alert("Error shortening URL");
  //   }
  // };

  const handleShorten = async (e) => {
    e.preventDefault();
    setLatestResults([]);
    setCopied(null);

    // --- Client-Side Validation ---
    let isValid = true;
    const entriesWithErrors = [...urlEntries];
    const customCodesInBatch = new Set();

    for (let i = 0; i < entriesWithErrors.length; i++) {
      const entry = entriesWithErrors[i];
      if (!entry.longUrl) {
        entry.error = "Please enter a URL.";
        isValid = false;
      } else if (!isValidUrl(entry.longUrl)) {
        entry.error = "Invalid URL format.";
        isValid = false;
      } else if (entry.shortcode) {
        if (!/^[a-zA-Z0-9]+$/.test(entry.shortcode)) {
          entry.error = "Shortcode must be alphanumeric.";
          isValid = false;
        } else if (history.some((item) => item.short === entry.shortcode)) {
          entry.error = "Shortcode already in use.";
          isValid = false;
        } else if (customCodesInBatch.has(entry.shortcode)) {
          entry.error = "Duplicate shortcode in this batch.";
          isValid = false;
        } else {
          customCodesInBatch.add(entry.shortcode);
        }
      }
    }

    setUrlEntries(entriesWithErrors);

    if (!isValid) {
      logger.warn(
        "Shorten attempt failed due to validation errors.",
        entriesWithErrors.filter((e) => e.error)
      );
      return;
    }

    setIsLoading(true);

    try {
      const newItems = [];
      const newHistory = [...history];

      for (const entry of urlEntries) {
        // --- 🔹 Call backend ---
        const res = await fetch("http://localhost:5000/shorten", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: entry.longUrl,
            visibility: entry.validity || 30, // minutes
            code: entry.shortcode || null,
          }),
        });

        if (!res.ok) {
          throw new Error(`Failed to shorten URL: ${entry.longUrl}`);
        }

        const data = await res.json();

        const newItem = {
          id: Date.now() + newItems.length, // unique ID
          long: entry.longUrl,
          short: data.shortUrl.split("/").pop(), // extract shortcode
          displayUrl: data.shortUrl,
          createdAt: Date.now(),
          expiresAt: data.expiresAt,
          clicks: [],
        };

        newItems.push(newItem);
        newHistory.unshift(newItem);
      }

      setHistory(newHistory);
      setLatestResults(newItems);
      logger.info("Successfully created new short links.", newItems);

      // reset form
      setUrlEntries([
        { id: Date.now(), longUrl: "", shortcode: "", validity: 30, error: "" },
      ]);
    } catch (err) {
      logger.error("Failed to shorten URLs due to an unexpected error.", err);
      setUrlEntries((entries) => [
        { ...entries[0], error: "An unexpected error occurred." },
        ...entries.slice(1),
      ]);
    } finally {
      setIsLoading(false);
    }
  };


  const handleCopy = (textToCopy, id) => {
    const textArea = document.createElement("textarea");
    textArea.value = textToCopy;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      logger.error('Failed to copy text to clipboard.', err);
    }
    document.body.removeChild(textArea);
  };

  const handleDelete = (id) => {
    setHistory(prevHistory => prevHistory.filter(item => item.id !== id));
    logger.info(`Deleted history item with id: ${id}`);
  }

  const handleClearHistory = () => {
    setHistory([]);
    logger.info('History cleared.');
  }

  const getTimeRemaining = (expiresAt) => {
    const total = expiresAt - Date.now();
    if (total <= 0) return 'Expired';
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  const PageShell = ({ children }) => (
    <div className="page-shell">{children}</div>
  );

  if (currentView.view === 'loading') {
    return <PageShell><div className="loading-text">Loading...</div></PageShell>;
  }

  if (currentView.view === 'redirect') {
    return <PageShell><div className="redirect-text">Redirecting to <br /> <span className="redirect-url">{currentView.message}</span></div></PageShell>;
  }

  if (currentView.view === 'notFound') {
    return (
      <PageShell>
        <div className="not-found-container">
          <h1 className="not-found-title">Link Not Found</h1>
          <p className="not-found-message">{currentView.message}</p>
          <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }} className="button-primary">
            Create a new Short Link
          </a>
        </div>
      </PageShell>
    );
  }

  if (currentView.view === 'stats') {
    return (
      <PageShell>
        <div className="content-wrapper">
          <header className="header">
            <h1 className="header-title">Statistics</h1>
            <p className="header-subtitle">Click details for your shortened links.</p>
            <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }} className="nav-link">
              Back to URL Shortener
            </a>
          </header>
          <main>
            {history.length === 0 ? (
              <div className="form-card"><p>No links have been created yet. Go back to create one!</p></div>
            ) : (
              <div className="stats-list">
                {history.map(item => (
                  <div key={item.id} className="stats-card">
                    <div className="stats-main-info">
                      <div className="stats-urls">
                        <a href={item.long} target="_blank" rel="noopener noreferrer" className="history-long-url" title={item.long}>
                          {item.long}
                        </a>
                        <a href={item.displayUrl} onClick={(e) => { e.preventDefault(); navigate(item.displayUrl); }} className="history-short-url">{`${window.location.host}${item.displayUrl}`}</a>
                      </div>
                      <div className="stats-clicks">
                        <span>{item.clicks?.length || 0}</span>
                        <p>Clicks</p>
                      </div>
                    </div>
                    <div className="stats-dates">
                      <p><strong>Created:</strong> {new Date(item.createdAt).toLocaleString()}</p>
                      <p><strong>Expires:</strong> {new Date(item.expiresAt).toLocaleString()}</p>
                    </div>
                    {item.clicks && item.clicks.length > 0 && (
                      <div className="stats-details-toggle">
                        <button onClick={() => setExpandedStatsId(expandedStatsId === item.id ? null : item.id)} className="button-details">
                          <span>Details</span>
                          <ChevronDownIcon className={`chevron-icon ${expandedStatsId === item.id ? 'expanded' : ''}`} />
                        </button>
                      </div>
                    )}
                    {expandedStatsId === item.id && (
                      <div className="stats-click-details">
                        <div className="click-table-header">
                          <div>Timestamp</div>
                          <div>Source</div>
                          <div>Location</div>
                        </div>
                        {item.clicks.map((click, index) => (
                          <div key={index} className="click-table-row">
                            <div>{new Date(click.timestamp).toLocaleString()}</div>
                            <div title={click.referrer}>{click.referrer}</div>
                            <div>{click.location}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell className='flex flex-col gap-2'>
      <div className="content-wrapper">
        <header className="header">
          <h1 className="header-title">URL Shortener</h1>
          <p className="header-subtitle">Create, customize, and manage your short links.</p>
          <a href="/stats" onClick={(e) => { e.preventDefault(); navigate('/stats'); }} className="nav-link">View Statistics</a>
        </header>

        <main>
          <div className="form-card">
            <form onSubmit={handleShorten} className="form-main">
              {urlEntries.map((entry, index) => (
                <div key={entry.id} className="url-entry-row">
                  <div className="entry-inputs">
                    <div className="input-container">
                      <LinkIcon className="input-icon" />
                      <input
                        type="text"
                        value={entry.longUrl}
                        onChange={(e) => handleEntryChange(entry.id, 'longUrl', e.target.value)}
                        placeholder="Enter a long URL to shorten..."
                        className="input-field"
                        aria-label="Long URL Input"
                      />
                    </div>
                    <div className="form-grid">
                      <div className="input-container">
                        <CustomCodeIcon className="input-icon" />
                        <input
                          type="text"
                          value={entry.shortcode}
                          onChange={(e) => handleEntryChange(entry.id, 'shortcode', e.target.value)}
                          placeholder="Custom shortcode (optional)"
                          className="input-field"
                          aria-label="Custom Shortcode Input"
                        />
                      </div>
                      <div className="input-container">
                        <ClockIcon className="input-icon" />
                        <input
                          type="number"
                          value={entry.validity}
                          onChange={(e) => handleEntryChange(entry.id, 'validity', Number(e.target.value))}
                          placeholder="Validity (minutes)"
                          className="input-field"
                          aria-label="Validity Period Input"
                        />
                      </div>
                    </div>
                    {entry.error && <p className="error-message-inline">{entry.error}</p>}
                  </div>
                  <div className="entry-actions">
                    {urlEntries.length > 1 && (
                      <button type="button" onClick={() => removeUrlEntry(entry.id)} className="button-remove-entry">
                        <TrashIcon className="trash-icon-small" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <div className="form-actions">
                {urlEntries.length < 5 && (
                  <button type="button" onClick={addUrlEntry} className="button-add-entry">
                    <PlusIcon className="plus-icon" />
                    Add URL
                  </button>
                )}
                <button type="submit" disabled={isLoading} className="button-primary">
                  {isLoading ? (
                    <>
                      <svg className="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </>
                  ) : (
                    `Generate Link${urlEntries.length > 1 ? 's' : ''}`
                  )}
                </button>
              </div>
            </form>
          </div>

          {latestResults.length > 0 && (
            <div className="results-container">
              {latestResults.map(result => (
                <div key={result.id} className="result-card">
                  <div className="result-details">
                    <span className="result-long-url" title={result.long}>{result.long}</span>
                    <a href={result.displayUrl} onClick={(e) => { e.preventDefault(); navigate(result.displayUrl); }} className="result-url">{`${window.location.host}${result.displayUrl}`}</a>
                  </div>
                  <button
                    onClick={() => handleCopy(`${window.location.origin}${result.displayUrl}`, result.id)}
                    className="button-secondary"
                  >
                    <CopyIcon className="copy-icon" />
                    {copied === result.id ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {history.length > 0 && (
            <div className="history-section">
              <div className="history-header">
                <h2 className="history-title">History</h2>
                <button onClick={handleClearHistory} className="button-clear-all">
                  <TrashIcon className="trash-icon-small" />
                  Clear All
                </button>
              </div>
              <div className="history-list">
                {history.map((item) => {
                  const isExpired = item.expiresAt < Date.now();
                  return (
                    <div key={item.id} className={`history-item ${isExpired ? 'expired' : ''}`}>
                      <div className="history-item-top">
                        <a href={item.long} target="_blank" rel="noopener noreferrer" className="history-long-url" title={item.long}>
                          {item.long}
                        </a>
                        <button onClick={() => handleDelete(item.id)} className="button-delete">
                          <TrashIcon className="trash-icon-small" />
                        </button>
                      </div>
                      <div className="history-item-bottom">
                        <div className="history-short-link-group">
                          <a href={item.displayUrl} onClick={(e) => { e.preventDefault(); navigate(item.displayUrl); }} className="history-short-url">{`${window.location.host}${item.displayUrl}`}</a>
                          <button
                            onClick={() => handleCopy(`${window.location.origin}${item.displayUrl}`, item.id)}
                            className="button-copy-icon">
                            {copied === item.id ? <span className="copied-text">Copied!</span> : <CopyIcon className="copy-icon-small" />}
                          </button>
                        </div>
                        <p className={`time-remaining ${isExpired ? 'expired-text' : ''}`}>
                          {getTimeRemaining(item.expiresAt)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </main>
      </div>
    </PageShell>
  );
}

// --- Native CSS Styles (emulating Material UI) ---
const style = document.createElement('style');
style.textContent = `
  :root {
    --primary-blue: #1976d2;
    --primary-cyan: #00bcd4;
    --primary-green: #4caf50;
    --primary-red: #f44336;
    --bg-light: #f4f6f8;
    --surface: #ffffff;
    --text-primary: #212121;
    --text-secondary: #757575;
    --text-disabled: #bdbdbd;
    --border-color: #e0e0e0;
    --shadow-color: rgba(25, 118, 210, 0.2);
  }

  body {
    margin: 0;
    font-family: 'Roboto', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: var(--bg-light);
    color: var(--text-primary);
  }

  .page-shell {
    min-height: 100vh;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 1rem;
  }
  
  .content-wrapper {
    width: 100%;
    max-width: 48rem; /* 768px */
    padding-top: 2rem;
    padding-bottom: 2rem;
  }

  .header {
    text-align: center;
    margin-bottom: 2.5rem;
  }

  .header-title {
    font-size: 2.5rem;
    font-weight: 700;
    background: linear-gradient(to right, var(--primary-blue), var(--primary-cyan));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  .header-subtitle {
    color: var(--text-secondary);
    margin-top: 0.5rem;
  }
  
  .nav-link {
    color: var(--primary-blue);
    text-decoration: none;
    font-weight: 500;
    margin-top: 1rem;
    display: inline-block;
  }
  .nav-link:hover {
    text-decoration: underline;
  }

  .form-card {
    background-color: var(--surface);
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 10px 25px -5px var(--shadow-color);
    border: 1px solid var(--border-color);
  }

  .form-main {
      display: flex;
      flex-direction: column;
      gap: 1.5rem; /* Increased gap for rows */
  }

  .url-entry-row {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
  }

  .entry-inputs {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
  }

  .entry-actions {
      padding-top: 0.5rem; /* Align with first input */
  }

  .button-remove-entry {
      color: var(--text-secondary);
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.2s, background-color 0.2s;
  }
  .button-remove-entry:hover {
      color: var(--primary-red);
      background-color: rgba(244, 67, 54, 0.1);
  }

  .form-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1rem;
  }

  @media (min-width: 768px) {
      .form-grid {
          grid-template-columns: 1fr 1fr;
      }
  }

  .input-container {
    position: relative;
    width: 100%;
  }

  .input-icon {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    width: 1.25rem;
    height: 1.25rem;
    color: var(--text-secondary);
  }
  
  .input-field {
    width: 100%;
    background-color: var(--bg-light);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 0.8rem 1rem 0.8rem 2.5rem;
    font-size: 1rem;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s, background-color 0.2s;
    box-sizing: border-box;
  }

  .input-field::placeholder {
    color: var(--text-secondary);
  }

  .input-field:focus {
    border-color: var(--primary-blue);
    background-color: var(--surface);
    box-shadow: 0 0 0 2px var(--shadow-color);
  }
  
  .form-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      margin-top: 0.5rem;
  }

  .button-add-entry {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: none;
      border: 1px solid var(--border-color);
      color: var(--text-secondary);
      padding: 0.7rem 1.2rem;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      transition: color 0.2s, border-color 0.2s, background-color 0.2s;
  }
  .button-add-entry:hover {
      color: var(--text-primary);
      border-color: var(--text-secondary);
      background-color: var(--bg-light);
  }
  .plus-icon { width: 1rem; height: 1rem; }

  .button-primary {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-grow: 1; /* Allow button to take space */
    background-image: linear-gradient(to right, var(--primary-blue), var(--primary-cyan));
    color: #ffffff;
    font-weight: 600;
    padding: 0.8rem 1.5rem;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;
  }
  
  .button-primary:hover {
    box-shadow: 0 4px 15px -5px rgba(0, 188, 212, 0.4);
    transform: translateY(-1px);
  }
  
  .button-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
  }

  .spinner {
    animation: spin 1s linear infinite;
    margin-right: 0.75rem;
    height: 1.25rem;
    width: 1.25rem;
    color: white;
  }
  .spinner circle { opacity: 0.25; }
  .spinner path { opacity: 0.75; }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .error-message-inline {
      color: var(--primary-red);
      padding-left: 0.5rem;
      font-size: 0.875rem;
  }

  .results-container {
      margin-top: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      animation: fade-in 0.5s ease-out forwards;
  }

  .result-card {
    background-color: var(--surface);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 1rem 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.75rem;
  }
  
   @media (min-width: 768px) {
      .result-card { flex-direction: row; align-items: center; }
   }
  
  .result-details {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      overflow: hidden;
  }

  .result-long-url {
      color: var(--text-secondary);
      font-size: 0.875rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
  }

  .result-url {
    color: var(--primary-green);
    font-family: 'monospace';
    word-break: break-all;
    text-decoration: none;
  }
  .result-url:hover { text-decoration: underline; }

  .button-secondary {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    width: 100%;
    background-color: var(--surface);
    color: var(--text-primary);
    font-weight: 600;
    padding: 0.5rem 1rem;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .button-secondary:hover {
    background-color: var(--bg-light);
  }
  
  @media (min-width: 768px) {
    .button-secondary { width: auto; flex-shrink: 0; }
  }

  .copy-icon { width: 1.25rem; height: 1.25rem; }

  .history-section {
    margin-top: 2.5rem;
    animation: fade-in 0.5s ease-out forwards;
  }

  .history-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .history-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-secondary);
  }

  .button-clear-all {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    color: var(--text-secondary);
    background: none;
    border: none;
    cursor: pointer;
    font-size: 0.875rem;
    transition: color 0.2s;
  }
  .button-clear-all:hover { color: var(--primary-red); }

  .history-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .history-item {
    background-color: var(--surface);
    border: 1px solid var(--border-color);
    padding: 1rem;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    transition: background-color 0.2s, border-color 0.2s;
  }

  .history-item:hover {
      background-color: var(--bg-light);
      border-color: #d0d0d0;
  }
  .history-item.expired { opacity: 0.6; }
  
  .history-item-top, .history-item-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.5rem;
  }
  .history-item-bottom { flex-wrap: wrap; }
  
  .history-long-url {
    color: var(--text-secondary);
    font-size: 0.875rem;
    text-decoration: none;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .history-long-url:hover { text-decoration: underline; }

  .button-delete {
    color: var(--text-secondary);
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 99px;
    transition: color 0.2s, background-color 0.2s;
  }
  .button-delete:hover { color: var(--primary-red); background-color: rgba(244, 67, 54, 0.1); }

  .trash-icon-small { width: 1rem; height: 1rem; }

  .history-short-link-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .history-short-url {
    color: var(--primary-blue);
    font-family: 'monospace';
    text-decoration: none;
  }
  .history-short-url:hover { text-decoration: underline; }

  .button-copy-icon {
    color: var(--text-secondary);
    background: none;
    border: none;
    cursor: pointer;
    transition: color 0.2s;
  }
  .button-copy-icon:hover { color: var(--text-primary); }

  .copy-icon-small { width: 0.9rem; height: 0.9rem; }
  .copied-text { font-size: 0.75rem; color: var(--primary-green); }

  .time-remaining { font-size: 0.75rem; color: var(--text-secondary); }
  .time-remaining.expired-text { color: var(--primary-red); }

  /* Not Found & Redirect Pages */
  .loading-text, .redirect-text, .not-found-container { text-align: center; }
  .redirect-url { font-family: 'monospace'; color: var(--primary-blue); word-break: break-all; }
  .not-found-title { font-size: 2.25rem; font-weight: 700; color: var(--primary-red); margin-bottom: 1rem; }
  .not-found-message { color: var(--text-secondary); margin-bottom: 1.5rem; }
  
  /* Statistics Page Styles */
  .stats-list { display: flex; flex-direction: column; gap: 1rem; }
  .stats-card {
    background-color: var(--surface);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .stats-main-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
  }
  .stats-urls {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    overflow: hidden;
  }
  .stats-clicks {
    text-align: center;
    flex-shrink: 0;
    padding-left: 1rem;
  }
  .stats-clicks span {
    font-size: 2rem;
    font-weight: 600;
    color: var(--primary-blue);
  }
  .stats-clicks p { margin: 0; font-size: 0.875rem; color: var(--text-secondary); }
  .stats-dates {
    font-size: 0.875rem;
    color: var(--text-secondary);
    border-top: 1px solid var(--border-color);
    padding-top: 1rem;
  }
  .stats-dates p { margin: 0 0 0.25rem; }
  .stats-details-toggle { border-top: 1px solid var(--border-color); padding-top: 1rem; }
  .button-details {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    color: var(--text-secondary);
    font-weight: 500;
    cursor: pointer;
  }
  .chevron-icon { transition: transform 0.2s; }
  .chevron-icon.expanded { transform: rotate(180deg); }
  .stats-click-details { margin-top: 0.5rem; font-size: 0.875rem; }
  .click-table-header, .click-table-row {
    display: grid;
    grid-template-columns: 1.5fr 1fr 1fr;
    gap: 1rem;
    padding: 0.5rem;
  }
  .click-table-header { font-weight: 600; color: var(--text-primary); border-bottom: 1px solid var(--border-color); }
  .click-table-row { color: var(--text-secondary); border-bottom: 1px solid var(--border-color); }
  .click-table-row:last-child { border-bottom: none; }
  .click-table-row div {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
  }

  @keyframes fade-in {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
document.head.append(style);


// import { useState, useEffect } from "react";
// import "./App.css";

// function App() {
//   const [inputUrl, setInputUrl] = useState("");
//   const [shortUrl, setShortUrl] = useState(null);
//   const [history, setHistory] = useState([]);
//   const [activeTab, setActiveTab] = useState("shorten");

//   useEffect(() => {
//     const saved = JSON.parse(localStorage.getItem("urlHistory")) || [];
//     setHistory(saved);
//   }, []);

//   const saveHistory = (newHistory) => {
//     localStorage.setItem("urlHistory", JSON.stringify(newHistory));
//   };

//   const shortenUrl = async (url) => {
//     try {
//       const res = await fetch("http://localhost:5000/api/shorten", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ originalUrl: url }),
//       });

//       if (!res.ok) throw new Error("Failed to shorten URL");
//       const data = await res.json();
//       return data.shortUrl;
//     } catch (err) {
//       console.error(err);
//       alert("Error shortening URL");
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!inputUrl) return;

//     const newShortUrl = await shortenUrl(inputUrl);
//     if (!newShortUrl) return;

//     const newEntry = {
//       originalUrl: inputUrl,
//       shortUrl: newShortUrl,
//       createdAt: new Date().toISOString(),
//       visits: 0,
//     };

//     const updatedHistory = [newEntry, ...history];
//     setHistory(updatedHistory);
//     saveHistory(updatedHistory);
//     setInputUrl("");
//     setShortUrl(newShortUrl);
//   };

//   return (
//     <div className="container">
//       <h1 className="title">🔗 URL Shortener</h1>

//       {/* Tabs */}
//       <div className="tabs">
//         <button
//           className={activeTab === "shorten" ? "active" : ""}
//           onClick={() => setActiveTab("shorten")}
//         >
//           Shorten URL
//         </button>
//         <button
//           className={activeTab === "history" ? "active" : ""}
//           onClick={() => setActiveTab("history")}
//         >
//           History
//         </button>
//         <button
//           className={activeTab === "stats" ? "active" : ""}
//           onClick={() => setActiveTab("stats")}
//         >
//           Stats
//         </button>
//       </div>

//       {/* Shorten Form */}
//       {activeTab === "shorten" && (
//         <form onSubmit={handleSubmit} className="form">
//           <input
//             type="url"
//             placeholder="Enter your URL..."
//             value={inputUrl}
//             onChange={(e) => setInputUrl(e.target.value)}
//             required
//           />
//           <button type="submit">Shorten</button>
//         </form>
//       )}

//       {/* Show result */}
//       {shortUrl && (
//         <div className="result">
//           <p>
//             Short URL:{" "}
//             <a href={shortUrl} target="_blank" rel="noreferrer">
//               {shortUrl}
//             </a>
//           </p>
//         </div>
//       )}

//       {/* History */}
//       {activeTab === "history" && (
//         <div className="history">
//           {history.length === 0 ? (
//             <p>No history yet</p>
//           ) : (
//             <ul>
//               {history.map((item, idx) => (
//                 <li key={idx}>
//                   <a href={item.shortUrl} target="_blank" rel="noreferrer">
//                     {item.shortUrl}
//                   </a>{" "}
//                   → {item.originalUrl}
//                 </li>
//               ))}
//             </ul>
//           )}
//         </div>
//       )}

//       {/* Stats */}
//       {activeTab === "stats" && (
//         <div className="stats">
//           <p>Total URLs shortened: {history.length}</p>
//           <p>Total visits (local only): {history.reduce((sum, i) => sum + i.visits, 0)}</p>
//         </div>
//       )}
//     </div>
//   );
// }

// export default App;
