import React, { useEffect, useState } from 'react';
import './LogRepresentationStyle.css';

/**
 * Component that displays logs fetched from the server.
 */
const LogRepresentation = () => {
  const [logs, setLogs] = useState([]);
  const [deviceColors, setDeviceColors] = useState(new Map());

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
  }, []);

  useEffect(() => {
    const storedColors = localStorage.getItem('deviceColors');
    if (storedColors) {
      setDeviceColors(new Map(JSON.parse(storedColors)));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('deviceColors', JSON.stringify(Array.from(deviceColors)));
  }, [deviceColors]);

  return (
    <div className="log-wrapper">
      <h1 className="log-heading">Logs</h1>
      <div className="log-window">
        {logs.map((log: string, index) => {
          const deviceId = log.match(/\[(.*?)\]/)[1];
          const logText = log.replace(/\[(.*?)\]/, '');
          const logColor = getLogColor(deviceId);

          return (
            <div
              key={index}
              className="log-entry"
              style={{ color: logColor }}
            >
              <span className="device-id">{deviceId}: </span>
              <span className="log-text">{logText}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LogRepresentation;
