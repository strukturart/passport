"use strict";

let debug = false;
let filter_query;
let file_content = [];
let current_file;
let files = [];
let action = null;
let action_element = null;
let selected_image;
let selected_image_url;
let qrcode_content;

let set_tabindex = () => {
  document
    .querySelectorAll('.item:not([style*="display: none"]')
    .forEach((e, i) => {
      if (e.style.display != "none") {
        e.setAttribute("tabindex", i);
      } else {
        e.setAttribute("tabindex", -1);
      }
    });
};

//NAVIGATION

let nav = function (move) {
  // set_tabindex();

  const currentIndex = document.activeElement.tabIndex;
  let next = currentIndex + move;
  let items = 0;

  items = document.querySelectorAll(".item");

  let targetElement = 0;

  if (next <= items.length) {
    targetElement = items[next];
    targetElement.focus();
  }

  if (next == items.length) {
    targetElement = items[0];
    targetElement.focus();
  }

  const rect = document.activeElement.getBoundingClientRect();
  const elY =
    rect.top - document.body.getBoundingClientRect().top + rect.height / 2;

  document.activeElement.parentElement.parentElement.scrollBy({
    left: 0,
    top: elY - window.innerHeight / 2,
    behavior: "smooth",
  });
};

//list dic

try {
  var d = navigator.getDeviceStorage("sdcard");

  var cursor = d.enumerate();

  cursor.onsuccess = function () {
    if (!this.result) {
      m.route.set("/start");
    }
    if (cursor.result.name !== null) {
      var file = cursor.result;
      let m = file.name.split("/");
      let file_name = m[m.length - 1];

      let f = URL.createObjectURL(file);

      if (file.name.includes("sdcard/passport/")) {
        files.push({ "path": f, "name": file_name, "file": file.name });
      }
      this.continue();
    }
  };

  cursor.onerror = function () {
    console.warn("No file found: " + this.error);
  };
} catch (e) {}

if ("b2g" in navigator) {
  try {
    var sdcard = navigator.b2g.getDeviceStorage("sdcard");
    var iterable = sdcard.enumerate();
    var iterFiles = iterable.values();

    function next(_files) {
      _files
        .next()
        .then((file) => {
          if (!file.done) {
            let fileExtension = file.value.name.slice(-3); // Get the last three characters of the file name

            if (fileExtension == "dic") {
              files.push({ path: file.value.name, name: file.value.name });
              m.route.set("/start");
            }

            next(_files);
          }
        })
        .catch(() => {
          next(_files);
        });
    }

    next(iterFiles);
  } catch (e) {
    alert(e);
  }
}

let load_qrcode_content = (filepath) => {
  let sdcard = "";

  try {
    sdcard = navigator.getDeviceStorage("sdcard");
  } catch (e) {}

  let request = sdcard.get(filepath);

  request.onsuccess = function (e) {
    const file = e.target.result; // The retrieved file

    const reader = new FileReader();

    reader.addEventListener("load", function (event) {
      const arrayBuffer = event.target.result; // This is the ArrayBuffer

      if (arrayBuffer instanceof ArrayBuffer) {
        const blob = new Blob([arrayBuffer]);

        // Create an Image object
        const img = new Image();

        img.onload = function () {
          const width = img.width; // Get the width of the image
          const height = img.height; // Get the height of the image

          // Create a canvas and draw the image on it
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0);

          // Get image data
          const imageData = ctx.getImageData(0, 0, width, height);

          // Use jsQR to decode the QR code
          const code = jsQR(imageData.data, width, height);

          if (code) {
            qrcode_content = code.data;
            helper.bottom_bar("<img src='assets/images/eye.svg'>", "", "");
          } else {
            qrcode_content = "";
            helper.bottom_bar("", "", "");
          }
        };

        img.onerror = function () {
          console.error("Failed to load the image.");
        };

        // Set the image source to the Blob URL
        img.src = URL.createObjectURL(blob);
      } else {
        console.error("Invalid ArrayBuffer type.");
      }
    });

    reader.readAsArrayBuffer(file);
  };

  request.onerror = function (error) {
    console.log(error);
  };
};

//VIEWS

let startup = true;
let t = 5000;

document.addEventListener("DOMContentLoaded", function () {
  var root = document.querySelector("main");

  var start = {
    view: function () {
      return m("div", [
        m(
          "div",
          {
            id: "intro",
            oncreate: () => {
              startup
                ? (t = 5000)
                : (document.querySelector("#intro").style.display = "none");
              setTimeout(() => {
                document.querySelector("#intro").style.display = "none";
                startup = false;
              }, t);
            },
          },
          [m("img", { src: "/assets/icons/icon-112-112.png" })]
        ),
        m(
          "ul",
          {
            id: "files-list",
            oncreate: () => {
              helper.bottom_bar(
                "",
                "<img src='assets/images/select.svg'>",
                "<img src='assets/images/option.svg'>"
              );
            },
          },
          [
            files.map((e, i) => {
              return m(
                "li",
                {
                  class: "item",
                  tabindex: i,
                  "data-path": e.path,
                  "data-file": e.file,
                  oncreate: ({ dom }) => {
                    if (i == 0) {
                      dom.focus();
                    }
                  },
                  onkeydown: (e) => {
                    if (e.keyCode === 13) {
                      selected_image =
                        document.activeElement.getAttribute("data-path");
                      selected_image_url =
                        document.activeElement.getAttribute("data-file");

                      m.route.set("/show_image");
                    }

                    if (e.key === "SoftRight") {
                      m.route.set("/options");
                    }
                  },
                },
                e.name
              );
            }),
          ]
        ),
      ]);
    },
  };

  var options = {
    view: function () {
      return m(
        "div",
        {
          id: "options-page",
          oninit: () => {
            helper.load_ads();
          },
          oncreate: () => {
            helper.bottom_bar("", "", "");
          },

          onkeydown: (e) => {
            if (e.key === "Backspace") {
              m.route.set("/show_image");
            }
          },
        },

        [
          m("div", {
            id: "text",
            oncreate: ({ dom }) => {
              m.render(
                dom,
                m.trust(
                  "<kbd class='item'>Parrot</kbd> <br>With this app you can expand and maintain the vocabulary of your predictive text. <br><br> Credits: Mithril.js <br>License: MIT<br><br>"
                )
              );
            },
          }),
          m("kbd", "KaiOs Ads"),

          m("div", { id: "KaiOsAds-Wrapper", class: "item" }),
        ]
      );
    },
  };

  var show_image = {
    view: function () {
      return m("div", {}, [
        m("img", {
          src: selected_image,
          id: "image",
          oninit: () => {
            helper.bottom_bar("", "", "");
            load_qrcode_content(selected_image_url);
          },
        }),
      ]);
    },
  };

  var show_qr_content = {
    view: function () {
      return m(
        "div",
        {
          id: "qr-content",
          oninit: () => {
            helper.bottom_bar("", "", "");
          },
        },
        qrcode_content
      );
    },
  };

  m.route(root, "/start", {
    "/show_qr_content": show_qr_content,
    "/show_image": show_image,
    "/start": start,
    "/options": options,
  });

  m.route.prefix = "#";

  //////////////////////////////
  ////KEYPAD HANDLER////////////
  //////////////////////////////

  let longpress = false;
  const longpress_timespan = 1000;
  let timeout;

  function repeat_action(param) {
    switch (param.key) {
      case "ArrowUp":
        break;

      case "ArrowDown":
        break;

      case "ArrowLeft":
        break;

      case "ArrowRight":
        break;
    }
  }

  //////////////
  ////LONGPRESS
  /////////////

  function longpress_action(param) {
    switch (param.key) {
      case "*":
        break;

      case "Backspace":
        break;
    }
  }

  ///////////////
  ////SHORTPRESS
  //////////////

  function shortpress_action(evt) {
    switch (evt.key) {
      case "Backspace":
        evt.preventDefault();

        if (m.route.get().includes("/show_image")) {
          m.route.set("/start");
          break;
        }

        if (m.route.get().includes("/options")) {
          m.route.set("/start");
          break;
        }
        if (m.route.get().includes("/start")) {
          window.close();
        }

      case "EndCall":
        evt.preventDefault();

        if (m.route.get().includes("/show_qr_content")) {
          m.route.set("/show_image");
          break;
        }

        if (m.route.get().includes("/show_image")) {
          m.route.set("/start");
          break;
        }

        if (m.route.get().includes("/start")) {
          window.close();
        }
        break;

      case "SoftLeft":
      case "Control":
        m.route.set("/show_qr_content");

        break;

      case "SoftRight":
      case "Alt":
        break;

      case "Enter":
        if (m.route.get().includes("/show_image")) {
        }
        break;

      case "ArrowRight":
        nav(+1);

        break;

      case "ArrowLeft":
        nav(-1);
        break;

      case "ArrowUp":
        nav(-1);
        break;

      case "ArrowDown":
        nav(+1);
        break;
    }
  }

  /////////////////////////////////
  ////shortpress / longpress logic
  ////////////////////////////////

  function handleKeyDown(evt) {
    if (evt.key === "EndCall") {
      evt.preventDefault();
      if (m.route.get().includes("/start")) {
        window.close();
      }
    }

    if (evt.key === "Backspace") {
      evt.preventDefault();
      if (m.route.get().includes("/start")) {
        window.close();
      }
    }

    if (!evt.repeat) {
      longpress = false;
      timeout = setTimeout(() => {
        longpress = true;
        longpress_action(evt);
      }, longpress_timespan);
    }

    if (evt.repeat) {
      if (evt.key == "Backspace") evt.preventDefault();

      longpress = false;
      repeat_action(evt);
    }
  }

  function handleKeyUp(evt) {
    evt.preventDefault();

    if (evt.key == "Backspace") evt.preventDefault();

    clearTimeout(timeout);
    if (!longpress) {
      shortpress_action(evt);
    }
  }

  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keyup", handleKeyUp);
});

if (debug) {
  window.onerror = function (msg, url, linenumber) {
    alert(
      "Error message: " + msg + "\nURL: " + url + "\nLine Number: " + linenumber
    );
    return true;
  };
}
