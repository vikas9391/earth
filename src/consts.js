// consts.js 
window.consts = {

    scene: null,

    camera: null,
    cameraTarget: "auto",

    globeMaxZoom: 90,
    globeMinZoom: 300,
    targetCameraZ: 230,

    renderer: null,

    rotationObject: null,
    earthObject: null,

    // UPDATED COLORS - Change these to customize your Earth!
    colorPrimary: "#4a90e2",    // Main blue color (was #33CCFF)
    colorDarken: "#1a3a5c",     // Dark blue for shading (was #000000)
    
    // Alternative color schemes you can try:
    // Realistic Earth blue:
    // colorPrimary: "#4a90e2",
    // colorDarken: "#1a3a5c",
    
    // Green Earth:
    // colorPrimary: "#00ff88",
    // colorDarken: "#004422",
    
    // Red/Mars:
    // colorPrimary: "#ff6644",
    // colorDarken: "#330000",
    
    // Purple/Alien:
    // colorPrimary: "#aa44ff",
    // colorDarken: "#220044",
    
    globeRadius: 65,
    toRAD: Math.PI / 180,

    mouse: {
        isMouseDown: false,
        isMouseMoved: false,

        mouseXOnMouseDown: 0,
        mouseYOnMouseDown: 0,

        targetRotationX: .45,
        targetRotationY: 0,
        targetRotationXOnMouseDown: 0,
        targetRotationYOnMouseDown: 0
    },

    lights: {
        lightShieldIntensity: 1.25,
        lightShieldDistance: 400,
        lightShieldDecay: 2.0,
    },
    stars:{
        maxDistance:400,
        minDistance:100,
        number:500,
        size:2,
    }
}

export default consts