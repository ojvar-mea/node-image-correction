const express = require('express');
const path = require('path');
const fs = require('fs');
const glob = require('glob');
const app = express();
const sharp = require('sharp');
var cors = require('cors');

const PORT = +(process.env.PORT || '4000');
const HOST = process.env.HOST || '127.0.0.1';
const SCHEMA = 'http';

app.use(express.urlencoded({ extended: true }));
app.use(express.json({ extended: true }));
app.use(cors());
app.post('/directories', getDirectoryHandler);
app.post('/files', getFilesHandler);
app.post('/process', processImageHandler);
app.listen(PORT, HOST, () => {
  console.log(`Server is listening on ${SCHEMA}://${HOST}:${PORT}`);
});

async function getDirectoryHandler(request, response) {
  if (!fs.existsSync(request.body.path)) {
    response.send(422, 'Invalid Path').end();
    return;
  }

  const searchPath = path.resolve(request.body.path, '**/*');
  glob(searchPath, {}, (err, files) => {
    files = files.filter((x) => fs.lstatSync(x).isDirectory());
    files.unshift(request.body.path);
    response.send(files).end();
  });
}

async function getFilesHandler(request, response) {
  if (!fs.existsSync(request.body.path)) {
    response.send(422, 'Invalid Path').end();
    return;
  }

  const searchPath = path.resolve(request.body.path, '@(*.jpeg|*.jpg)');
  glob(searchPath, {}, (err, files) => {
    files = files.filter((x) => fs.lstatSync(x).isFile());
    response.send(files).end();
  });
}

async function processImageHandler(request, response) {
  const { filename, brightness, rotate, destination, basePath } = request.body;
  if (!fs.existsSync(filename) || !destination || !basePath) {
    response.status(422).send('Invalid Path').end();
    return;
  }
  console.log('Process file ', filename);

  /* Set destination */
  const newPath = path.resolve(
    destination,
    filename.substr(basePath.length + 1)
  );
  fs.mkdirSync(path.dirname(newPath), { recursive: true });

  /* Do Process */
  const image = await sharp(filename);

  if (brightness) {
    await image.modulate({ brightness: +brightness });
  }
  if (rotate) {
    await image.rotate(+rotate);
  }

  /* Write to destination */
  await image.toFile(newPath);

  response.send(200);
}
