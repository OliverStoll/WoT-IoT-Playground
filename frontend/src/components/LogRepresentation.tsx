import {useEffect, useState} from 'react'
import './component_css/LogRepresentationStyle.css'

const urlLogs = 'http://localhost:5001/api/logs'

/**
 * Component that displays logs fetched from the server.
 */
const LogRepresentation = () => {
  const [logs, setLogs] = useState<string[]>([])
  const [deviceColors, setDeviceColors] = useState(new Map())

  const downloadLogs = (): void => {
    // Create a string from the logs array
    const logString: string = logs.join('\n')

    // Create a Blob object with the log string
    const blob: Blob = new Blob([logString], { type: 'text/plain' })

    // Create a temporary URL for the Blob object
    const url: string = URL.createObjectURL(blob)

    // Create a link element and simulate a click to trigger the download
    const link: HTMLAnchorElement = document.createElement('a')
    link.href = url
    link.download = 'logs.txt'
    link.click()

    // Clean up the temporary URL
    URL.revokeObjectURL(url)
  }

  /**
   * Fetches logs from the server and updates the logs state.
   */
  const fetchLogs = async (): Promise<void> => {
    try {
      const response: Response = await fetch(urlLogs)
      const data: string = await response.text()
      const logArray: string[] = data.split(';')
      setLogs(logArray)
    } catch (error) {
      console.error('Error fetching logs:', error)
    }
  }

  /**
   * Gets the color for a given device ID.
   * If the device ID doesn't have a color assigned, assigns a color from a predefined list.
   * @param {string} deviceId - The device ID.
   * @returns {string} The color associated with the device ID.
   */
  const getLogColor = (deviceId: string): any | string => {
    if (deviceColors.has(deviceId)) {
      return deviceColors.get(deviceId)
    } else {
      const colors: string[] = [
        'lime',
        'orange',
        'turquoise',
        'yellow',
        'purple',
        'red',
        'green',
        'cyan',
        'magenta',
        'blue',
      ] // Array with the desired colors
      const colorIndex: number = deviceColors.size % colors.length
      const color: string = colors[colorIndex]
      setDeviceColors(new Map(deviceColors.set(deviceId, color)))
      return color
    }
  }

  /**
   * Calls the fetchLogs() function every 5 seconds.
   */
  useEffect(() => {
    fetchLogs().then((r: void) => r)
    const interval: any = setInterval(fetchLogs, 1000)
    return (): void => {
      clearInterval(interval)
    }
  },[])

  /**
   * Gets the colors for the different things
   */
  useEffect((): void => {
    const storedColors: string | null = localStorage.getItem('deviceColors')
    if (storedColors) {
      setDeviceColors(new Map(JSON.parse(storedColors)))
    }
  },[])

  /**
   * Sets the colors for the different things
   */
  useEffect((): void => {
    localStorage.setItem('deviceColors', JSON.stringify(Array.from(deviceColors)))
  }, [deviceColors])

  // div to show all the logs
  return (
    <div style={{marginTop: '1em'}} className="log-wrapper">
        <div className="header">
          Logs
          <button className="btn btn-primary" onClick={downloadLogs}>DOWNLOAD</button>
        </div>
        <div className="log-window  card-text">
          {logs.map((log: string, index: number) => {
            const logParts: string[] = log.split(',')
            const timestamp: string = logParts[0]
            const deviceId: string = logParts[1]
            const logText: string = logParts.slice(2).join(',')
            const logColor = getLogColor(deviceId)
            return (
              <div key={index} className="log-entry" style={{ color: logColor}}>
                <span style={{fontFamily: "monospace" }} className="timestamp">{timestamp}</span>
                <span style={{fontFamily: "monospace" }} className="device-id">{deviceId} -</span>
                <span style={{fontFamily: "monospace" }} className="log-text">{logText}</span>
              </div>
            )
          })}
        </div>
    </div>
  )
}

export default LogRepresentation