"use strict";

function notify(param_title, param_text, param_silent, requireInteraction) {
  var options = {
    body: param_text,
    silent: param_silent,
    requireInteraction: requireInteraction,
  };

  // Let's check if the browser supports notifications
  if (!("Notification" in window)) {
    alert("This browser does not support desktop notification");
  }

  // Let's check whether notification permissions have already been granted
  else if (Notification.permission === "granted") {
    // If it's okay let's create a notification
    var notification = new Notification(param_title, options);
  }

  // Otherwise, we need to ask the user for permission
  else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(function (permission) {
      // If the user accepts, let's create a notification
      if (permission === "granted") {
        var notification = new Notification(param_title, options, action);

        document.addEventListener("visibilitychange", function () {
          if (document.visibilityState === "visible") {
            // The tab has become visible so clear the now-stale Notification.
            notification.close();

            toaster("yes", 2000);
          }
        });
      }
    });
  }
}

//bottom bar
let bottom_bar = function (left, center, right) {
  document.querySelector("div#bottom-bar div#button-left").innerHTML = left;
  document.querySelector("div#bottom-bar div#button-center").innerHTML = center;
  document.querySelector("div#bottom-bar div#button-right").innerHTML = right;

  if (left == "" && center == "" && right == "") {
    document.querySelector("div#bottom-bar").style.display = "none";
  } else {
    document.querySelector("div#bottom-bar").style.display = "block";
  }
};

//top bar
let top_bar = function (left, center, right) {
  document.querySelector("div#top-bar div.button-left").innerHTML = left;
  document.querySelector("div#top-bar div.button-center").textContent = center;
  document.querySelector("div#top-bar div.button-right").textContent = right;

  if (left == "" && center == "" && right == "") {
    document.querySelector("div#top-bar").style.display = "none";
  } else {
    document.querySelector("div#top-bar").style.display = "block";
  }
};

//wake up screen
function screenWakeLock(param1) {
  if (param1 == "lock") {
    lock = window.navigator.requestWakeLock("screen");

    lock.onsuccess = function () {
      toaster("screen-lock", 10000);
    };

    lock.onerror = function () {
      alert("An error occurred: " + this.error.name);
    };
  }

  if (param1 == "unlock") {
    if (lock.topic == "screen") {
      lock.unlock();
    }
  }
}

function write_file(data, filename) {
  var sdcard = navigator.getDeviceStorages("sdcard");
  var file = new Blob([data], {
    type: "image/png ",
  });
  var request = sdcard[1].addNamed(file, filename);

  request.onsuccess = function () {
    var name = this.result;
    toaster(
      'File "' + name + '" successfully wrote on the sdcard storage area',
      2000
    );
  };

  // An error typically occur if a file with the same name already exist
  request.onerror = function () {
    toaster("Unable to write the file: " + this.error, 2000);
  };
}

function share(url, name) {
  var activity = new MozActivity({
    name: "share",
    data: {
      type: "image/*",
      number: 1,
      blobs: [url],
      filenames: [name],
    },
  });

  activity.onsuccess = function () {};

  activity.onerror = function () {
    console.log("The activity encounter en error: " + this.error);
  };
}

function deleteFile(storage, path, notification) {
  let sdcard = navigator.getDeviceStorages("sdcard");

  let requestDel = sdcard[storage].delete(path);

  requestDel.onsuccess = function () {
    if (notification == "notification") {
      toaster(
        'File "' + name + '" successfully deleted frome the sdcard storage area'
      );
    }
  };

  requestDel.onerror = function () {
    toaster("Unable to delete the file: " + this.error);
  };
}

let get_file = function (file) {
  var sdcard = navigator.getDeviceStorages("sdcard");

  var request = sdcard.get(file, blob);

  request.onsuccess = function () {
    var file = this.result;
    console.log("Get the file: " + file.name);
  };

  request.onerror = function () {
    console.warn("Unable to get the file: " + this.error);
  };
};

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

        document.querySelector("[data-filepath='" + filename + "']").innerText =
          new_filename + "." + file_extension;

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
