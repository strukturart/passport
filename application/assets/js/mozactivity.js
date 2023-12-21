const mozactivity = (() => {
  let share_position = function () {
    let a =
      "https://www.openstreetmap.org/?mlat=" +
      mainmarker.current_lat +
      "&mlon=" +
      mainmarker.current_lng +
      "#map=13/" +
      mainmarker.current_lat +
      "/" +
      mainmarker.current_lng +
      "&layers=T";
    try {
      let activity = new MozActivity({
        name: "share",
        data: {
          type: "url",
          url: a,
        },
      });

      activity.onsuccess = function () {
        console.log("successfully shared");
      };

      activity.onerror = function () {
        console.log("The activity encounter en error: " + this.error);
      };
    } catch (e) {}

    try {
      let activity = new WebActivity("share", { type: "url", url: a });
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
        callback(pick);
      };

      pick.onerror = function () {
        general.blocker = false;
        console.log("The activity encounter en error: " + this.error);
      };
    } catch (e) {
      console.log(e);
    }

    try {
      let pick = new WebActivity({
        name: "pick",
        data: {
          type: ["image/png", "image/jpg", "image/jpeg"],
        },
      });

      pick.start().then(
        (rv) => {
          general.blocker = false;
          callback(pick);

          console.log("Results passed back from activity handler:");
          console.log(rv);
        },
        (err) => {
          general.blocker = false;

          console.log(err);
        }
      );
    } catch (e) {}
  };

  return {
    photo,
    share_position,
    openSettings,
    pickGallery,
  };
})();
