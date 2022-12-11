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
function bottom_bar(left, center, right) {
  document.querySelector("div#bottom-bar div#button-left").textContent = left;
  document.querySelector(
    "div#bottom-bar div#button-center"
  ).textContent = center;
  document.querySelector("div#bottom-bar div#button-right").textContent = right;

  if (left == "" && center == "" && right == "") {
    document.querySelector("div#bottom-bar").style.display = "none";
  } else {
    document.querySelector("div#bottom-bar").style.display = "block";
  }
}

//top bar
function top_bar(left, center, right) {
  document.querySelector("div#top-bar div.button-left").innerHTML = left;
  document.querySelector("div#top-bar div.button-center").textContent = center;
  document.querySelector("div#top-bar div.button-right").textContent = right;

  if (left == "" && center == "" && right == "") {
    document.querySelector("div#top-bar").style.display = "none";
  } else {
    document.querySelector("div#top-bar").style.display = "block";
  }
}


//check if internet connection
function check_iconnection() {
  function updateOfflineStatus() {
    toaster("Your Browser is offline", 15000);
    return false;
  }

  window.addEventListener("offline", updateOfflineStatus);
}

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

window.goodbye = function () {
  document.getElementById("goodbye").style.display = "block";

  if (localStorage.clickcount) {
    localStorage.clickcount = Number(localStorage.clickcount) + 1;
  } else {
    localStorage.clickcount = 1;
  }

  if (localStorage.clickcount == 3) {
    message();
  } else {
    document.getElementById("ciao").style.display = "block";
    setTimeout(function () {
      window.close();
    }, 4000);
  }

  function message() {
    document.getElementById("donation").style.display = "block";
    setTimeout(function () {
      localStorage.clickcount = 1;

      window.close();
    }, 6000);
  }
};

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

let rename_file = function (filepath, filename, storage) {
  window_status = "rename";

  let sdcard = navigator.getDeviceStorages("sdcard");
  let request = sdcard[storage].get(filepath);

  request.onsuccess = function () {
    let fileget = this.result;
    let filetype = fileget.type;
    let file_extension = fileget.name.split(".");
    file_extension = file_extension[file_extension.length - 1];
    let filepath_mod = filepath.replace(filename, "");

    let newfilename = prompt(lang[user_lang].rename, "");

    let requestAdd = sdcard[storage].addNamed(
      fileget,
      filepath_mod + newfilename + "." + file_extension
    );
    requestAdd.onsuccess = function () {
      var request_del = sdcard[storage].delete(filepath);

      request_del.onsuccess = function () {
        // success copy and delete
      };

      request_del.onerror = function () {
        // success copy not delete
        alert("Unable to remove the file: " + this.error);
      };

      finder();
    };
    requestAdd.onerror = function () {
      alert("Unable to write the file: " + this.error);
    };
  };

  request.onerror = function () {
    alert(this.error);
  };
};
