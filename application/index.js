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
  const currentIndex = Array.from(document.querySelectorAll(".item")).findIndex(
    (item) => item === document.activeElement
  );
  const items = document.querySelectorAll(".item");
  const itemCount = items.length;

  if (currentIndex >= 0) {
    let nextIndex = currentIndex + move;

    // Ensure nextIndex stays within bounds
    if (nextIndex < 0) {
      nextIndex = itemCount - 1;
    } else if (nextIndex >= itemCount) {
      nextIndex = 0;
    }

    const targetElement = items[nextIndex];
    targetElement.focus();

    // Scroll to the focused element if it's not in view
    const rect = targetElement.getBoundingClientRect();
    const elY =
      rect.top - document.body.getBoundingClientRect().top + rect.height / 2;

    if (elY < 0 || elY > window.innerHeight) {
      targetElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }
};

//list dic

try {
  var d = navigator.getDeviceStorage("sdcard");
  /*
  d.getRoot().then((e) => {
    e.getFilesAndDirectories().then((e) => {
      let n = e.find(
        (entry) => entry.name === "passport" && entry instanceof Directory
      );

      if (n) {
        n.getFiles()
          .then((ff) => {
            ff.forEach((file) => {
              console.log(file.name);
              let file_name = file.name;
              let type = file_name.split(".");
              let f = URL.createObjectURL(file);

              files.push({
                "path": n.path + "/" + file.name,
                "name": file_name,
                "file": f,
                "type": type[type.length - 1],
              });
            });
            m.route.set("/start");
          })
          .catch((error) => {
            console.error(
              "Error getting files from passport directory:",
              error
            );
          });
      }
    });
  });
  */

  var cursor = d.enumerate();

  cursor.onsuccess = function () {
    if (!this.result) {
      m.route.set("/start");
    }
    if (cursor.result.name !== null) {
      let file = cursor.result;
      let m = file.name.split("/");
      let file_name = m[m.length - 1];
      alert(file.name);
      let type = file_name.split(".");
      let f = URL.createObjectURL(file);

      if (
        file.name.includes("/passport/") &&
        !file.name.includes("/sdcard/.")
      ) {
        files.push({
          "path": file.name,
          "name": file_name,
          "file": f,
          "type": type[type.length - 1],
        });
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
            let fileExtension = file.value.name.slice(-3); //

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

  if ("b2g" in navigator) {
    try {
      sdcard = navigator.b2g.getDeviceStorage("sdcard");
    } catch (e) {}
  }

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

let pdfContainer; // Define pdfContainer in a higher scope

let zoomIn, zoomOut; // Declare zoomIn and zoomOut

let pdf_viewer = (filepath) => {
  let sdcard = "";

  try {
    sdcard = navigator.getDeviceStorage("sdcard");
  } catch (e) {}

  if ("b2g" in navigator) {
    try {
      sdcard = navigator.b2g.getDeviceStorage("sdcard");
    } catch (e) {}
  }

  let request = sdcard.get(filepath);
  let pdfDocument;
  let currentPage = 1;
  let currentScale = 1.0; // Initial scale factor

  request.onsuccess = function (e) {
    const file = e.target.result; // The retrieved file

    const reader = new FileReader();

    reader.addEventListener("load", function (event) {
      const arrayBuffer = event.target.result; // This is the ArrayBuffer

      if (arrayBuffer instanceof ArrayBuffer) {
        const blob = new Blob([arrayBuffer]);

        pdfContainer = document.getElementById("pdf-container"); // Assign pdfContainer

        // Specify the URL of the PDF document
        var pdfUrl = URL.createObjectURL(blob);

        // Load and render the PDF
        pdfjsLib.getDocument(pdfUrl).promise.then(function (doc) {
          pdfDocument = doc;
          renderPage(pdfContainer);
        });
      }
    });

    reader.readAsArrayBuffer(file);
  };

  function renderPage(container) {
    pdfDocument.getPage(currentPage).then(function (page) {
      var viewport = page.getViewport({ scale: currentScale });

      // Prepare the canvas element to render the PDF
      var canvas = document.createElement("canvas");
      var context = canvas.getContext("2d");
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      container.innerHTML = ""; // Clear previous content
      container.appendChild(canvas);

      // Render the PDF page on the canvas
      page.render({
        canvasContext: context,
        viewport: viewport,
      });
    });
  }

  // Zoom in function
  zoomIn = function () {
    currentScale += 0.2; // You can adjust the zoom increment as needed
    renderPage(pdfContainer);
  };

  // Zoom out function
  zoomOut = function () {
    if (currentScale > 0.2) {
      // Limit the minimum zoom level
      currentScale -= 0.2; // You can adjust the zoom decrement as needed
      renderPage(pdfContainer);
    }
  };
};

//VIEWS

let startup = true;
let t = 4000;

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
              if (startup) {
                setTimeout(() => {
                  document.querySelector("#intro").style.display = "none";
                  startup = false;
                }, t);
              } else {
                document.querySelector("#intro").style.display = "none";
                t = 0;
              }
            },
          },
          [m("img", { src: "/assets/icons/icon-112-112.png" })]
        ),
        m(
          "ul",
          {
            id: "files-list",
            oncreate: ({ dom }) => {
              setTimeout(() => {
                if (files.length == 0) {
                  dom,
                    m.render(
                      dom,
                      m.trust(
                        "<div id='no-file'>No file found<br>Please create a folder called passport and put your qr code files there.</div>"
                      )
                    );

                  helper.bottom_bar(
                    "",
                    "",
                    "<img src='assets/images/option.svg'>"
                  );
                } else {
                  helper.bottom_bar(
                    "",
                    "<img src='assets/images/select.svg'>",
                    "<img src='assets/images/option.svg'>"
                  );
                }
              }, t);
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
                  "data-type": e.type,
                  oncreate: ({ dom }) => {
                    if (i == 0) {
                      dom.focus();
                    }
                  },
                  onkeydown: (e) => {
                    if (e.keyCode === 13) {
                      selected_image =
                        document.activeElement.getAttribute("data-file");
                      selected_image_url =
                        document.activeElement.getAttribute("data-path");

                      if (
                        document.activeElement.getAttribute("data-type") ==
                        "pdf"
                      ) {
                        m.route.set("/show_pdf");
                      } else {
                        m.route.set("/show_image");
                      }
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
        },

        [
          m(
            "kbd",
            {
              class: "item test",
              oncreate: ({ dom }) => {
                set_tabindex();
              },
            },
            "Passport"
          ),

          m("div", {
            id: "text",
            oncreate: ({ dom }) => {
              m.render(
                dom,
                m.trust(
                  "The app is a file viewer for JPG, PNG and PDF files. It should help you display your QR code tickets more quickly during checks.The files must be stored in the order/passport so that they can be displayed. <br><br> Credits: Mithril.js <br>License: MIT<br><br>"
                )
              );
            },
          }),
          m(
            "kbd",
            {
              class: "item",
              oncreate: () => {
                document.querySelector(".item").focus();
              },
            },
            "KaiOs Ads"
          ),

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

  var show_pdf = {
    view: function () {
      return m("div", {}, [
        m("div", {
          id: "pdf-container",
          oninit: () => {
            helper.bottom_bar(
              "<img src='assets/images/plus.svg'>",
              "",
              "<img src='assets/images/minus.svg'>"
            );
            pdf_viewer(selected_image_url);
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
    "/show_pdf": show_pdf,
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

        if (m.route.get().includes("/show_pdf")) {
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

        if (m.route.get().includes("/show_pdf")) {
          m.route.set("/start");
          break;
        }

        if (m.route.get().includes("/start")) {
          window.close();
        }
        break;

      case "SoftLeft":
      case "Control":
        if (m.route.get().includes("/show_image")) {
          m.route.set("/show_qr_content");
          break;
        }

        if (m.route.get().includes("/show_pdf")) {
          zoomIn();
          break;
        }

        break;

      case "SoftRight":
      case "Alt":
        if (m.route.get().includes("/show_pdf")) {
          zoomOut();
          break;
        }

        if (m.route.get().includes("/start")) {
          m.route.set("/options");

          break;
        }
        break;

      case "1":
        break;

      case "Enter":
        break;

      case "ArrowRight":
        if (m.route.get().includes("/show_pdf")) {
          pdfContainer.scrollLeft += 50; // Adjust the scroll distance as needed
        }

        break;

      case "ArrowLeft":
        if (m.route.get().includes("/show_pdf")) {
          pdfContainer.scrollLeft -= 50; // Adjust the scroll distance as needed
        }

        break;

      case "ArrowUp":
        if (m.route.get().includes("/show_pdf")) {
          pdfContainer.scrollTop -= 50; // Adjust the scroll distance as needed
        }
        if (
          m.route.get().includes("/start") ||
          m.route.get().includes("/options")
        ) {
          nav(-1);
        }
        break;

      case "ArrowDown":
        if (m.route.get().includes("/show_pdf")) {
          pdfContainer.scrollTop += 50; // Adjust the scroll distance as needed
        }
        if (
          m.route.get().includes("/start") ||
          m.route.get().includes("/options")
        ) {
          nav(+1);
        }
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
