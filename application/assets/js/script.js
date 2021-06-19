//set your source path
var dir_name = "passport";
let fullpath;
let dir_exist = false;

//Global Vars
let pos_focus = 0;
let window_status = "list";
let items = [];
k = -1;

//load translation
let user_lang = window.navigator.userLanguage || window.navigator.language;
if (!lang.hasOwnProperty(user_lang)) user_lang = "default";

bottom_bar(lang[user_lang].qr_code, "", "");

function finder() {
  document.getElementById("items-list").innerHTML = "";
  var filelist = navigator.getDeviceStorages("sdcard");
  for (var i = 0; i < filelist.length; i++) {
    var cursor = filelist[i].enumerateEditable();

    cursor.onsuccess = function () {
      if (cursor.result) {
        var file = cursor.result;

        //check if dir exist
        var str = file.name;
        var dir = str.split("/");
        var file_name = dir[dir.length - 1];
        if (dir[2] == dir_name) {
          fullpath = "/" + dir[0] + dir[1] + "/" + dir[2] + "/";
        }

        if (file.type.match("image/*")) {
          fileURL = URL.createObjectURL(file);

          var str = file.name;
          var dir = str.split("/");
          var file_name = dir[dir.length - 1];

          if (dir[2] == dir_name) {
            dir_exist = true;
            k++;

            let elm = document.createElement("LI");

            console.log(file.name);

            elm.setAttribute("data-storage", i - 1);
            elm.setAttribute("data-path", file.name);
            elm.setAttribute("data-name", file_name);
            console.log(file_name);

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

            bottom_bar(lang[user_lang].qr_code, "", lang[user_lang].share);
            window_status = "list";
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
        bottom_bar(lang[user_lang].qr_code, "", lang[user_lang].share);
      }
    };

    cursor.onerror = function () {
      console.log("err");
    };
  }
}

finder();

bottom_bar(lang[user_lang].qr_code, "", lang[user_lang].share);

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

//https://github.com/davidshimjs/qrcodejs

let createQr = function (string) {
  var qrs = new QRious();

  qrs.set({
    background: "white",
    foreground: "black",
    level: "H",
    padding: 25,
    size: 500,
    value: string,
  });

  qrs.toDataURL();

  fetch(qrs.toDataURL())
    .then((res) => res.blob())
    .then((blob) => {
      let t = Math.floor(Date.now() / 1000);
      let b = prompt(lang[user_lang].file_save, t);
      if (b == null) qr.stop_scan();
      if (b == "") b = t;
      write_file(blob, fullpath + b + ".png");
      finder();
    });
};

//////////////////////////
////KEYPAD TRIGGER////////////
/////////////////////////
let start, end, delta;
let fired = false;
let presstime = 0;

function handleKeyDown(evt) {
  presstime++;

  if (!fired) start = new Date().getTime();

  fired = true;

  switch (evt.key) {
    case "Enter":
      show_image();
      break;

    case "ArrowLeft":
      document.activeElement.classList.add("delete");
      if (presstime > 6) {
        presstime = 0;
        deleteFile(
          document.activeElement.getAttribute("data-storage"),
          document.activeElement.getAttribute("data-path")
        );
        console.log("done");

        document.getElementById("messages").style.display = "block";
        document.getElementById("dir-not-exist").style.display = "block";
        bottom_bar(lang[user_lang].qr_code, "", "");
        finder();
      }
      break;

    case "Backspace":
      evt.preventDefault();
      if (window_status == "scan") {
        qr.stop_scan();
        bottom_bar(lang[user_lang].qr_code, "", lang[user_lang].share);
        return;
      }

      if (window_status == "list") {
        window.close();
      }

      break;
  }
}

function handleKeyUp(evt) {
  fired = false;
  end = new Date().getTime();
  delta = end - start;

  presstime = 0;

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

    case "ArrowLeft":
      if (window_status == "list") {
        document.activeElement.classList.remove("delete");
      }
      break;

    case "ArrowRight":
      if (window_status == "list") {
        rename_file2(
          document.activeElement.getAttribute("data-path"),
          document.activeElement.getAttribute("data-name"),
          document.activeElement.getAttribute("data-storage")
        );
      }

      break;

    case "SoftLeft":
      if (window_status == "list") {
        qr.start_scan(function (callback) {
          let slug = callback;
          createQr(slug);
        });
      }
      break;

    case "SoftRight":
      //share the file
      if (window_status == "list") {
        var sdcard = navigator.getDeviceStorages("sdcard");
        var request = sdcard[
          document.activeElement.getAttribute("data-storage")
        ].get(document.activeElement.getAttribute("data-path"));

        request.onsuccess = function () {
          var file = this.result;
          share(file, document.activeElement.getAttribute("data-name"));
        };

        request.onerror = function () {
          alert("Unable to get the file: " + this.error);
        };
      }

      break;
  }
}

document.addEventListener("keydown", handleKeyDown);
document.addEventListener("keyup", handleKeyUp);
