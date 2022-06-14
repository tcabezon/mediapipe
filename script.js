const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');
const landmarkContainer = document.getElementsByClassName('landmark-grid-container')[0];
const controlsElement = document.getElementsByClassName('control-panel')[0];


var model1ON = false
var model2ON = false
var model3ON = false
var connectorsColor = '#FF1694'
var landmarksColor = '#FFFFFF'

// pose detection button ON/OFF
const m1Button = document.getElementById('m1Button');
m1Button.addEventListener('click', activateModel1);

// segmentation button ON/OFF
const segmentationButton = document.getElementById('segmentationButton');
segmentationButton.addEventListener('click', updateSegmentation);
var segmentationON = false

// hand detection button ON/OFF
const m2Button = document.getElementById('m2Button');
m2Button.addEventListener('click', activateModel2);

// face detection button ON/OFF
const m3Button = document.getElementById('m3Button');
m3Button.addEventListener('click', activateModel3);

function activateModel1() {
    model1ON = !model1ON
    if (model1ON) {
        model2ON = false //only one model can be on
        m2Button.classList.remove('clicked');
        model3ON = false //only one model can be on
        m3Button.classList.remove('clicked');
        
        m1Button.classList.add('clicked');
        segmentationButton.classList.remove('removed')
    }
    else {
        m1Button.classList.remove('clicked');
        segmentationButton.classList.add('removed')
    }
    console.log('changed model1 to', model1ON)
}
function activateModel2() {
    model2ON = !model2ON
    if (model2ON) {
        m2Button.classList.add('clicked');
        model1ON = false //only one model can be on
        m3Button.classList.remove('clicked');
        model3ON = false //only one model can be on
        m1Button.classList.remove('clicked');
        segmentationButton.classList.add('removed')
    }
    else {
        m2Button.classList.remove('clicked');

    }
    console.log('changed model2 to', model2ON)
}
function activateModel3() {
    model3ON = !model3ON
    if (model3ON) {
        m3Button.classList.add('clicked');
        model1ON = false //only one model can be on
        m1Button.classList.remove('clicked');
        model2ON = false //only one model can be on
        m2Button.classList.remove('clicked');
        
        segmentationButton.classList.add('removed')
    }
    else {
        m3Button.classList.remove('clicked');

    }
    console.log('changed model3 to', model2ON)
}



// console.log('starting with segmentation set to', segmentationON)
function updateSegmentation() {
    segmentationON = !segmentationON
    console.log('segmentation set to', segmentationON)
    if (segmentationON) {
        segmentationButton.classList.add('clicked');
    }
    else {
        segmentationButton.classList.remove('clicked');
    }
    pose.setOptions({ enableSegmentation: segmentationON })
    // if (segmentationON ) model1ON=true
    // else model1ON=false
}

var once = true

// const controls = window;
// const fpsControl = new controls.FPS();

//3D Grid 
var gridON = false
if (gridON) {
    var grid = new LandmarkGrid(landmarkContainer);
}

function drawVideo() {
    ctx.drawImage(video, 0, 0, 256, 256);
}

/////////////////////////////
// POSE
////////////////////////////

const pose = new Pose({
    locateFile: (file) => {
        console.log('`https://cdn.jsdelivr.net/npm/@mediapipe/pose/' + file)
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
    }
});


pose.setOptions({
    selfieMode: true,
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: false,
    smoothSegmentation: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
    effect: 'background',
});

pose.onResults(poseResults);

function poseResults(results) {
    if (!results.poseLandmarks) {
        if (gridON) {
            grid.updateLandmarks([]);
        }
        return;
    }

    //plot results once to view filetype
    // if (once) {
    //     console.log(results)
    //     console.log(pose)
    //     once = false
    // }

    canvasCtx.save();

    // Update the frame rate.
    // fpsControl.tick();

    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    // segmentation mask
    if (results.segmentationMask) {
        canvasCtx.globalAlpha = 1 //opacity change
        canvasCtx.drawImage(
            results.segmentationMask, 0, 0, canvasElement.width,
            canvasElement.height);
        canvasCtx.globalAlpha = 1




        // // Only overwrite existing pixels in a different color
        // canvasCtx.globalCompositeOperation = 'source-in';
        // canvasCtx.fillStyle = '#00FF00';
        // canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);

        // // Remove background
        canvasCtx.globalCompositeOperation = 'source-out';
        canvasCtx.fillStyle = '#FFFFFF';
        canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);
    }

    // Show video
    canvasCtx.globalCompositeOperation = 'destination-atop';
    canvasCtx.drawImage(
        //result.image is the original video
        results.image, 0, 0, canvasElement.width, canvasElement.height);
    // show landmarks
    //points
    canvasCtx.globalCompositeOperation = 'source-over';
    drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS,
        { color: connectorsColor, lineWidth: 6 });
    //lines
    drawLandmarks(canvasCtx, results.poseLandmarks,
        { color: landmarksColor, lineWidth: 4 });

    canvasCtx.restore();

    if (gridON) {
        grid.updateLandmarks(results.poseWorldLandmarks);
    }

}

/////////////////////////////
// HAND
////////////////////////////

const hands = new Hands({
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    }
});

hands.setOptions({
    maxNumHands: 4,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
    selfieMode: true,
});

hands.onResults(handResults);

function handResults(results) {
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(
        results.image, 0, 0, canvasElement.width, canvasElement.height);
    if (results.multiHandLandmarks) {
        for (const landmarks of results.multiHandLandmarks) {
            drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS,
                { color: connectorsColor, lineWidth: 5 });
            drawLandmarks(canvasCtx, landmarks, { color: landmarksColor, lineWidth: 2 });
        }
    }
    canvasCtx.restore();
}


/////////////////////////////
// FACE
////////////////////////////

const faceMesh = new FaceMesh({
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
    }
});

faceMesh.setOptions({
    selfieMode:true,
    maxNumFaces: 5,
    refineLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});
faceMesh.onResults(faceResults);

function faceResults(results) {
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(
        results.image, 0, 0, canvasElement.width, canvasElement.height);
    if (results.multiFaceLandmarks) {
        for (const landmarks of results.multiFaceLandmarks) {
            drawConnectors(canvasCtx, landmarks, FACEMESH_TESSELATION,
                { color: landmarksColor, lineWidth: 0.5 });
            drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_EYE, { color: connectorsColor });
            drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_EYEBROW, { color: connectorsColor });
            drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_IRIS, { color:connectorsColor });
            drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_EYE, { color: connectorsColor });
            drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_EYEBROW, { color: connectorsColor });
            drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_IRIS, { color: connectorsColor });
            drawConnectors(canvasCtx, landmarks, FACEMESH_FACE_OVAL, { color: landmarksColor});
            drawConnectors(canvasCtx, landmarks, FACEMESH_LIPS, { color: connectorsColor });
        }
    }
    canvasCtx.restore();
}

const camera = new Camera(videoElement, {
    onFrame: async () => {

        if (model2ON) {
            videoElement.classList.add('removed')
            videoElement.classList.remove('shown')
            canvasElement.classList.add('shown')
            await hands.send({ image: videoElement });
        }
        else if (model1ON) {
            videoElement.classList.add('removed')
            videoElement.classList.remove('shown')
            canvasElement.classList.add('shown')
            await pose.send({ image: videoElement });
        }
        else if (model3ON) {
            videoElement.classList.add('removed')
            videoElement.classList.remove('shown')
            canvasElement.classList.add('shown')
            await faceMesh.send({ image: videoElement });
        }


        else {
            canvasElement.classList.add('removed')
            canvasElement.classList.remove('shown')
            videoElement.classList.add('shown')
        }
    },
    width: 1280,
    height: 720
});
camera.start();