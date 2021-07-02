(function () {

    let zoomlevel = 1.0;		//1 2 3 4

    //grab a bunch of elements

    let img = document.querySelector(".image");
    let zi = document.querySelector(".zoomed-image");
    let zoomSlider = document.querySelector(".slider")
    //let zoomButton = document.querySelector(".zoom-button");

    console.log("Started....");
    //just put the unzoomed image in to start
    function zoom() {
        console.log("Zoom...");
        //document.querySelector(".loggy").innerText = text;

        let ih = img.naturalHeight;
        let iw = img.naturalWidth;
        let ir = iw / ih;

        let ww = window.innerWidth;
        let wh = window.innerHeight;
        let wr = ww / wh;

        //todo only deal with the width = always set to fill the screen
        //work out which dimension will fill the screen... and set the width and height to that (and center it)

        //console.log("window", ww, wh, wr);
        //console.log("image", iw, ih, ir);
        //console.log(ww / iw, wh / ih);

        //set the zoomed image... this can probably be fixed....
        let is = img.src;
        //is = is.substring(is.lastIndexOf("/") + 1);
        zi.style.backgroundImage = "url('" + is + "')";

        //if the wr < ir set the width to fill the screen and calculate the height based on the ratio
        //else do the same for the width
        //need to watch for screen resize and recalculate these

        if (wr < ir) {
            //set the width to full and adjust the height
            //how much have we resized it by
            //console.log("wr < ir");
            let rs = iw / ww;
            zi.style.width = ww + "px";
            zi.style.height = wh / (ww / iw) + "px";
        } else {
            //console.log("wr > ir");
            let rs = ih / wh;
            zi.style.height = wh + "px";
            zi.style.width = ww / (wh / ih) + "px";
        }
        //zi.style.width = (iw * zoomlevel) + "px";
        //zi.style.height = (ih * zoomlevel) + "px";
        zi.style.backgroundSize = (iw * zoomlevel) + "px " + (ih * zoomlevel) + "px";
        let bpx = ((iw * zoomlevel) - ww) / 2;
        let bpy = ((ih * zoomlevel) - wh) / 2;
        //console.log(bpx, bpy);
        zi.style.backgroundPosition = -bpx + "px " + -bpy + "px";
    }

    function loadImage() {
        console.log("Getting new image");
        let http = new XMLHttpRequest();
        http.addEventListener("load", (p, r) => {
            if (http.status === 200 && http.response.length !== 0) {
                let du = "data:image/jpg;base64," + http.response;
                let el = document.querySelector(".image");
                el.setAttribute("src", du);
                zoom();
            }
            setTimeout(loadImage, 1000);
        });
        http.open("GET", "/api/getImage");
        http.send();
    }	//load image

    window.addEventListener("resize", e => {
        zoom();
    });

    zoomSlider.addEventListener("input", (e, v) => {
        zoomlevel = e.target.value;
        zoom();
    })

    console.log(zoomSlider);
    loadImage();
    //zoom();
})();