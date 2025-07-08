# WebSocket Server for LLM Mockup

## Install Dependencies

```bash
cd websocket-server
npm install
```

## Start Server

```bash
npm start
```

Server will run on port 2025.

## Connection Endpoints

- **Quest 3 Connection**: `ws://[Local IP]:2025/quest`
- **Frontend Connection**: `ws://localhost:2025/frontend`

## Usage

1. Start the server
2. Click the "WS: OFF" button in the top-right corner of the frontend interface to enable WebSocket mode
3. Quest 3 connects to the server and sends data
4. Server automatically handles data flow and LLM responses

## Data Format

Quest should send simplified name-value data in the following format:

```json
[
  {"name": "location", "value": "Home"},
  {"name": "mood", "value": "happy"},
  {"name": "time", "value": "18:00"},
  {"name": "weather", "value": null}
]
```

### Data Processing Flow

1. **Quest sends simplified data** - Only name-value pairs
2. **Server forwards to frontend** - No processing on server side
3. **Sift module filters data** - Matches names with existing context items
4. **Only enabled items are updated** - User controls what gets processed via UI toggles
5. **WebSocket display shows received values** - Visual feedback under each context item

### Processing Rules

- **Name matching**: Only updates context items with matching names
- **Null values**: Items with `null` values are ignored
- **Type agnostic**: Works with `selection`, `input`, and `image` types
- **Validation**: No type validation - values are applied directly
- **Unmatched names**: Ignored silently
- **Disabled items**: Values are received and displayed but not applied to prompts

### UI Features

- **Toggle control**: Users can enable/disable which context items receive updates
- **WebSocket display**: Shows received values under each context item
- **Visual feedback**: Different colors for enabled/disabled/received states 