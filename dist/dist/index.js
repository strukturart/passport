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


  let queue = [];
  let timeout;
  let toaster = function (text, time) {
    queue.push({ text: text, time: time });
    if (queue.length === 1) {
      toast_q(text, time);
    }
  };

  let toast_q = function (text, time) {
    var x = document.querySelector("div#toast");
    x.innerHTML = queue[0].text;

    x.style.transform = "translate(0px, 0px)";

    timeout = setTimeout(function () {
      timeout = null;
      x.style.transform = "translate(0px, -100px)";
      queue = queue.slice(1);
      if (queue.length > 0) {
        setTimeout(() => {
          toast_q(text, time);
        }, 1000);
      }
    }, time);
  };

  //side toaster

  let queue_st = [];
  let ttimeout;
  let side_toaster = function (text, time) {
    queue_st.push({ text: text, time: time });
    if (queue_st.length === 1) {
      toast_qq(text, time);
    }
  };

  let toast_qq = function (text, time) {
    var x = document.querySelector("div#side-toast");
    x.innerHTML = queue_st[0].text;

    x.style.transform = "translate(0vh, 0px)";

    timeout = setTimeout(function () {
      ttimeout = null;
      x.style.transform = "translate(-100vh,0px)";
      queue_st = queue.slice(1);
      if (queue_st.length > 0) {
        setTimeout(() => {
          toast_qq(text, time);
        }, 1000);
      }
    }, time);
  };

  //delete file
  let renameFile = function (filename, new_filename) {
    let sdcard = navigator.getDeviceStorage("sdcard");
    let request = sdcard.get(filename);
    // let new_filename = prompt("new filename");

    request.onsuccess = function () {
      let data = this.result;

      let file_extension = data.name.split(".");
      file_extension = file_extension[file_extension.length - 1];

      let filepath = data.name.split("/").slice(0, -1).join("/") + "/";

      let requestAdd = sdcard.addNamed(
        data,
        filepath + new_filename + "." + file_extension
      );
      requestAdd.onsuccess = function () {
        var request_del = sdcard.delete(data.name);

        request_del.onsuccess = function () {
          // success copy and delete

          document.querySelector(
            "[data-filepath='" + filename + "']"
          ).innerText = new_filename + "." + file_extension;

          side_toaster("successfully renamed", 3000);
        };

        request_del.onerror = function () {
          // success copy not delete
          toaster("Unable to write the file", 3000);
        };
      };
      requestAdd.onerror = function () {
        toaster("Unable to write the file", 3000);
      };
    };

    request.onerror = function () {
      toaster("Unable to write the file", 3000);
    };
  };

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
              window_status = "list";
            }, 4000);
          }
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
