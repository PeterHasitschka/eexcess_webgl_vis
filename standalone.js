var my_scene;

jQuery(document).ready(function () {

    my_scene = new GLVIS.Scene(jQuery('#webgl_canvas_container'));
    
    var g1 = new GLVIS.Collection();
    
    var r1 = new GLVIS.Result();
    var r2 = new GLVIS.Result();
    var r3 = new GLVIS.Result();
    
    g1.addResult(r1);
    g1.addResult(r2);
    g1.addResult(r3);
    
    my_scene.addCollection(g1);
    
    animate();
});


function animate() {

    requestAnimationFrame(animate);
    my_scene.render();
}