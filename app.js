(function () {

    let zoomlevel = 0;		//1 2 3 4

    //grab a bunch of elements

    let img = document.querySelector(".image");
    let zi = document.querySelector(".zoomed-image");
    let zoomSlider = document.querySelector(".slider");
    let resetBtn = document.querySelector(".reset-camera");
    let zoomInBtn = document.querySelector(".zoom-in");
    let zoomOutBtn = document.querySelector(".zoom-out");

    //let zoomButton = document.querySelector(".zoom-button");

    console.log("Started....");

    function loadImage() {
        //console.log("Getting new image");
        let http = new XMLHttpRequest();
        http.addEventListener("load", (p, r) => {
            if (http.status === 200 && http.response.length !== 0) {
                let du = "data:image/jpg;base64," + http.response;
                let el = document.querySelector(".image");
                el.setAttribute("src", du);
            }
            setTimeout(loadImage, 500);
        });
        http.open("GET", "/api/getImage");
        http.send();
    }	//load image

    window.addEventListener("resize", e => {
        //zoom();
    });

    resetBtn.addEventListener("click", () => {
        console.log("reset button clicked");
	zoomlevel = 0;
        let http = new XMLHttpRequest();
        http.open("POST", "/api/resetCamera");
        http.send();
    });

    zoomInBtn.addEventListener("click", () => {
	console.log("zoom in " + zoomlevel);
	if (zoomlevel >= 4)
		return;

	zoomlevel += 1;
	//zoomlevel = Number.parseFloat(zoomlevel).toFixed(1);
	let http = new XMLHttpRequest();
	http.open("POST", "/api/zoomIn");
	http.send(zoomlevel / 10.0);
    });

    zoomOutBtn.addEventListener("click", () => {
	if (zoomlevel <= 0)
		return;

	zoomlevel -= 1;
	let http = new XMLHttpRequest();
	http.open("POST", "/api/zoomOut");
	http.send(zoomlevel / 10);
    });

    console.log(zoomSlider);
    loadImage();
    //zoom();
})();
