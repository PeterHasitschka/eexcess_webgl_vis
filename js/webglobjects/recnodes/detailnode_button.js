var GLVIS = GLVIS || {};

/**
 * Create a button for rec-detail-nodes with actions, icons etc.
 * 
 * @param {GLVIS.RecommendationDetailNode} parent_node Detail node were button gets added
 * @param {object} options key-values: action, icon, visible
 */
GLVIS.RecDetailNodeButton = function (parent_node, options) {

    var config = GLVIS.config.collection.recommendation.detail_node.button;

    this.webgl_objects_ = {
        parent: parent_node.getGroupMesh(),
        circle: null,
        icon: null,
        label: null
    };

    this.parent_ = parent_node;

    this.click_action_ = options.action || null;
    this.icon_ = options.icon || null;
    this.visible_ = options.visible || false;
    this.title_ = options.title || null;

    this.pos = {
        x: null,
        y: null,
        z: config.z_offset
    };

    this.initAndRegisterGlObj(this.webgl_objects_.parent);

    this.dirty_ = true;
};

/**
 * Callback for mouseover action.
 * Button gets registered for unhovering (@see{GLVIS.InteractionHandler})
 */
GLVIS.RecDetailNodeButton.prototype.hover = function () {
    this.webgl_objects_.circle.material.color.setHex(GLVIS.config.collection.recommendation.detail_node.button.hovercolor);

    if (this.webgl_objects_.label) {
        this.webgl_objects_.label.setIsVisible(true);
        //this.webgl_objects_.label.render();
    }
    GLVIS.RecDetailNodeButton.current_hovered = this;
    GLVIS.RecDetailNodeButton.new_hovered = true;
    this.setIsDirty(true);
};

/**
 * Called by @see{GLVIS.InteractionHandler} if button is not registered as hovered in current raycast
 */
GLVIS.RecDetailNodeButton.prototype.unhover = function () {


    if (!this.webgl_objects_.circle)
        return;
    this.webgl_objects_.circle.material.color.setHex(0xFFFFFF);

    if (this.webgl_objects_.label) {
        this.webgl_objects_.label.setIsVisible(false);
        this.webgl_objects_.label.render();
    }
    this.setIsDirty(true);
};

/**
 * Create and add webgl-objects to scene
 * @param {THREE.Mesh} parent_node ThreeJS Node handled as parent for the button. Comes from rec-detail-node
 */
GLVIS.RecDetailNodeButton.prototype.initAndRegisterGlObj = function (parent_node) {

    var config = GLVIS.config.collection.recommendation.detail_node.button;

    var circleMaterial = new THREE.MeshBasicMaterial(
            {
                color: 0xFFFFFF,
                transparent: true,
                side: THREE.DoubleSide
            });

    var circle = new THREE.Mesh(
            new THREE.CircleGeometry(
                    config.size,
                    config.segments),
            circleMaterial);

    this.webgl_objects_.circle = circle;
    parent_node.add(circle);


    var icon_mesh = new THREE.Mesh(
            new THREE.CircleGeometry(
                    config.icon_size,
                    config.segments),
            circleMaterial);

    this.webgl_objects_.icon = icon_mesh;
    parent_node.add(icon_mesh);

    if (this.icon_) {
        var icon_path = GLVIS.config.scene.media_folder + this.icon_;

        THREE.ImageUtils.loadTexture(icon_path, {}, function (texture) {

            GLVIS.Debugger.debug("RecDetailNodeButton", "Icon loaded. Creating texture", 5);
            texture.minFilter = THREE.LinearMipMapLinearFilter;
            icon_mesh.material = new THREE.MeshBasicMaterial({
                map: texture,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 1,
                color: 0xFFFFFF

            });
            texture.flipY = true;
            texture.needsUpdate = true;

            this.setIsDirty(true);
        }.bind(this));
    }

    if (this.title_) {
        var label = new GLVIS.Text(
                this.title_,
                {
                    font_size: config.label.font_size,
                    render_factor: config.label.render_factor,
                    bg_color: config.label.bg_color,
                    highlight_activated: false
                },
        null,
                null,
                null,
                null,
                null,
                parent_node
                );
        label.setIsVisible(false);
        this.webgl_objects_.label = label;
    }
};

/**
 * Set the (relative position of the button to the rec-node's center
 * @param {float} x
 * @param {float} y
 */
GLVIS.RecDetailNodeButton.prototype.setPosition = function (x, y) {

    if (x !== null)
        this.pos.x = x;

    if (y !== null && y !== undefined)
        this.pos.y = y;

    this.setIsDirty(true);
};


/**
 * Setting the visibility of the button
 * @param {bool} visible
 */
GLVIS.RecDetailNodeButton.prototype.setIsVisible = function (visible) {
    if (visible !== this.visible_)
        this.setIsDirty(true);
    this.visible_ = visible;
};


GLVIS.RecDetailNodeButton.prototype.setIsDirty = function (dirty) {
    this.dirty_ = dirty;

    if (dirty)
        this.parent_.setIsDirty(dirty);
};

GLVIS.RecDetailNodeButton.prototype.getIsDirty = function () {
    return this.dirty_;
};

/**
 * Rendering the button if dirty.
 * The interactions are set here dynamically because they depend on the visibility
 * of the button
 */
GLVIS.RecDetailNodeButton.prototype.render = function () {

    if (!this.dirty_)
        return;

    if (!this.webgl_objects_.circle) {
        this.dirty_ = false;
        return;
    }


    var c = this.webgl_objects_.circle;

    c.visible = this.visible_;

    if (c.visible) {
        c.interaction = {
            "mouseclick": this.click_action_,
            "mouseover": this.hover.bind(this),
            "interaction_singleclick_exclusive": true
        };
    }
    else
        c.interaction = null;

    c.position.set(
            this.pos.x,
            this.pos.y,
            this.pos.z
            );

    var i = this.webgl_objects_.icon;
    i.visible = this.visible_;
    i.position.set(
            this.pos.x,
            this.pos.y,
            this.pos.z + 0.1
            );

    /** @type {GLVIS.Text} **/
    var label = this.webgl_objects_.label;
    if (label) {
        var y_offset = GLVIS.config.collection.recommendation.detail_node.button.label.y_offset;
        //label.setIsVisible(this.visible_);
        label.setPosition(this.pos.x, this.pos.y + y_offset, this.pos.z + 0.1);
        label.render();
    }

    this.dirty_ = false;
};

/**
 * Deleting webgl-objects
 */
GLVIS.RecDetailNodeButton.prototype.delete = function () {
    delete this.webgl_objects_.circle;
    delete this.webgl_objects_.icon;

    if (this.webgl_objects_.label) {
        this.webgl_objects_.label.delete();
        delete this.webgl_objects_.label;
    }
};




/** @type {GLVIS.RecDetailNodeButton} **/
GLVIS.RecDetailNodeButton.current_hovered = null;
GLVIS.RecDetailNodeButton.new_hovered = false;