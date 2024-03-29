        "use strict";
        var norm = null;
        var trans = null;
        var coord = null;
        var up = false;
        var dupe = [];
        var source = null;
        var filex = 0;
        var filey = 0;
        

        //communicates with google's vision API to extract text from an image
        async function ReadImage(obj) {
        //reset varialbes
        norm = null;
        trans = null;
        coord = null;
        up = false;
        dupe = [];
        source = null;
        filex = 0;
        filey = 0;
        document.querySelector('#filename').innerHTML = "";

        if(!validURL(document.querySelector("#min").value)){
            alert("Invalid URL: Please use a valid URL");
            return;
        }

        var normphoto = document.querySelector("#nphoto");
        source = document.querySelector("#min").value;
        normphoto.src = source;
        var temp =  source;
        	

            let j = {
  "requests": [
    {
      "image": {
        "source": {
          "imageUri": temp
        }
       },
       "features": [
         {
           "type":  document.querySelector("#type").value
         }
       ],
       "imageContext": {
        //"languageHints": ["en-t-i0-handwrit"]
      }
    }
  ]
}

	    let config = {
	    	//credentials: 'include',
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
                //"Access-Control-Allow-Origin": "*",
                //"Access-Control-Allow-Credentials": "*"
            },
            //mode: 'no-cors',
            //mode: 'cors',
            body: JSON.stringify(j)
            }

		var promise = fetch("https://vision.googleapis.com/v1/images:annotate?key=AIzaSyCuBI9zUUgsssXDatQRH-a8YBlao9baeXk", config);

    	promise.then(readP);
		promise.catch( (err) => alert('Error getting prediction, details: ' + err) );
            }

         //handles first promise
        function readP(g) {;
            var b = g.json();
            b.then(h);
        }

        //handles second promise
         function h(g) {
         	var u = g;
            try{
            coord = u.responses[0].textAnnotations;
            norm = u.responses[0].fullTextAnnotation.text;
        	}
            //if The server returns an invalid response this handles it and returns resets the page.
        	catch(TypeError){
                  norm = null;
                  trans = null;
                  coord = null;
                  up = false;
                  dupe = [];
                 source = null;
                 filex = 0;
                 filey = 0;
                var normphoto = document.querySelector("#nphoto");
                normphoto.src = "https://www.transparenttextures.com/patterns/debut-light.png"
                var base = document.querySelector("#container");
                base.innerHTML = "";
                var photo = document.createElement("img");
                if(up){
                alert("File Error, try uploading a different photo");
                }
                else{
        		alert("Unable to access url, try a different image");
                }
                photo.width = normphoto.width;
                photo.height = normphoto.height;
                photo.src = "https://www.transparenttextures.com/patterns/debut-light.png";
                base.appendChild(photo);
        		return;
        	}
            translate(norm);
        }



        //communicates with google's translation api to translate the text
        async function translate(obj) {
        	let j = {
  			"q": obj,
  			"target": document.querySelector("#langto").value,
  			//"model": "base"
}

        //alert("sending the request");
	    let config = {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(j)
            }

		var promise = fetch("https://translation.googleapis.com/language/translate/v2?key=AIzaSyCuBI9zUUgsssXDatQRH-a8YBlao9baeXk", config)

    	promise.then(readT);
		promise.catch( (err) => alert('Error getting prediction, details: ' + err));

            }

        //handles first promise from translate
        function readT(g) {
            var b = g.json();
            b.then(s);
        }

        //handles second promise from translate
        function s(g) {
            var u = g;
            trans = u.data.translations[0].translatedText;
            create();
        }



        //this function creates the html on the page
        async function create(obj) {
           	await placetext();
            var tbl = document.querySelector("#tble");
            tbl.innerHTML = "";
            var tr = document.createElement("tr");
            tbl.appendChild(tr);
            var td = document.createElement("td");
            tr.appendChild(td);
            td.innerHTML = "Original Text";
            td.classList.add("odd");
            var td = document.createElement("td");
            tr.appendChild(td);
            td.innerHTML = "Translated Text";
            td.classList.add("even");

            var tr = document.createElement("tr");
            tbl.appendChild(tr);
            var td = document.createElement("td");
            tr.appendChild(td);
            td.innerHTML = norm;
            td.classList.add("even");
            var td = document.createElement("td");
            tr.appendChild(td);
            td.classList.add("odd");
            td.innerHTML = trans;
            }


            //place text translates and places text over an image
            async function placetext(){
            	var normphoto = document.querySelector("#nphoto");
            	normphoto.src = source;
            	var base = document.querySelector("#container");
            	base.innerHTML = "";
            	var photo = document.createElement("img");
            	photo.width = normphoto.width;
            	photo.height = normphoto.height;
            	photo.src = source;
            	base.appendChild(photo);
                var widratio;
                var hratio;
                if(up){
                widratio = (filex *1.0)/photo.width;
                hratio = (filey *1.0)/photo.height;
                }
                else{
                let img = await getMeta(source);
            	widratio = (img.width *1.0)/photo.width;
            	hratio = (img.height *1.0)/photo.height;
                }
            	for (var j = 1; j < coord.length; j++) {

            	var x = 0;
            	var bool = -1;
            	var xmin = 90000;
				var xmax = -1;
				var ymin = 90000;
				var ymax = -1;

				var list = coord[j].boundingPoly.vertices;
				for (var i = 0; i < list.length; i++) {
	 			if (list[i].x < xmin){
				 	xmin = list[i].x;
				 }
				 if (list[i].x > xmax){
				 	xmax = list[i].x;
				 }
				 if (list[i].y < ymin){
				 	ymin = list[i].y;
				 }
				 if (list[i].y > ymax){
				 	ymax = list[i].y;
				 }
				}

				xmin = parseInt(xmin/widratio);
				xmax = parseInt(xmax/widratio);
				ymin = parseInt(ymin/hratio);
				ymax = parseInt(ymax/hratio);

				var xdif = xmax - xmin;
				var ydif = ymax - ymin;

				var tex = document.createElement("div");
				base.appendChild(tex);
				tex.classList.add("blur");
				tex.style.left =  xmin;
				tex.style.bottom = photo.height - ymin;
				tex.style.right = photo.width - xmax;
				tex.style.top = ymax -15;
				var written = document.createElement("p");
				tex.appendChild(written);
				written.classList.add("text");
				//written.innerHTML = coord[j].description;
				translate2(written,coord[j].description);
				if(coord[j].description.length > 30){
				    written.style.overflow = "scroll";
				    written.style.border = "1px solid black";
				}

			}

            }

//code from stack exchange for retrieving an images original size. https://stackoverflow.com/questions/11442712/get-width-height-of-remote-image-from-url

//This is used to get the original size of an image at a remote host 
function getMeta(url) {
    return new Promise((resolve, reject) => {
        let img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
    });
}


        // similar to translate, but it also places translated text onto an image
        async function translate2(loc, obj) {
        	let j = {
  			"q": obj,
  			"target": document.querySelector("#langto").value,
  			//"model": "base"
}

        //alert("sending the request");
	    let config = {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(j)
            }

		var promise = fetch("https://translation.googleapis.com/language/translate/v2?key=AIzaSyCuBI9zUUgsssXDatQRH-a8YBlao9baeXk", config)

    	promise.then(function (w) {
    		var b = w.json();
    		b.then(function (g) {
    				var u = g;
            loc.innerHTML = u.data.translations[0].translatedText;
    		})
    		})
			promise.catch( (err) => alert('Error getting prediction, details: ' + err) );

            }





//preview file function from https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsDataURL

//this function loads a file into the webpage, it also prepares the data to send to an API
function previewFile() {
  var preview = document.querySelector('#nphoto');
  var file    = document.querySelector('input[type=file]').files[0];
  var reader  = new FileReader();

  reader.addEventListener("load", function () {
    preview.src = reader.result;
    var image = new Image();

    image.src = reader.result;
    source = reader.result;
    image.onload = function() {
        filex = image.width;
        filey = image.height;
    };
      let encoded = reader.result.toString().replace(/^data:(.*,)?/, '');
      if ((encoded.length % 4) > 0) {
        encoded += '='.repeat(4 - (encoded.length % 4));
      }
      document.querySelector('#load').value = "";
      document.querySelector('#filename').innerHTML = "UPLOADED FILE:    "+  file.name;
      ReadImage2(encoded);
  }, false);

  if (file) {
    if(!isFileImage(file)){
        alert("Error: File is not an image")
        return;
    }
    reader.readAsDataURL(file);
  }
}


//from https://stackoverflow.com/questions/5717093/check-if-a-javascript-string-is-a-url
function validURL(str) {
  var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  return !!pattern.test(str);
}

//from http://roufid.com/javascript-check-file-image/
function isFileImage(file) {
    return file && file['type'].split('/')[0] === 'image';
}

//similar to the original, but this function is for uploaded files instead of urls
//it uses the same helper functions as the original
async function ReadImage2(obj) {
        norm = null;
        trans = null;
        coord = null;
        up = true;


let j = {
  "requests": [
    {
      "image": {
        "content": obj
       },
       "features": [
         {
           "type":  document.querySelector("#type").value
         }
       ],
       "imageContext": {
        //"languageHints": ["en-t-i0-handwrit"]
      }
    }
  ]
}

        let config = {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(j)
            }

        var promise = fetch("https://vision.googleapis.com/v1/images:annotate?key=AIzaSyCuBI9zUUgsssXDatQRH-a8YBlao9baeXk", config)

        promise.then(readP);
        promise.catch( (err) => alert('Error getting prediction, details: ' + err) );
            }