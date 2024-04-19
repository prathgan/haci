const express = require('express');
const SerialPort = require('serialport').SerialPort;
const { ReadlineParser } = require('@serialport/parser-readline'); // Corrected import statement
const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const arduinoPort = new SerialPort({ path: '/dev/cu.usbmodem21401', baudRate: 9600 });

// Create a Readline parser
const parser = arduinoPort.pipe(new ReadlineParser({ delimiter: '\r\n' }))

// Listen for the 'data' event on the parser
parser.on('data', data => {
  console.log('Data from Arduino:', data);
});

app.post('/control-motor', (req, res) => {
  const { motor, action } = req.body;
  const command = `${motor}:${action}\n`;
  console.log("command: " + command);

  arduinoPort.write(command, (err) => {
    if (err) {
      console.error('Failed to send command to Arduino:', err);
      if (!res.headersSent) {
        res.status(500).send('Failed to send command to Arduino');
      }
      return;
    }

    console.log('Command sent successfully');
    if (!res.headersSent) {
      res.send('Command sent successfully');
    }
  });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});