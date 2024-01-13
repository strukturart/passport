"use strict";

let debug = false;
let filter_query;
let file_content = [];
let content = "";
let current_file;
let files = JSON.parse(localStorage.getItem("files")) || [];
console.log("start:", files);

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

let save_files = () => {
  localStorage.setItem("files", JSON.stringify(files));
};

let url_test = (string) => {
  // Regular expression for a basic URL validation
  const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;

  return urlRegex.test(string);
};

//https://github.com/ertant/vCard

let vcard_parser = (string) => {
  console.log(vCardParser.parse(string));
};

function formatVCardContent(content) {
  // Replace LF with CRLF and add CRLF at the end if not present
  return (
    content.replace(/\r?\n/g, "\r\n") + (content.endsWith("\r\n") ? "" : "\r\n")
  );
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

let filename_list = [];
//list files
let read_files = (callback) => {
  //files = [];
  try {
    var d = navigator.getDeviceStorage("sdcard");

    var cursor = d.enumerate();

    cursor.onsuccess = function () {
      if (!this.result) {
        // Remove  element from files array

        for (let i = 0; i < files.length; i++) {
          if (filename_list.indexOf(files[i].path) == -1) {
            files.splice(i, 1);
          }
        }
        save_files();

        m.route.set("/start");

        callback();
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
          //update files array if exist
          filename_list.push(file.name);
          let fileExists = false;
          files.forEach((e) => {
            if (e.path == file.name) {
              fileExists = true;
              e.file = f;
            }
          });

          if (!fileExists) {
            files.push({
              "path": file.name,
              "name": file_name,
              "file": f,
              "type": type[type.length - 1],
              "qr": true,
            });
          }
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
                let fileExists = false;
                files.forEach((e) => {
                  if (e.path == file.name) {
                    fileExists = true;
                    e.file = f;
                  }
                });

                if (!fileExists) {
                  files.push({
                    "path": file.name,
                    "name": file_name,
                    "file": f,
                    "type": type[type.length - 1],
                    "qr": true,
                  });
                }
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

let load_qrcode_content = (blobUrl) => {
  document.querySelector(".loading-spinner").style.display = "block";

  const img = new Image();

  img.onload = function () {
    const width = img.width;
    const height = img.height;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, width, height);
    const code = jsQR(imageData.data, width, height);

    if (code) {
      qrcode_content = code.data;
      helper.bottom_bar("<img src='assets/images/eye.svg'>", "", "");
      document.querySelector(".loading-spinner").style.display = "none";
    } else {
      qrcode_content = "";
      helper.bottom_bar("", "", "");
      document.querySelector(".loading-spinner").style.display = "none";

      files.forEach((e) => {
        if (e.path == selected_image_url) {
          e.qr = false;
        }
      });

      save_files();
    }
  };

  img.onerror = function () {
    console.error("Failed to load the image.");
    document.querySelector(".loading-spinner").style.display = "none";
  };

  img.src = blobUrl;
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

function write_file(data, filename, filetype) {
  let sdcard;
  if ("b2g" in navigator) {
    sdcard = navigator.b2g.getDeviceStorage("sdcard");
  } else {
    sdcard = navigator.getDeviceStorage("sdcard");
  }

  var file = new Blob([data], {
    type: filetype,
  });
  var request = sdcard.addNamed(file, filename);

  request.onsuccess = function () {
    //files = [];
    read_files();
    startup = false;
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
      write_file(blob, "passport/" + f + ".png", "image/png");
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
      p = m.route.param("focus") || "";
      console.log("focus:" + p);
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
          [m("kbd", { id: "intro-icon" }, "passport")]
        ),
        m(
          "ul",
          {
            id: "files-list",
            oninit: () => {},
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
                        document.querySelector("#no-file").style.display =
                          "none";
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

        m("div", {
          id: "text",
          oncreate: ({ dom }) => {
            m.render(
              dom,
              m.trust(
                "<em class='item'></em>" +
                  "<kbd class='title'>Passport</kbd><br>" +
                  "The app is a file viewer for JPG, PNG, and PDF files. It should help you display your QR code tickets more quickly during checks. The files must be stored in the directory /passport so that they can be displayed. <br><br>" +
                  "<em class='item'></em>" +
                  "<em class='item'></em>" +
                  "<kbd>Good to know</kbd><br>With key 2, you can rename or delete files<br><br>" +
                  "<kbd>Credits</kbd><br>Mithril.js, PDF.js<br><br>" +
                  "<em class='item'></em>" +
                  "<kbd>License</kbd><br> MIT<br><br>" +
                  "<em class='item'></em>" +
                  "<kbd>KaiOS Ads</kbd><br>" +
                  "<div id='KaiOsAds-Wrapper' class='item'></div>"
              )
            );
          },
        })
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
            console.log(selected_image_url);
          },
          oncreate: () => {
            qrcode_content = "";
            helper.bottom_bar("", "", "");
            try {
              files.forEach((e) => {
                if (e.path == selected_image_url) {
                  if (e.qr) {
                    load_qrcode_content(selected_image);
                  } else {
                    qrcode_content = "";
                    helper.bottom_bar("", "", "");
                    document.querySelector(".loading-spinner").style.display =
                      "none";
                  }
                }
              });
            } catch (e) {
              document.querySelector(".loading-spinner").style.display = "none";
            }
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

  let read_file_callback = (e) => {
    content = e;
    document.querySelector("#qr-content").textContent = e;
  };
  var show_vcf = {
    view: function () {
      return m("div", {}, [
        m(
          "div",
          {
            id: "qr-content",
            oninit: () => {
              helper.bottom_bar("", "", "");
              helper.readFile(selected_image_url, read_file_callback);
            },
          },
          ""
        ),
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

            if (url_test(qrcode_content)) {
              helper.bottom_bar("<img src='assets/images/link.svg'>", "", "");
            }

            if (qrcode_content.startsWith("BEGIN:VCARD")) {
              let a = confirm(
                "Looks like it's a vCard, do you want to save it as a vcard file."
              );
              if (a) {
                let name = new Date() / 1000 + ".vcf";
                write_file(
                  formatVCardContent(qrcode_content),
                  "passport/" + name,
                  "text/vcard"
                );
              }
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
    "/show_vcf": show_vcf,

    "/start": start,
    "/options": options,
    "/scan": scan,
  });

  m.route.prefix = "#";

  let pickGalllery_callback = (e, k) => {
    general.blocker = false;

    //KaiOS 2
    if (k == "k2") {
      let fileName = e.result.blob.name.split("/");
      fileName = fileName[fileName.length - 1];
      let type = fileName.includes(".png") ? "image/png" : "image/jpeg";
      write_file(e.result.blob, "passport/" + fileName, type);
    }

    //KaiOS 3
    if (k == "k3") {
      let fileName = e.filename.split("/");
      fileName = fileName[fileName.length - 1];
      write_file(e.blob, "passport/" + fileName, e.type);
    }
  };

  let renameFile_callback = (filename) => {
    general.blocker = false;
    let cb = () => {
      m.route.set("/start?focus=+/sdcard/passport/" + filename);
    };
    files = [];
    read_files(cb);
  };

  let deleteFile_callback = (filename) => {
    general.blocker = false;

    let cb = () => {
      if (files.length == 0) {
        setTimeout(() => {
          m.route.set("/start");
        }, 1000);
      } else {
        let currentFileElement = document.querySelector(
          "[data-path='" + filename + "']"
        );

        // Get the tabindex attribute value and convert it to a number
        let tabindex = currentFileElement.getAttribute("tabindex");
        tabindex = Number(tabindex) - 1;
        tabindex_next = tabindex + 2;

        // Find the next element with the adjusted tabindex and set focus
        let nextElement = document.querySelector(
          "[tabindex='" + tabindex + "']"
        );

        if (nextElement) {
          nextElement.focus();
        } else {
          nextElement = document.querySelector(
            "[tabindex='" + tabindex_next + "']"
          );
          nextElement.focus();
        }
      }
    };
    files = [];
    read_files(cb);
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

        if (general.importAction) {
          m.route.set("/start");
          general.importAction = false;
          helper.bottom_bar(
            "<img src='assets/images/save.svg'>",
            "",
            "<img src='assets/images/option.svg'>"
          );
        } else if (m.route.get().includes("/show_image")) {
          m.route.set("/start?focus=" + selected_image_url);
        } else if (m.route.get().includes("/show_pdf")) {
          m.route.set("/start?focus=" + selected_image_url);
        } else if (m.route.get().includes("/show_vcf")) {
          m.route.set("/start?focus=" + selected_image_url);
        } else if (m.route.get().includes("/options")) {
          m.route.set("/start");
        } else if (m.route.get().includes("/scan")) {
          m.route.set("/start");
        } else if (
          m.route.get().includes("/start") &&
          general.importAction == false
        ) {
          // window.close();
        } else if (m.route.get().includes("/show_qr_content")) {
          if (status == "after_scan") {
            m.route.set("/start");
          } else {
            m.route.set("/show_image");
          }
        } else {
          window.close();
        }
        break;

      case "EndCall":
        evt.preventDefault();

        if (m.route.get().includes("/show_image")) {
          m.route.set("/start?focus=" + selected_image_url);
        } else if (m.route.get().includes("/show_pdf")) {
          m.route.set("/start?focus=" + selected_image_url);
        } else if (m.route.get().includes("/show_vcf")) {
          m.route.set("/start?focus=" + selected_image_url);
        } else {
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

        if (m.route.get().includes("/show_qr_content")) {
          if (url_test(qrcode_content)) window.open(qrcode_content);
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
            helper.deleteFile(filePath, deleteFile_callback);
            break;
          }
          if (
            m.route.get().includes("/start") &&
            general.importAction &&
            general.blocker == false
          ) {
            general.blocker = true;
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

        if (
          m.route.get().includes("/start") &&
          general.importAction &&
          general.blocker == false
        ) {
          m.route.set("/scan");
          general.importAction = false;
        } else {
          selected_image = document.activeElement.getAttribute("data-file");
          selected_image_url = document.activeElement.getAttribute("data-path");
          if (selected_image == null) return false;
          if (files.length == 0) return false;

          if (document.activeElement.getAttribute("data-type") == "pdf") {
            m.route.set("/show_pdf");
          } else if (
            document.activeElement.getAttribute("data-type") == "vcf"
          ) {
            m.route.set("/show_vcf");
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
        if (m.route.get().includes("/start") && files.length > 0) {
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
    }

    if (evt.key === "Backspace") {
      evt.preventDefault();
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
