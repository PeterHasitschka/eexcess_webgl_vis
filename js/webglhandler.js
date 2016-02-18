
var IQHN = IQHN || {};

/**
 * Holding and managing everything for the scene according to web-gl
 * @param {} canvas jQuery object of the canvas
 * @returns {undefined}
 */
IQHN.WebGlHandler = function (canvas) {

    this.canvas_ = canvas;

    this.three_ = {
        scene: null,
        renderer: null,
        camera: null
    };

    this.cameraconfig_ = IQHN.config.three.camera_perspective;
    this.three_.scene = new THREE.Scene();

    //Creating and adding the camera

    if (false)
        this.createOrthoCamera_();
    else
        this.createPerspectiveCamera_();


    this.three_.scene.add(this.three_.camera);

    //var axes = new THREE.AxisHelper(300);
    //this.three_.scene.add(axes);

    this.createRenderer();
};

/**
 * Creating a perspective camera
 */
IQHN.WebGlHandler.prototype.createPerspectiveCamera_ = function () {

    var scene_width = this.canvas_.width();
    var scene_height = this.canvas_.height();
    var camera = new THREE.PerspectiveCamera(
            this.cameraconfig_.FOV,
            scene_width / scene_height,
            this.cameraconfig_.NEAR,
            this.cameraconfig_.FAR
            );
    camera.position.z = 0 + this.cameraconfig_.DISTANCE;
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    camera.updateProjectionMatrix();

    this.three_.camera = camera;
};



/**
 * Creating an orthographic camera
 */
IQHN.WebGlHandler.prototype.createOrthoCamera_ = function () {

    var scene_width = this.canvas_.width();
    var scene_height = this.canvas_.height();

    var aspect = scene_width / scene_height;

    var camera =
            new THREE.OrthographicCamera(
                    scene_width / -2,
                    scene_width / 2,
                    scene_height / -2,
                    scene_height / 2,
                    this.cameraconfig_.NEAR,
                    this.cameraconfig_.FAR
                    );
    this.three_.camera = camera;
};

/**
 * Creating renderer and adding GL-Scene to the canvas
 */
IQHN.WebGlHandler.prototype.createRenderer = function () {

    var background_color = IQHN.config.three.canvas_color;

    var scene_width = this.canvas_.width();
    var scene_height = this.canvas_.height();

    var renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(scene_width, scene_height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(background_color);
    this.canvas_.html(renderer.domElement);
    this.canvas_.hide();
    this.three_.renderer = renderer;
};

/**
 * Calling the THREE-JS Render function
 */
IQHN.WebGlHandler.prototype.render = function () {
    this.three_.renderer.render(this.three_.scene, this.three_.camera);
};

/**
 * 
 * @returns {Three.Scene}
 */
IQHN.WebGlHandler.prototype.getThreeScene = function () {
    return this.three_.scene;
};

/**
 * 
 * @returns {Three.Renderer}
 */
IQHN.WebGlHandler.prototype.getThreeRenderer = function () {
    return this.three_.renderer;
};

/**
 * 
 * @returns {Three.Camera}
 */
IQHN.WebGlHandler.prototype.getCamera = function () {
    return this.three_.camera;
};


/**
 * 
 * @returns Canvas
 */
IQHN.WebGlHandler.prototype.getCanvas = function () {
    return this.canvas_;
};