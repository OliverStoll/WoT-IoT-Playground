# 🌐 Web of Things Playground

This repository hosts a Docker-based Web of Things (WoT) Playground — a platform to explore and interact with both local and remote IoT devices. Its primary goal is to help users understand the [W3C Web of Things](https://www.w3.org/WoT/) standard through hands-on experimentation.

The Web of Things standard promotes interoperability, standardization of data formats, and secure communication between devices by defining abstract descriptions of Things. This application allows users to define multiple devices via configuration files, interact with them, and observe communication flows.


## 🧭 Table of Contents

- [🧱 Architecture](#-architecture)
- [🚀 Install and Run](#-install-and-run)
- [📖 User Manual](#-user-manual)
- [🛠️ Local Development](#️-local-development)
- [📡 API Documentation](#-api-documentation)
- [📬 Contact Information](#-contact-information)


## 🧱 Architecture

The system consists of three components:
- **Frontend**: User interface for uploading files and viewing logs.
- **Backend**: Central coordinator for logging, device lifecycle, and API routing.
- **Docker Playground**: Simulated WoT devices launched as containers.

Interaction flow:
1. Users upload configuration and playbook files via the frontend.
2. Backend initializes containers based on configuration.
3. Frontend displays interactive representations of devices (Things).
4. Users trigger actions or property updates via the Thing API.
5. Logs and outputs are centrally collected for transparency.

![Architecture](./examples/applicationScreenshots/Architecture%20Diagram.png)


## 🚀 Install and Run

Run everything with one command using Docker.

### ✅ Requirements
- Docker (≥ 20.2.0, tested as root)
- Docker Compose
- Git

### 📦 Setup

```bash
git clone https://git.tu-berlin.de/f2499r/web-of-things-playground.git
cd web-of-things-playground
docker-compose up
```

In order to install the playground clone the repository. 

```
git clone https://github.com/OliverStoll/web-of-things-playground.git
```
Change the directory
```
cd web-of-things-playground
```
Run the application via docker compose
```
docker-compose up
```
The Docker Images will be initialized automatically and afterwards the the application will
be available under the following url:

`http://localhost:5173/`

## 📖 User Manual

This section explains how to use the Playground to simulate Web of Things (WoT) scenarios. Sample files are included for each feature.

> ℹ️ Ensure the application is running properly (Docker Compose recommended).



### 📝 Uploading a Configuration File

#### 📁 Configuration Structure

A configuration file must define:
- `devices`: A list of local Things with required fields: `title`, `description`, `properties`, `actions`, and `events`.
- `externalDevices`: (optional) A list of URLs pointing to remote Things' descriptions.


```
{
  "devices": [
    {
      "title": "Thing title",
      "description": "This is a Thing",
      "properties": { 
        ... 
      },
      "actions": {
        ... 
      },
      "events": {
        ...
      }
    }
  ],
  "externalDevices": [
    "http://plugfest.thingweb.io:8083/smart-coffee-machine"
  ]
}
```

For further examples: See `examples/scenario.json`.

#### ⬆️ Uploading the File

Upload via drag-and-drop or by selecting the file. After processing, local Things are shown as `created`, remote ones as `added`. The interface marks remote Things accordingly.



### 🧾 Getting and Updating a Property

1. Click on a Thing to view its `properties`, `actions`, and `events`.
2. Property values load automatically.
3. To update: click the field, enter a new value, and press **Enter**.
4. Logs will reflect the changes and display all triggered requests.

💡 For reduced log verbosity, use a playbook (see below).


### 🎛️ Calling an Action

Two types are supported:
- **Without parameters**: Click the action directly.
- **With URI parameters**: Edit the pre-filled string (e.g., `makeDrink?drinkId=espresso&size=s&quantity=3`) and press **Enter**.

📌 Actions with parameters in the body are **not supported**.



### 🔄 Interaction Between Things

Things can interact with each other using the **remote** icon at the top-right of each Thing.

#### ⚙️ Properties and Actions

1. Open the interaction menu.
2. Select a target Thing.
3. Trigger properties or actions like usual.

#### 📡 Event Subscription

1. Choose an event in the interaction menu.
2. The Thing subscribes and waits.
3. Trigger the corresponding event from the emitting Thing (via action call).



### 🧩 Executing a Playbook

Playbooks automate multi-step interactions.

#### 🗂️ File Format

A playbook must contain:
- `steps`: an array of action/property steps with `deviceId`, `type`, and `value`.
- Optional: a `sleep` step to add a delay (in seconds).


Here is an example based on the examples/scenario.json Configuration file:
```
{
  "steps": [
    {
      "deviceId": "Coffee-machine",
      "type": "property",
      "value": "temperature"
    },
    {
      "deviceId": "Coffee-machine",
      "type": "action",
      "value": "brew_coffee"
    },
    {
      "deviceId": "Smart Fridge",
      "type": "action",
      "value": "make_request?method=GET&url=http://localhost:3000/coffee-machine/properties/temperature"
    },
    {
      "sleep": 5
    }
  ]
}
```

Further example available in `examples/playbook_scenario.json`.

#### ▶️ Upload and Execute

Upload a playbook using the file upload interface. Steps will be executed sequentially. You may upload another playbook after completion.



### 📥 Downloading Logs

Click the **Download** button at the top-right of the log window to save logs as a `.txt` file.



### 🛑 Shutdown Things

Click **Shutdown** to terminate all simulated Things. This stops and removes the containers. You can then upload a new configuration or exit Docker Compose.



## 📡 API Documentation

Controller API docs are accessible at:

[http://localhost:5001/api-docs](http://localhost:5001/api-docs)



## 🛠️ Local Development

To run the frontend and backend locally (without Docker Compose):

- **Backend**: 
```
cd backend
npm install
npx nodemon
```

Start the frontend:

- **Frontend**: 
```
cd frontend
npm install
npm run dev
```

Refer to the individual `README` files in each folder for more.


## 🤝 Contributing

Contributions are welcome!  
→ Just open a PR, or start a discussion in Issues.
