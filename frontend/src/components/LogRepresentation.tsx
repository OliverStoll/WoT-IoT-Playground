import React, { useEffect, useState } from 'react';

const LogRepresentation = () => {
  const [logs, setLogs] = useState([]);
  const [deviceColors, setDeviceColors] = useState(new Map());

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000); // Daten alle 5 Sekunden aktualisieren

    return () => {
      clearInterval(interval); // Aufräumen beim Unmount
    };
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/logs');
      const data = await response.text();
      const logArray = data.split(';'); // Text mit Semikolon trennen und in ein Array aufteilen
      setLogs(logArray);
    } catch (error) {
      console.error('Fehler beim Abrufen der Logs:', error);
    }
  };

  const getLogColor = (deviceId: string) => {
    if (deviceColors.has(deviceId)) {
      // Wenn die Geräte-ID bereits in der Map vorhanden ist, dieselbe Farbe zurückgeben
      return deviceColors.get(deviceId);
    } else {
      // Wenn die Geräte-ID noch nicht in der Map vorhanden ist, eine neue Farbe generieren
      const color = generateRandomColor();
      // Die Geräte-ID und die generierte Farbe zur Map hinzufügen
      setDeviceColors(new Map(deviceColors.set(deviceId, color)));
      return color;
    }
  };

  const generateRandomColor = () => {
    // Funktion zum Generieren einer zufälligen Farbe
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  return (
    <div style={{
      backgroundColor: 'black',
      border: '1px solid gray',
      padding: '10px',
      width: 'fit-content',
      maxWidth: '80%',
      margin: '10px'
    }}>
      <h1 style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }} className="log-respresentation">Logs</h1>
      <div style={{
        height: '300px',
        width: '500px',
        overflow: 'auto'
      }}
      className="log-window">
        {logs.map((log: string, index) => {
          const deviceId = log.match(/\[(.*?)\]/)[1]; // Geräte-ID aus dem Log-Eintrag extrahieren
          const logText = log.replace(/\[(.*?)\]/, ''); // Geräte-ID aus dem Log-Eintrag entfernen
          const logColor = getLogColor(deviceId); // Farbe für den Log-Eintrag ermitteln

          return (
            <div key={index} 
            style={{ 
              color: logColor,
              padding: '0.5px',
              fontSize: '14px'
             }}>
              <span>{deviceId}: </span>
              <span>{logText}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LogRepresentation;
