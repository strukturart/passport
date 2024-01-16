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

  let pickContact = (callback) => {
    try {
      let pick = new MozActivity({
        name: "pick",
        data: {
          type: ["webcontacts/contact"],
        },
      });

      pick.onsuccess = function (e) {
        callback(pick.result.contact, "k2");
      };

      pick.onerror = function () {
        general.blocker = false;
        console.log("The activity encounter en error: " + this.error);
      };
    } catch (e) {
      console.log(e);
      general.blocker = false;
    }

    if ("b2g" in navigator) {
      let pick = new WebActivity("pick", {
        type: "webcontacts/contact",
      });

      pick.start().then(
        (rv) => {
          general.blocker = false;

          callback(rv.contact, "k3");
        },
        (err) => {
          general.blocker = false;

          console.log(err);
        }
      );
    }
  };

  var sms = (n) => {
    const smsLink = document.createElement("a");

    smsLink.href = "sms:" + n;

    smsLink.textContent = "Call Now";

    document.body.appendChild(smsLink);

    smsLink.addEventListener("click", function () {});

    smsLink.click();
    document.body.removeChild(smsLink);
  };

  let dial = (n) => {
    // Create the <a> element
    const telLink = document.createElement("a");

    // Set the href attribute with the tel: protocol
    telLink.href = "tel:" + n;

    // Set the text content of the link
    telLink.textContent = "Call Now";

    // Append the link to the body (or any other desired container)
    document.body.appendChild(telLink);

    telLink.addEventListener("click", function () {});

    telLink.click();

    document.body.removeChild(telLink);
  };

  return {
    photo,
    openSettings,
    pickGallery,
    dial,
    sms,
    pickContact,
  };
})();
