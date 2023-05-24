import { useEffect, useState } from 'react';
import './component_css/LogRepresentationStyle.css';

/**
 * Component that displays logs fetched from the server.
 */
const LogRepresentation = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [deviceColors, setDeviceColors] = useState(new Map());

  const downloadLogs = () => {
    // Create a string from the logs array
    const logString = logs.join('\n');

    // Create a Blob object with the log string
    const blob = new Blob([logString], { type: 'text/plain' });

    // Create a temporary URL for the Blob object
    const url = URL.createObjectURL(blob);

    // Create a link element and simulate a click to trigger the download
    const link = document.createElement('a');
    link.href = url;
    link.download = 'logs.txt';
    link.click();

    // Clean up the temporary URL
    URL.revokeObjectURL(url);
  };

  /**
   * Fetches logs from the server and updates the logs state.
   */
  const fetchLogs = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/logs');
      const data = await response.text();
      const logArray = data.split(';');
      setLogs(logArray);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  /**
   * Gets the color for a given device ID. If the device ID doesn't have a color assigned, assigns a color from a predefined list.
   * @param {string} deviceId - The device ID.
   * @returns {string} The color associated with the device ID.
   */
  const getLogColor = (deviceId: string) => {
    if (deviceColors.has(deviceId)) {
      return deviceColors.get(deviceId);
    } else {
      const colors = [
        'blue',
        'red',
        'yellow',
        'green',
        'purple',
        'orange',
        'pink',
        'cyan',
        'magenta',
        'lime',
      ]; // Array with the desired colors
      const colorIndex = deviceColors.size % colors.length;
      const color = colors[colorIndex];
      setDeviceColors(new Map(deviceColors.set(deviceId, color)));
      return color;
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => {
      clearInterval(interval);
    };
  },[]);

  useEffect(() => {
    const storedColors = localStorage.getItem('deviceColors');
    if (storedColors) {
      setDeviceColors(new Map(JSON.parse(storedColors)));
    }
  },[]);

  useEffect(() => {
    localStorage.setItem('deviceColors', JSON.stringify(Array.from(deviceColors)));
  }, [deviceColors]);

  return (
    <div className="log-wrapper">
      <div className="card">
        <div className="card-header">Logs</div>
        <div className="card-body">
          <h5 className="card-title">View WoT Playground Logs</h5>
          <div className="log-window  card-text">
            {logs.map((log, index) => {
              const logParts = log.split(',');
              const timestamp = logParts[0];
              const deviceId = logParts[1];
              const logText = logParts.slice(2).join(',');

              const logColor = getLogColor(deviceId);

              return (
                <div key={index} className="log-entry" style={{ color: logColor }}>
                  <span className="timestamp">{timestamp}: </span>
                  <span className="device-id">{deviceId}: </span>
                  <span className="log-text">{logText}</span>
                </div>
              );
            })}
          </div>
          <button className="btn btn-primary" onClick={downloadLogs}>
            Download Logs
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogRepresentation