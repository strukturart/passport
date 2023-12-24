const mozactivity = (() => {
  const photo = function () {
    try {
      let activity = new MozActivity({
        name: "record",
        data: {
          type: ["photos", "videos"],
        },
      });

      activity.onsuccess = function () {
        console.log("successfully");
      };

      activity.onerror = function () {
        console.log("The activity encounter en error: " + this.error);
      };
    } catch (e) {}

    try {
      let activity = new WebActivity("record", {
        data: {
          type: ["photos", "videos"],
        },
      });
      activity.start().then(
        (rv) => {
          console.log("Results passed back from activity handler:");
          console.log(rv);
        },
        (err) => {
          console.log(err);
        }
      );
    } catch (e) {}
  };

  const openSettings = function () {
    try {
      let activity = new MozActivity({
        name: "configure",
        data: {
          target: "device",
          section: "connectivity-settings",
        },
      });

      activity.onsuccess = function () {
        console.log("successfully");
      };

      activity.onerror = function () {
        console.log("The activity encounter en error: " + this.error);
      };
    } catch (e) {}

    try {
      let activity = new WebActivity("configure", {
        data: {
          target: "device",
          section: "connectivity-settings",
        },
      });
      activity.start().then(
        (rv) => {
          console.log("Results passed back from activity handler:");
          console.log(rv);
        },
        (err) => {
          console.log(err);
        }
      );
    } catch (e) {}
  };

  let pickGallery = (callback) => {
    try {
      let pick = new MozActivity({
        name: "pick",
        data: {
          type: ["image/png", "image/jpg", "image/jpeg"],
        },
      });

      pick.onsuccess = function (e) {
        callback(pick, "k2");
      };

      pick.onerror = function () {
        general.blocker = false;
        console.log("The activity encounter en error: " + this.error);
      };
    } catch (e) {
      console.log(e);
    }

    if ("b2g" in navigator) {
      let pick = new WebActivity("pick", {
        data: {
          type: ["image/png", "image/jpg", "image/jpeg"],
        },
      });

      pick.start().then(
        (rv) => {
          general.blocker = false;
          callback(rv, "k3");
        },
        (err) => {
          general.blocker = false;

          console.log(err);
        }
      );
    }
  };

  return {
    photo,
    openSettings,
    pickGallery,
  };
})();
