
var GLVIS = GLVIS || {};

/**
 * Holding and managing everything for the scene according to web-gl
 * @param {} canvas jQuery object of the canvas
 * @returns {undefined}
 */
GLVIS.WebGlHandler = function (canvas) {

    this.canvas_ = canvas;

    this.three_ = {
        scene: null,
        renderer: null,
        camera: null
    };

    this.cameraconfig_ = GLVIS.config.three.camera_perspective;
    this.three_.scene = new THREE.Scene();

    //Creating and adding the camera

    if (false)
        this.createOrthoCamera_();
    else
        this.createPerspectiveCamera_();


    this.three_.scene.add(this.three_.camera);

    var axes = new THREE.AxisHelper(300);
    this.three_.scene.add(axes);

    this.createRenderer();
};

/**
 * Creating a perspective camera
 */
GLVIS.WebGlHandler.prototype.createPerspectiveCamera_ = function () {

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
GLVIS.WebGlHandler.prototype.createOrthoCamera_ = function () {

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
GLVIS.WebGlHandler.prototype.createRenderer = function () {

    var background_color = GLVIS.config.three.canvas_color;

    var scene_width = this.canvas_.width();
    var scene_height = this.canvas_.height();

    var renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
    renderer.setSize(scene_width, scene_height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(background_color);
    this.canvas_.html(renderer.domElement);
    this.canvas_.hide();
    this.three_.renderer = renderer;
    renderer.setClearColor(0xffffff, 0);
};

/**
 * Calling the THREE-JS Render function
 */
GLVIS.WebGlHandler.prototype.render = function () {
    this.three_.renderer.render(this.three_.scene, this.three_.camera);
};

/**
 * 
 * @returns {Three.Scene}
 */
GLVIS.WebGlHandler.prototype.getThreeScene = function () {
    return this.three_.scene;
};

/**
 * 
 * @returns {Three.Renderer}
 */
GLVIS.WebGlHandler.prototype.getThreeRenderer = function () {
    return this.three_.renderer;
};

/**
 * 
 * @returns {Three.Camera}
 */
GLVIS.WebGlHandler.prototype.getCamera = function () {
    return this.three_.camera;
};


/**
 * 
 * @returns Canvas
 */
GLVIS.WebGlHandler.prototype.getCanvas = function () {
    return this.canvas_;
};