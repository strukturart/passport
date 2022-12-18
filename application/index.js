//set your source path
var dir_name = "passport";
let fullpath;
let dir_exist = false;
//Global Vars
let pos_focus = 0;
let window_status = "intro";
let items = [];
k = -1;

let current_file;
let settings = { ads: false };

//KaiOS ads

//ads || ads free

let load_ads = function () {
  var js = document.createElement("script");
  js.type = "text/javascript";
  js.src = "assets/js/kaiads.v5.min.js";

  js.onload = function () {
    getKaiAd({
      publisher: "4408b6fa-4e1d-438f-af4d-f3be2fa97208",
      app: "passport",
      slot: "passport",
      test: 0,
      timeout: 10000,
      h: 100,
      w: 240,
      container: document.getElementById("KaiOsAds-Wrapper"),
      onerror: (err) => console.error("Error:", err),
      onready: (ad) => {
        // user clicked the ad
        ad.on("click", () => console.log("click event"));

        // user closed the ad (currently only with fullscreen)
        ad.on("close", () => console.log("close event"));

        // the ad succesfully displayed
        ad.on("display", () => console.log("display event"));

        // Ad is ready to be displayed
        // calling 'display' will display the ad
        ad.call("display", {
          navClass: "item",
          //tabIndex: 0,
          //display: "block",
        });
      },
    });
  };
  document.head.appendChild(js);
};

let getManifest = function (callback) {
  if (!navigator.mozApps) {
    return false;
  }
  let self = navigator.mozApps.getSelf();
  self.onsuccess = function () {
    callback(self.result);
  };
  self.onerror = function () {};
};

let self;
//KaiOs store true||false
function manifest(a) {
  self = a.origin;
  console.log(a);

  if (a.installOrigin == "app://kaios-plus.kaiostech.com") {
    settings.ads = true;
    load_ads();
    document.getElementById("KaiOsAds-Wrapper-Title").style.display = "none";
  } else {
    settings.ads = false;
  }
}

getManifest(manifest);

//load translation
let user_lang = window.navigator.userLanguage || window.navigator.language;
if (!lang.hasOwnProperty(user_lang)) user_lang = "default";

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

            window_status = "page-list";
          }
        }

        // Once we found a file we check if there is other results
        if (!this.done) {
          // Then we move to the next result, which call the
          // cursor success with the next file as result.
          this.continue();
        }
      }

      if (dir_exist) {
        document.getElementById("messages").style.display = "none";
        document.getElementById("dir-not-exist").style.diisplay = "none";
        bottom_bar("", "", "<img src='assets/images/option.svg'>");
        document.querySelectorAll("li.items")[0].focus();

        items = document.querySelectorAll("li.items");
        current_file = document.activeElement;
        window_status = "page-list";
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

function show_image() {
  window_status = "page-view";
  let a = document.querySelectorAll("li.items");
  for (i = 0; i < a.length; i++) {
    a[i].style.display = "none";
    a[i].querySelectorAll(".item-name")[0].style.display = "none";
  }
  document.activeElement.style.display = "block";
  document.activeElement.querySelectorAll("img")[0].style.display = "block";
  bottom_bar("", "", "");
}

function show_image_list() {
  let a = document.querySelectorAll("div#page-list li.items");
  if (window_status == "page-view") {
    for (i = 0; i < a.length; i++) {
      a[i].style.display = "block";
      a[i].querySelectorAll("div.item-name")[0].style.display = "block";
      a[i].getElementsByTagName("IMG")[0].style.display = "none";
    }
  }
  document.querySelector("div#page-list").style.display = "block";
  document.querySelector("div#page-options").style.display = "none";
  bottom_bar("", "", "<img src='assets/images/option.svg'>");
  setTimeout(() => {
    window_status = "page-list";
  }, 1000);
  a[0].focus();
}

function show_options() {
  window_status = "page-options";

  document.querySelector("div#page-list").style.display = "none";
  document.querySelector("div#page-options").style.display = "block";
  bottom_bar("", "", "");

  document.querySelectorAll("div#page-options .item")[0].focus();
  items = [];
  items = document.querySelectorAll("div#page-options .item");
}

let sharefile = () => {
  var sdcard = navigator.getDeviceStorages("sdcard");
  var request = sdcard[current_file.getAttribute("data-storage")].get(
    current_file.getAttribute("data-path")
  );

  request.onsuccess = function () {
    var file = this.result;
    share(file, current_file.getAttribute("data-name"));
  };

  request.onerror = function () {
    alert("Unable to get the file: " + this.error);
  };
};

let startscan = () => {
  qr.start_scan(function (callback) {
    let slug = callback;
    createQr(slug);
  });
};

let func = () => {
  let m = document.activeElement.getAttribute("data-func");

  switch (m) {
    case "startscan":
      startscan();
      break;
    case "deletefile":
      deleteFile(
        current_file.getAttribute("data-storage"),
        current_file.getAttribute("data-path")
      );

      document.getElementById("messages").style.display = "block";
      document.getElementById("dir-not-exist").style.display = "block";
      finder();
      side_toaster("file deleted", 2000);

      break;
    case "renamefile":
      window_status = "rename_file";
      var a = prompt("Enter new filename");
      if (a != null) {
        renameFile(current_file.getAttribute("data-path"), a);
        setTimeout(() => {
          window_status = "page-options";
          show_image_list();
          finder();
          side_toaster("file renamed", 2000);
        }, 2000);
      } else {
        setTimeout(() => {
          window_status = "page-options";
        }, 2000);
      }
      break;
    case "sharefile":
      sharefile();
      break;
  }
};

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

  if (window_status == "page-list") {
    current_file = document.activeElement;
  }
}

//https://github.com/neocotic/qrious

let createQr = function (string) {
  var qrs = new QRious();

  qrs.set({
    background: "white",
    foreground: "black",
    level: "H",
    padding: 5,
    size: 1200,
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
      if (window_status == "page-list") {
        show_image();
        return;
      }
      if (window_status == "page-options") {
        func();
        return;
      }

      break;

    case "ArrowLeft":
      document.activeElement.classList.add("delete");
      if (presstime > 6) {
        presstime = 0;
        deleteFile(
          document.activeElement.getAttribute("data-storage"),
          document.activeElement.getAttribute("data-path")
        );

        document.getElementById("messages").style.display = "block";
        document.getElementById("dir-not-exist").style.display = "block";
        finder();
      }
      break;

    case "Backspace":
      evt.preventDefault();
      if (window_status == "page-scan") {
        qr.stop_scan();
        return;
      }

      if (window_status == "page-options") {
        show_image_list();
        return;
      }

      if (window_status == "page-list") {
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
      if (window_status == "page-view") {
        show_image_list();
        return;
      }
      if (window_status == "page-options") {
        show_image_list();
        return;
      }

      if (window_status == "page-list") {
        window.close();
      }

      break;

    case "ArrowDown":
      nav("+1");
      break;

    case "ArrowUp":
      nav("-1");
      break;

    case "ArrowLeft":
      if (window_status == "page-list") {
        document.activeElement.classList.remove("delete");
      }
      break;

    case "ArrowRight":
      if (window_status == "page-list") {
        window_status = "rename_file";
        var a = prompt("Enter new filename");
        if (a != null) {
          renameFile(document.activeElement.getAttribute("data-path"), a);
          setTimeout(() => {
            window_status = "list";
            finder();
          }, 4000);
        } else {
          setTimeout(() => {
            window_status = "page-list";
          }, 4000);
        }
      }

      break;

    case "SoftRight":
      if (window_status == "page-list") {
        show_options();
      }

      break;
  }
}

document.addEventListener("keydown", handleKeyDown);
document.addEventListener("keyup", handleKeyUp);
