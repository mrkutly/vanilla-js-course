const options = {
  SIZE: 10,
  SCALE: 1.5,
};

const optionsInputs = document.querySelectorAll(
  '.controls input[type="range"]'
);

function handleOption(e) {
  const { value, name } = e.currentTarget;

  options[name] = parseFloat(value);
}
optionsInputs.forEach(input => input.addEventListener('input', handleOption));

const video = document.querySelector('.webcam');

const canvas = document.querySelector('.video');
const ctx = canvas.getContext('2d');

const faceCanvas = document.querySelector('.face');
const faceCtx = faceCanvas.getContext('2d');

const faceDetector = new window.FaceDetector({ fastMode: true });

async function populateVideo() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { width: 1280, height: 720 },
  });

  video.srcObject = stream;
  await video.play();

  // set the canvas options.SIZEs
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  faceCanvas.width = video.videoWidth;
  faceCanvas.height = video.videoHeight;
}

function censor({ boundingBox: face }) {
  faceCtx.imageSmoothingEnabled = false;
  faceCtx.clearRect(0, 0, faceCanvas.width, faceCanvas.height);
  // draw the small face
  faceCtx.drawImage(
    // source args
    video, // what is the source
    face.x, // where do we start the source
    face.y,
    face.width, // how high and wide do we go?
    face.height,
    // draw args
    face.x,
    face.y,
    options.SIZE,
    options.SIZE
  );

  const width = face.width * options.SCALE;
  const height = face.height * options.SCALE;
  // take the small face out and blow it up
  faceCtx.drawImage(
    faceCanvas, // now the source is the canvas
    face.x,
    face.y,
    options.SIZE,
    options.SIZE,
    // drawing args
    face.x - (width - face.width) / 2,
    face.y - (height - face.height) / 2,
    width,
    height
  );
}

function drawFace(face) {
  const { width, height, top, left } = face.boundingBox;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = 'lightblue';
  ctx.lineWidth = 2;
  ctx.strokeRect(left, top, width, height);
}

async function detect() {
  const faces = await faceDetector.detect(video);
  faces.forEach(drawFace);
  faces.forEach(censor);
  // ask browser when the next animation frame is and run detect
  requestAnimationFrame(detect);
}

populateVideo().then(detect);
