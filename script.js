const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');
const landmarkContainer = document.getElementsByClassName('landmark-grid-container')[0];
const controlsElement =document.getElementsByClassName('control-panel')[0];

// segmentation button ON/OFF
const segmentationButton = document.getElementById('segmentationButton');
segmentationButton.addEventListener('click', updateSegmentation);

var segmentationON=true
function updateSegmentation(){
    segmentationON=!segmentationON
    console.log('segmentation set to',segmentationON)
    pose.setOptions({enableSegmentation: segmentationON})

}

var once = true

const controls = window;
const fpsControl = new controls.FPS();

//3D Grid 
var gridON=false
if (gridON){
var grid = new LandmarkGrid(landmarkContainer);}


function plotResults(results) {
    if (!results.poseLandmarks) {
        if(gridON){
        grid.updateLandmarks([]);
        }
        return;
    }

    if (once) {
        console.log(results)
        console.log(pose)
        once = false
    }
    canvasCtx.save();
    // Update the frame rate.
    // fpsControl.tick();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    // segmentation mask
    if (results.segmentationMask) {
        canvasCtx.globalAlpha = 0.4 //opacity change
        canvasCtx.drawImage(
            results.segmentationMask, 0, 0, canvasElement.width,
            canvasElement.height);
            canvasCtx.globalAlpha = 1
    
    
    

    // // Only overwrite existing pixels in a different color
    // canvasCtx.globalCompositeOperation = 'source-in';
    // canvasCtx.fillStyle = '#00FF00';
    // canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);
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
        { color: '#00FF00', lineWidth: 4 });
    //lines
    drawLandmarks(canvasCtx, results.poseLandmarks,
        { color: '#FF0000', lineWidth: 2 });

    canvasCtx.restore();
    
    if(gridON){
    grid.updateLandmarks(results.poseWorldLandmarks);   }
    
}

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
    enableSegmentation: true,
    smoothSegmentation: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

pose.onResults(plotResults);

const camera = new Camera(videoElement, {
    onFrame: async () => {
        await pose.send({ image: videoElement });
    },
    width: 1280,
    height: 720
});
camera.start();