//set your source path
var dir_name = "passport";
let dir_exist = false;

//Global Vars
var pos_focus = 0;
var window_status = "list";
var items = [];
k = -1;

function finder() {
  document.getElementById("items-list").innerHTML = "";
  var filelist = navigator.getDeviceStorages("sdcard");
  for (var i = 0; i < filelist.length; i++) {
    var cursor = filelist[i].enumerateEditable();

    cursor.onsuccess = function () {
      if (cursor.result) {
        var file = cursor.result;

        if (file.type.match("image/*")) {
          fileURL = URL.createObjectURL(file);

          var str = file.name;

          var dir = str.split("/");
          var file_name = dir[dir.length - 1];

          if (dir[2] == dir_name) {
            dir_exist = true;
            k++;

            let elm = document.createElement("LI");
            elm.setAttribute("tabindex", k);
            elm.classList.add("items");

            let div = document.createElement("DIV");
            div.classList.add("item-name");
            div.innerText = file_name;

            let img = document.createElement("img");
            img.src = fileURL;
            elm.appendChild(img);
            elm.appendChild(div);

            document.getElementById("items-list").appendChild(elm);
          }
        }

        // Once we found a file we check if there is other results
        if (!this.done) {
          // Then we move to the next result, which call the
          // cursor success with the next file as result.
          this.continue();
        }
      }
      document.querySelectorAll("li.items")[0].focus();
      items = document.querySelectorAll("li.items");

      if (dir_exist) {
        document.getElementById("messages").style.display = "none";
        document.getElementById("dir-not-exist").style.diisplay = "none";
      }
      if (!dir_exist) {
        document.getElementById("messages").style.display = "block";
        document.getElementById("dir-not-exist").style.diisplay = "block";
      }
    };

    cursor.onerror = function () {
      console.log("err");
    };
  }
}

finder();

bottom_bar("qr", "", "");

//to do
//https://github.com/davidshimjs/qrcodejs

function show_image() {
  window_status = "image_view";
  let a = document.querySelectorAll("li.items");
  for (i = 0; i < a.length; i++) {
    a[i].style.display = "none";
    a[i].querySelectorAll(".item-name")[0].style.display = "none";
  }
  document.activeElement.style.display = "block";

  document.activeElement.querySelectorAll("img")[0].style.display = "block";
}

function show_image_list() {
  if (window_status == "image_view") {
    let a = document.querySelectorAll("li.items");
    for (i = 0; i < a.length; i++) {
      a[i].style.display = "block";
      a[i].querySelectorAll("div.item-name")[0].style.display = "block";
      a[i].getElementsByTagName("IMG")[0].style.display = "none";
    }
  }
  window_status = "list";
}

////////////////////////
//NAVIGATION
/////////////////////////

function nav(move) {
  if (move == "+1") {
    pos_focus++;
    if (pos_focus <= items.length) {
      items[pos_focus].focus();
    }

    if (pos_focus >= items.length) {
      pos_focus = 0;
      items[0].focus();
    }
  }

  if (move == "-1") {
    pos_focus--;
    if (pos_focus >= 0) {
      items[pos_focus].focus();
    }

    if (pos_focus == -1) {
      pos_focus = items.length - 1;
      items[pos_focus].focus();
    }
  }
}

let createQr = function (string) {
  var qr = new QRious();

  qr.set({
    background: "white",
    foreground: "black",
    level: "H",
    padding: 25,
    size: 500,
    value: string,
  });

  qr.toDataURL();

  fetch(qr.toDataURL())
    .then((res) => res.blob())
    .then((blob) => {
      write_file(
        blob,
        "/sdcard1/passport/" + Math.floor(Date.now() / 1000) + ".png"
      );
      finder();
    });
};

//////////////////////////
////KEYPAD TRIGGER////////////
/////////////////////////
function handleKeyDown(evt) {
  switch (evt.key) {
    case "Enter":
      show_image();
      break;

    case "Backspace":
      evt.preventDefault();
      if (window_status == "scan") {
        qr.stop_scan();
        bottom_bar("qr", "", "");
        return;
      }

      if (window_status == "list") {
        window.close();
      }

      break;
  }
}

function handleKeyUp(evt) {
  switch (evt.key) {
    case "Enter":
      break;

    case "Backspace":
      evt.preventDefault();
      if (window_status == "list") {
        window.close();
      }

      if (window_status == "image_view") show_image_list();

      break;

    case "ArrowDown":
      nav("+1");
      break;

    case "ArrowUp":
      nav("-1");
      break;

    case "SoftLeft":
      qr.start_scan(function (callback) {
        let slug = callback;
        createQr(slug);
        bottom_bar("qr", "", "");
      });
      break;

    case "SoftRight":
      break;
  }
}

document.addEventListener("keydown", handleKeyDown);
document.addEventListener("keyup", handleKeyUp);
