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
let status;

let general = {
  fileAction: false,
  importAction: false,
  blocker: false,
};

if (debug) {
  window.onerror = function (msg, url, linenumber) {
    alert(
      "Error message: " + msg + "\nURL: " + url + "\nLine Number: " + linenumber
    );
    return true;
  };
}

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
  general.fileAction = false;
  general.importAction = false;

  set_tabindex();

  const currentIndex = document.activeElement.tabIndex;
  let next = currentIndex + move;
  let items = 0;

  items = document.querySelectorAll(".item");

  let targetElement = 0;

  console.log(next);

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
  if (m.route.get().includes("/start")) {
    helper.bottom_bar(
      "<img src='assets/images/save.svg'>",
      "<img src='assets/images/select.svg'>",
      "<img src='assets/images/option.svg'>"
    );
  }
};

let scroll_into_center = () => {
  const rect = document.activeElement.getBoundingClientRect();
  const elY =
    rect.top - document.body.getBoundingClientRect().top + rect.height / 2;

  document.activeElement.parentElement.parentElement.scrollBy({
    left: 0,
    top: elY - window.innerHeight / 2,
    behavior: "smooth",
  });
};

try {
  var d = navigator.getDeviceStorage("sdcard");
  if ("b2g" in navigator) {
    d = navigator.b2g.getDeviceStorage("sdcard");
  }

  d.get("passport").then((j) => {});

  d.getRoot().then((e) => {
    e.createDirectory("passport")
      .then((h) => {
        console.log("done");
      })
      .catch((error) => {});
  });
} catch (e) {}

//list dic
let read_files = () => {
  files = [];
  try {
    var d = navigator.getDeviceStorage("sdcard");

    var cursor = d.enumerate();

    cursor.onsuccess = function () {
      if (!this.result) {
        m.route.set("/start");
      }
      if (cursor.result.name !== null) {
        let file = cursor.result;
        let m = file.name.split("/");
        let file_name = m[m.length - 1];
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
              let m = file.value.name.split("/");
              let file_name = m[m.length - 1];

              let f = "";

              try {
                f = URL.createObjectURL(file.value);
              } catch (e) {}

              if (
                file.value.name.includes("/passport/") &&
                !file.value.name.includes("/sdcard/.")
              ) {
                files.push({
                  path: file.value.name,
                  file: f,
                  type: file_name.split(".").pop(),
                  name: file_name,
                });
              }

              next(_files);
            }
            if (file.done) m.route.set("/start");
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
};
read_files();

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

function write_file(data, filename) {
  let sdcard;
  if ("b2g" in navigator) {
    sdcard = navigator.b2g.getDeviceStorage("sdcard");
  } else {
    sdcard = navigator.getDeviceStorage("sdcard");
  }

  var file = new Blob([data], {
    type: "image/png ",
  });
  var request = sdcard.addNamed(file, filename);

  request.onsuccess = function () {
    files = [];
    read_files();
    startup = true;
    m.route.set("/start?focus=" + filename);
  };

  // An error typically occur if a file with the same name already exist
  request.onerror = function () {
    helper.side_toaster("Unable to write the file", 10000);
    m.route.set("/start");
  };
}

let generate_qr = (string) => {
  status = "";

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
      let f = new Date();
      f = f / 1000;
      write_file(blob, "passport/" + f + ".png");
    });
};

//VIEWS

let startup = true;
let t = 4000;

document.addEventListener("DOMContentLoaded", function () {
  var root = document.querySelector("main");
  var p = "";

  //VIEWS
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
                status = "";
              }
            },
          },
          [m("img", { src: "assets/icons/icon-112-112.png" })]
        ),
        m(
          "ul",
          {
            id: "files-list",
            oninit: () => {
              p = m.route.param("focus") || "";
            },
            oncreate: ({ dom }) => {
              setTimeout(() => {
                if (files.length == 0) {
                  dom,
                    m.render(
                      dom,
                      m.trust(
                        "<div id='no-file'>No file found<br>Please put your files in the created folder <kbd>/passport</kbd></div>"
                      )
                    );

                  helper.bottom_bar(
                    "<img src='assets/images/save.svg'>",
                    "",
                    "<img src='assets/images/option.svg'>"
                  );
                } else {
                  helper.bottom_bar(
                    "<img src='assets/images/save.svg'>",
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
                    if (e.path.includes(p)) {
                      setTimeout(() => {
                        dom.focus();
                        scroll_into_center();
                      }, 400);
                    }
                    if (i == 1 && p == "") {
                      dom.focus();
                      document.querySelector("#no-file").style.display = "none";
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
                  "The app is a file viewer for JPG, PNG and PDF files. It should help you display your QR code tickets more quickly during checks.The files must be stored in the directory /passport so that they can be displayed. <br><br> Credits: Mithril.js, PDF.js <br>License: MIT<br><br>"
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
            if (status == "after_scan") {
              helper.bottom_bar("", "<img src='assets/images/save.svg'>", "");
            }
          },
        },
        qrcode_content
      );
    },
  };
  let scan_callback = (e) => {
    qrcode_content = e;
    m.route.set("/show_qr_content");
    status = "after_scan";
  };

  var scan = {
    view: function () {
      return m("div", [
        m("video", {
          id: "video",
          oncreate: () => {
            helper.bottom_bar("", "", "");
            qr.start_scan(scan_callback);
          },
        }),
        m("div", { id: "corner-nw" }),
        m("div", { id: "corner-no" }),
        m("div", { id: "corner-so" }),
        m("div", { id: "corner-sw" }),
      ]);
    },
  };

  m.route(root, "/start", {
    "/show_qr_content": show_qr_content,
    "/show_image": show_image,
    "/show_pdf": show_pdf,
    "/start": start,
    "/options": options,
    "/scan": scan,
  });

  m.route.prefix = "#";

  let pickGalllery_callback = (e) => {
    let fileName = e.result.blob.name.split("/");
    fileName = fileName[fileName.length - 1];

    write_file(e.result.blob, "passport/" + fileName);
  };

  let renameFile_callback = (filename) => {
    read_files();

    setTimeout(() => {
      document.querySelector("[data-filepath='" + filename + "']").focus();
    }, 2000);
  };

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
          m.route.set("/start?focus=" + selected_image_url);

          break;
        }

        if (m.route.get().includes("/show_pdf")) {
          m.route.set("/start?focus=" + selected_image_url);

          break;
        }

        if (m.route.get().includes("/options")) {
          m.route.set("/start");
          break;
        }

        if (m.route.get().includes("/scan")) {
          m.route.set("/start");
          break;
        }
        if (m.route.get().includes("/start")) {
          window.close();
        }
        if (m.route.get().includes("/show_qr_content")) {
          if (status == "after_scan") {
            m.route.set("/start");
          } else {
            m.route.set("/show_image");
          }
          break;
        }

      case "EndCall":
        evt.preventDefault();

        if (m.route.get().includes("/show_image")) {
          m.route.set("/start?focus=" + selected_image_url);

          break;
        }

        if (m.route.get().includes("/show_pdf")) {
          m.route.set("/start?focus=" + selected_image_url);

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

        if (m.route.get().includes("/start")) {
          if (general.fileAction) {
            general.blocker = true;
            let name = String(window.prompt("Enter name", ""));
            if (name !== null) {
              helper.renameFile(
                document.activeElement.getAttribute("data-path"),
                name,
                renameFile_callback
              );
              setTimeout(() => {
                general.blocker = false;
              }, 2000);
            } else {
              setTimeout(() => {
                general.blocker = false;
              }, 2000);
            }
          } else {
            general.importAction = true;
            helper.bottom_bar(
              "",
              "<img src='assets/images/qr.svg'>",
              "<img src='assets/images/image.svg'>"
            );
          }

          break;
        }
        break;

      case "SoftRight":
      case "Alt":
        if (m.route.get().includes("/show_pdf")) {
          zoomOut();
        }

        if (m.route.get().includes("/start")) {
          if (general.fileAction) {
            let filePath = document.activeElement.getAttribute("data-path");
            helper.deleteFile(filePath);
            break;
          }
          if (general.importAction) {
            mozactivity.pickGallery(pickGalllery_callback);
            break;
          }

          if (general.importAction == false && general.fileAction == false) {
            m.route.set("/options");
          }
        }

        break;

      case "Enter":
        if (m.route.get().includes("/show_qr_content")) {
          if (status != "") {
            generate_qr(qrcode_content);
          }
        }

        if (m.route.get().includes("/start") && general.importAction) {
          m.route.set("/scan");
          general.importAction = false;
        } else {
          selected_image = document.activeElement.getAttribute("data-file");
          selected_image_url = document.activeElement.getAttribute("data-path");

          if (document.activeElement.getAttribute("data-type") == "pdf") {
            m.route.set("/show_pdf");
          } else {
            m.route.set("/show_image");
          }
        }

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

      case "2":
        if (m.route.get().includes("/start")) {
          general.fileAction = true;
          helper.bottom_bar(
            "<img src='assets/images/pencil.svg'>",
            "",
            "<img src='assets/images/delete.svg'>"
          );
        }

        break;
    }
  }

  /////////////////////////////////
  ////shortpress / longpress logic
  ////////////////////////////////

  function handleKeyDown(evt) {
    if (general.blocker) return false;

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
    if (general.blocker) return false;

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
