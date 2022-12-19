"use strict";
var $jscomp = $jscomp || {};
$jscomp.scope = {};
$jscomp.ASSUME_ES5 = !1;
$jscomp.ASSUME_NO_NATIVE_MAP = !1;
$jscomp.ASSUME_NO_NATIVE_SET = !1;
$jscomp.SIMPLE_FROUND_POLYFILL = !1;
$jscomp.ISOLATE_POLYFILLS = !1;
$jscomp.FORCE_POLYFILL_PROMISE = !1;
$jscomp.FORCE_POLYFILL_PROMISE_WHEN_NO_UNHANDLED_REJECTION = !1;
$jscomp.defineProperty =
  $jscomp.ASSUME_ES5 || "function" == typeof Object.defineProperties
    ? Object.defineProperty
    : function (c, e, a) {
        if (c == Array.prototype || c == Object.prototype) return c;
        c[e] = a.value;
        return c;
      };
$jscomp.getGlobal = function (c) {
  c = [
    "object" == typeof globalThis && globalThis,
    c,
    "object" == typeof window && window,
    "object" == typeof self && self,
    "object" == typeof global && global,
  ];
  for (var e = 0; e < c.length; ++e) {
    var a = c[e];
    if (a && a.Math == Math) return a;
  }
  throw Error("Cannot find global object");
};
$jscomp.global = $jscomp.getGlobal(this);
$jscomp.IS_SYMBOL_NATIVE =
  "function" === typeof Symbol && "symbol" === typeof Symbol("x");
$jscomp.TRUST_ES6_POLYFILLS =
  !$jscomp.ISOLATE_POLYFILLS || $jscomp.IS_SYMBOL_NATIVE;
$jscomp.polyfills = {};
$jscomp.propertyToPolyfillSymbol = {};
$jscomp.POLYFILL_PREFIX = "$jscp$";
var $jscomp$lookupPolyfilledValue = function (c, e) {
  var a = $jscomp.propertyToPolyfillSymbol[e];
  if (null == a) return c[e];
  a = c[a];
  return void 0 !== a ? a : c[e];
};
$jscomp.polyfill = function (c, e, a, b) {
  e &&
    ($jscomp.ISOLATE_POLYFILLS
      ? $jscomp.polyfillIsolated(c, e, a, b)
      : $jscomp.polyfillUnisolated(c, e, a, b));
};
$jscomp.polyfillUnisolated = function (c, e, a, b) {
  a = $jscomp.global;
  c = c.split(".");
  for (b = 0; b < c.length - 1; b++) {
    var d = c[b];
    if (!(d in a)) return;
    a = a[d];
  }
  c = c[c.length - 1];
  b = a[c];
  e = e(b);
  e != b &&
    null != e &&
    $jscomp.defineProperty(a, c, { configurable: !0, writable: !0, value: e });
};
$jscomp.polyfillIsolated = function (c, e, a, b) {
  var d = c.split(".");
  c = 1 === d.length;
  b = d[0];
  b = !c && b in $jscomp.polyfills ? $jscomp.polyfills : $jscomp.global;
  for (var f = 0; f < d.length - 1; f++) {
    var g = d[f];
    if (!(g in b)) return;
    b = b[g];
  }
  d = d[d.length - 1];
  a = $jscomp.IS_SYMBOL_NATIVE && "es6" === a ? b[d] : null;
  e = e(a);
  null != e &&
    (c
      ? $jscomp.defineProperty($jscomp.polyfills, d, {
          configurable: !0,
          writable: !0,
          value: e,
        })
      : e !== a &&
        (void 0 === $jscomp.propertyToPolyfillSymbol[d] &&
          ((a = (1e9 * Math.random()) >>> 0),
          ($jscomp.propertyToPolyfillSymbol[d] = $jscomp.IS_SYMBOL_NATIVE
            ? $jscomp.global.Symbol(d)
            : $jscomp.POLYFILL_PREFIX + a + "$" + d)),
        $jscomp.defineProperty(b, $jscomp.propertyToPolyfillSymbol[d], {
          configurable: !0,
          writable: !0,
          value: e,
        })));
};
$jscomp.underscoreProtoCanBeSet = function () {
  var c = { a: !0 },
    e = {};
  try {
    return (e.__proto__ = c), e.a;
  } catch (a) {}
  return !1;
};
$jscomp.setPrototypeOf =
  $jscomp.TRUST_ES6_POLYFILLS && "function" == typeof Object.setPrototypeOf
    ? Object.setPrototypeOf
    : $jscomp.underscoreProtoCanBeSet()
    ? function (c, e) {
        c.__proto__ = e;
        if (c.__proto__ !== e) throw new TypeError(c + " is not extensible");
        return c;
      }
    : null;
$jscomp.arrayIteratorImpl = function (c) {
  var e = 0;
  return function () {
    return e < c.length ? { done: !1, value: c[e++] } : { done: !0 };
  };
};
$jscomp.arrayIterator = function (c) {
  return { next: $jscomp.arrayIteratorImpl(c) };
};
$jscomp.makeIterator = function (c) {
  var e = "undefined" != typeof Symbol && Symbol.iterator && c[Symbol.iterator];
  return e ? e.call(c) : $jscomp.arrayIterator(c);
};
$jscomp.generator = {};
$jscomp.generator.ensureIteratorResultIsObject_ = function (c) {
  if (!(c instanceof Object))
    throw new TypeError("Iterator result " + c + " is not an object");
};
$jscomp.generator.Context = function () {
  this.isRunning_ = !1;
  this.yieldAllIterator_ = null;
  this.yieldResult = void 0;
  this.nextAddress = 1;
  this.finallyAddress_ = this.catchAddress_ = 0;
  this.finallyContexts_ = this.abruptCompletion_ = null;
};
$jscomp.generator.Context.prototype.start_ = function () {
  if (this.isRunning_) throw new TypeError("Generator is already running");
  this.isRunning_ = !0;
};
$jscomp.generator.Context.prototype.stop_ = function () {
  this.isRunning_ = !1;
};
$jscomp.generator.Context.prototype.jumpToErrorHandler_ = function () {
  this.nextAddress = this.catchAddress_ || this.finallyAddress_;
};
$jscomp.generator.Context.prototype.next_ = function (c) {
  this.yieldResult = c;
};
$jscomp.generator.Context.prototype.throw_ = function (c) {
  this.abruptCompletion_ = { exception: c, isException: !0 };
  this.jumpToErrorHandler_();
};
$jscomp.generator.Context.prototype.return = function (c) {
  this.abruptCompletion_ = { return: c };
  this.nextAddress = this.finallyAddress_;
};
$jscomp.generator.Context.prototype.jumpThroughFinallyBlocks = function (c) {
  this.abruptCompletion_ = { jumpTo: c };
  this.nextAddress = this.finallyAddress_;
};
$jscomp.generator.Context.prototype.yield = function (c, e) {
  this.nextAddress = e;
  return { value: c };
};
$jscomp.generator.Context.prototype.yieldAll = function (c, e) {
  c = $jscomp.makeIterator(c);
  var a = c.next();
  $jscomp.generator.ensureIteratorResultIsObject_(a);
  if (a.done) (this.yieldResult = a.value), (this.nextAddress = e);
  else return (this.yieldAllIterator_ = c), this.yield(a.value, e);
};
$jscomp.generator.Context.prototype.jumpTo = function (c) {
  this.nextAddress = c;
};
$jscomp.generator.Context.prototype.jumpToEnd = function () {
  this.nextAddress = 0;
};
$jscomp.generator.Context.prototype.setCatchFinallyBlocks = function (c, e) {
  this.catchAddress_ = c;
  void 0 != e && (this.finallyAddress_ = e);
};
$jscomp.generator.Context.prototype.setFinallyBlock = function (c) {
  this.catchAddress_ = 0;
  this.finallyAddress_ = c || 0;
};
$jscomp.generator.Context.prototype.leaveTryBlock = function (c, e) {
  this.nextAddress = c;
  this.catchAddress_ = e || 0;
};
$jscomp.generator.Context.prototype.enterCatchBlock = function (c) {
  this.catchAddress_ = c || 0;
  c = this.abruptCompletion_.exception;
  this.abruptCompletion_ = null;
  return c;
};
$jscomp.generator.Context.prototype.enterFinallyBlock = function (c, e, a) {
  a
    ? (this.finallyContexts_[a] = this.abruptCompletion_)
    : (this.finallyContexts_ = [this.abruptCompletion_]);
  this.catchAddress_ = c || 0;
  this.finallyAddress_ = e || 0;
};
$jscomp.generator.Context.prototype.leaveFinallyBlock = function (c, e) {
  e = this.finallyContexts_.splice(e || 0)[0];
  if ((e = this.abruptCompletion_ = this.abruptCompletion_ || e)) {
    if (e.isException) return this.jumpToErrorHandler_();
    void 0 != e.jumpTo && this.finallyAddress_ < e.jumpTo
      ? ((this.nextAddress = e.jumpTo), (this.abruptCompletion_ = null))
      : (this.nextAddress = this.finallyAddress_);
  } else this.nextAddress = c;
};
$jscomp.generator.Context.prototype.forIn = function (c) {
  return new $jscomp.generator.Context.PropertyIterator(c);
};
$jscomp.generator.Context.PropertyIterator = function (c) {
  this.object_ = c;
  this.properties_ = [];
  for (var e in c) this.properties_.push(e);
  this.properties_.reverse();
};
$jscomp.generator.Context.PropertyIterator.prototype.getNext = function () {
  for (; 0 < this.properties_.length; ) {
    var c = this.properties_.pop();
    if (c in this.object_) return c;
  }
  return null;
};
$jscomp.generator.Engine_ = function (c) {
  this.context_ = new $jscomp.generator.Context();
  this.program_ = c;
};
$jscomp.generator.Engine_.prototype.next_ = function (c) {
  this.context_.start_();
  if (this.context_.yieldAllIterator_)
    return this.yieldAllStep_(
      this.context_.yieldAllIterator_.next,
      c,
      this.context_.next_
    );
  this.context_.next_(c);
  return this.nextStep_();
};
$jscomp.generator.Engine_.prototype.return_ = function (c) {
  this.context_.start_();
  var e = this.context_.yieldAllIterator_;
  if (e)
    return this.yieldAllStep_(
      "return" in e
        ? e["return"]
        : function (a) {
            return { value: a, done: !0 };
          },
      c,
      this.context_.return
    );
  this.context_.return(c);
  return this.nextStep_();
};
$jscomp.generator.Engine_.prototype.throw_ = function (c) {
  this.context_.start_();
  if (this.context_.yieldAllIterator_)
    return this.yieldAllStep_(
      this.context_.yieldAllIterator_["throw"],
      c,
      this.context_.next_
    );
  this.context_.throw_(c);
  return this.nextStep_();
};
$jscomp.generator.Engine_.prototype.yieldAllStep_ = function (c, e, a) {
  try {
    var b = c.call(this.context_.yieldAllIterator_, e);
    $jscomp.generator.ensureIteratorResultIsObject_(b);
    if (!b.done) return this.context_.stop_(), b;
    var d = b.value;
  } catch (f) {
    return (
      (this.context_.yieldAllIterator_ = null),
      this.context_.throw_(f),
      this.nextStep_()
    );
  }
  this.context_.yieldAllIterator_ = null;
  a.call(this.context_, d);
  return this.nextStep_();
};
$jscomp.generator.Engine_.prototype.nextStep_ = function () {
  for (; this.context_.nextAddress; )
    try {
      var c = this.program_(this.context_);
      if (c) return this.context_.stop_(), { value: c.value, done: !1 };
    } catch (e) {
      (this.context_.yieldResult = void 0), this.context_.throw_(e);
    }
  this.context_.stop_();
  if (this.context_.abruptCompletion_) {
    c = this.context_.abruptCompletion_;
    this.context_.abruptCompletion_ = null;
    if (c.isException) throw c.exception;
    return { value: c.return, done: !0 };
  }
  return { value: void 0, done: !0 };
};
$jscomp.generator.Generator_ = function (c) {
  this.next = function (e) {
    return c.next_(e);
  };
  this.throw = function (e) {
    return c.throw_(e);
  };
  this.return = function (e) {
    return c.return_(e);
  };
  this[Symbol.iterator] = function () {
    return this;
  };
};
$jscomp.generator.createGenerator = function (c, e) {
  e = new $jscomp.generator.Generator_(new $jscomp.generator.Engine_(e));
  $jscomp.setPrototypeOf &&
    c.prototype &&
    $jscomp.setPrototypeOf(e, c.prototype);
  return e;
};
$jscomp.asyncExecutePromiseGenerator = function (c) {
  function e(b) {
    return c.next(b);
  }
  function a(b) {
    return c.throw(b);
  }
  return new Promise(function (b, d) {
    function f(g) {
      g.done ? b(g.value) : Promise.resolve(g.value).then(e, a).then(f, d);
    }
    f(c.next());
  });
};
$jscomp.asyncExecutePromiseGeneratorFunction = function (c) {
  return $jscomp.asyncExecutePromiseGenerator(c());
};
$jscomp.asyncExecutePromiseGeneratorProgram = function (c) {
  return $jscomp.asyncExecutePromiseGenerator(
    new $jscomp.generator.Generator_(new $jscomp.generator.Engine_(c))
  );
};
(function (c, e) {
  "object" === typeof exports && "undefined" !== typeof module
    ? (module.exports = e())
    : "function" === typeof define && define.amd
    ? define(e)
    : ((c = "undefined" !== typeof globalThis ? globalThis : c || self),
      (c.QrScanner = e()));
})(this, function () {
  class c {
    constructor(a, b, d, f, g) {
      this._legacyCanvasSize = c.DEFAULT_CANVAS_SIZE;
      this._preferredCamera = "environment";
      this._maxScansPerSecond = 25;
      this._lastScanTimestamp = -1;
      this._destroyed = this._flashOn = this._paused = this._active = !1;
      this.$video = a;
      this.$canvas = document.createElement("canvas");
      d && "object" === typeof d
        ? (this._onDecode = b)
        : (d || f || g
            ? console.warn(
                "You're using a deprecated version of the QrScanner constructor which will be removed in the future"
              )
            : console.warn(
                "Note that the type of the scan result passed to onDecode will change in the future. To already switch to the new api today, you can pass returnDetailedScanResult: true."
              ),
          (this._legacyOnDecode = b));
      b = "object" === typeof d ? d : {};
      this._onDecodeError =
        b.onDecodeError || ("function" === typeof d ? d : this._onDecodeError);
      this._calculateScanRegion =
        b.calculateScanRegion ||
        ("function" === typeof f ? f : this._calculateScanRegion);
      this._preferredCamera = b.preferredCamera || g || this._preferredCamera;
      this._legacyCanvasSize =
        "number" === typeof d
          ? d
          : "number" === typeof f
          ? f
          : this._legacyCanvasSize;
      this._maxScansPerSecond = b.maxScansPerSecond || this._maxScansPerSecond;
      this._onPlay = this._onPlay.bind(this);
      this._onLoadedMetaData = this._onLoadedMetaData.bind(this);
      this._onVisibilityChange = this._onVisibilityChange.bind(this);
      this._updateOverlay = this._updateOverlay.bind(this);
      a.disablePictureInPicture = !0;
      a.playsInline = !0;
      a.muted = !0;
      let k = !1;
      a.hidden && ((a.hidden = !1), (k = !0));
      document.body.contains(a) || (document.body.appendChild(a), (k = !0));
      d = a.parentElement;
      if (b.highlightScanRegion || b.highlightCodeOutline) {
        f = !!b.overlay;
        this.$overlay = b.overlay || document.createElement("div");
        g = this.$overlay.style;
        g.position = "absolute";
        g.display = "none";
        g.pointerEvents = "none";
        this.$overlay.classList.add("scan-region-highlight");
        if (!f && b.highlightScanRegion) {
          this.$overlay.innerHTML =
            '<svg class="scan-region-highlight-svg" viewBox="0 0 238 238" preserveAspectRatio="none" style="position:absolute;width:100%;height:100%;left:0;top:0;fill:none;stroke:#e9b213;stroke-width:4;stroke-linecap:round;stroke-linejoin:round"><path d="M31 2H10a8 8 0 0 0-8 8v21M207 2h21a8 8 0 0 1 8 8v21m0 176v21a8 8 0 0 1-8 8h-21m-176 0H10a8 8 0 0 1-8-8v-21"/></svg>';
          try {
            this.$overlay.firstElementChild.animate(
              { transform: ["scale(.98)", "scale(1.01)"] },
              {
                duration: 400,
                iterations: Infinity,
                direction: "alternate",
                easing: "ease-in-out",
              }
            );
          } catch (l) {}
          d.insertBefore(this.$overlay, this.$video.nextSibling);
        }
        b.highlightCodeOutline &&
          (this.$overlay.insertAdjacentHTML(
            "beforeend",
            '<svg class="code-outline-highlight" preserveAspectRatio="none" style="display:none;width:100%;height:100%;fill:none;stroke:#e9b213;stroke-width:5;stroke-dasharray:25;stroke-linecap:round;stroke-linejoin:round"><polygon/></svg>'
          ),
          (this.$codeOutlineHighlight = this.$overlay.lastElementChild));
      }
      this._scanRegion = this._calculateScanRegion(a);
      requestAnimationFrame(() => {
        let l = window.getComputedStyle(a);
        "none" === l.display &&
          (a.style.setProperty("display", "block", "important"), (k = !0));
        "visible" !== l.visibility &&
          (a.style.setProperty("visibility", "visible", "important"), (k = !0));
        k &&
          (console.warn(
            "QrScanner has overwritten the video hiding style to avoid Safari stopping the playback."
          ),
          (a.style.opacity = "0"),
          (a.style.width = "0"),
          (a.style.height = "0"),
          this.$overlay &&
            this.$overlay.parentElement &&
            this.$overlay.parentElement.removeChild(this.$overlay),
          delete this.$overlay,
          delete this.$codeOutlineHighlight);
        this.$overlay && this._updateOverlay();
      });
      a.addEventListener("play", this._onPlay);
      a.addEventListener("loadedmetadata", this._onLoadedMetaData);
      document.addEventListener("visibilitychange", this._onVisibilityChange);
      window.addEventListener("resize", this._updateOverlay);
      this._qrEnginePromise = c.createQrEngine();
    }
    static set WORKER_PATH(a) {
      console.warn(
        "Setting QrScanner.WORKER_PATH is not required and not supported anymore. Have a look at the README for new setup instructions."
      );
    }
    static hasCamera() {
      return $jscomp.asyncExecutePromiseGeneratorFunction(function* () {
        try {
          return !!(yield c.listCameras(!1)).length;
        } catch (a) {
          return !1;
        }
      });
    }
    static listCameras(a = !1) {
      return $jscomp.asyncExecutePromiseGeneratorFunction(function* () {
        if (!navigator.mediaDevices) return [];
        let b = () =>
            $jscomp.asyncExecutePromiseGeneratorFunction(function* () {
              return (yield navigator.mediaDevices.enumerateDevices()).filter(
                (f) => "videoinput" === f.kind
              );
            }),
          d;
        try {
          a &&
            (yield b()).every((f) => !f.label) &&
            (d = yield navigator.mediaDevices.getUserMedia({
              audio: !1,
              video: !0,
            }));
        } catch (f) {}
        try {
          return (yield b()).map((f, g) => ({
            id: f.deviceId,
            label: f.label || (0 === g ? "Default Camera" : `Camera ${g + 1}`),
          }));
        } finally {
          d &&
            (console.warn(
              "Call listCameras after successfully starting a QR scanner to avoid creating a temporary video stream"
            ),
            c._stopVideoStream(d));
        }
      });
    }
    hasFlash() {
      const a = this;
      return $jscomp.asyncExecutePromiseGeneratorFunction(function* () {
        let b;
        try {
          if (a.$video.srcObject) {
            if (!(a.$video.srcObject instanceof MediaStream)) return !1;
            b = a.$video.srcObject;
          } else b = (yield a._getCameraStream()).stream;
          return "torch" in b.getVideoTracks()[0].getSettings();
        } catch (d) {
          return !1;
        } finally {
          b &&
            b !== a.$video.srcObject &&
            (console.warn(
              "Call hasFlash after successfully starting the scanner to avoid creating a temporary video stream"
            ),
            c._stopVideoStream(b));
        }
      });
    }
    isFlashOn() {
      return this._flashOn;
    }
    toggleFlash() {
      const a = this;
      return $jscomp.asyncExecutePromiseGeneratorFunction(function* () {
        a._flashOn ? yield a.turnFlashOff() : yield a.turnFlashOn();
      });
    }
    turnFlashOn() {
      const a = this;
      return $jscomp.asyncExecutePromiseGeneratorFunction(function* () {
        if (
          !a._flashOn &&
          !a._destroyed &&
          ((a._flashOn = !0), a._active && !a._paused)
        )
          try {
            if (!(yield a.hasFlash())) throw "No flash available";
            yield a.$video.srcObject
              .getVideoTracks()[0]
              .applyConstraints({ advanced: [{ torch: !0 }] });
          } catch (b) {
            throw ((a._flashOn = !1), b);
          }
      });
    }
    turnFlashOff() {
      const a = this;
      return $jscomp.asyncExecutePromiseGeneratorFunction(function* () {
        a._flashOn && ((a._flashOn = !1), yield a._restartVideoStream());
      });
    }
    destroy() {
      this.$video.removeEventListener("loadedmetadata", this._onLoadedMetaData);
      this.$video.removeEventListener("play", this._onPlay);
      document.removeEventListener(
        "visibilitychange",
        this._onVisibilityChange
      );
      window.removeEventListener("resize", this._updateOverlay);
      this._destroyed = !0;
      this._flashOn = !1;
      this.stop();
      c._postWorkerMessage(this._qrEnginePromise, "close");
    }
    start() {
      const a = this;
      return $jscomp.asyncExecutePromiseGeneratorFunction(function* () {
        if (a._destroyed)
          throw Error(
            "The QR scanner can not be started as it had been destroyed."
          );
        if (!a._active || a._paused)
          if (
            ("https:" !== window.location.protocol &&
              console.warn(
                "The camera stream is only accessible if the page is transferred via https."
              ),
            (a._active = !0),
            !document.hidden)
          )
            if (((a._paused = !1), a.$video.srcObject)) yield a.$video.play();
            else
              try {
                let { stream: b, facingMode: d } = yield a._getCameraStream();
                !a._active || a._paused
                  ? c._stopVideoStream(b)
                  : (a._setVideoMirror(d),
                    (a.$video.srcObject = b),
                    yield a.$video.play(),
                    a._flashOn &&
                      ((a._flashOn = !1), a.turnFlashOn().catch(() => {})));
              } catch (b) {
                if (!a._paused) throw ((a._active = !1), b);
              }
      });
    }
    stop() {
      this.pause();
      this._active = !1;
    }
    pause(a = !1) {
      const b = this;
      return $jscomp.asyncExecutePromiseGeneratorFunction(function* () {
        b._paused = !0;
        if (!b._active) return !0;
        b.$video.pause();
        b.$overlay && (b.$overlay.style.display = "none");
        let d = () => {
          b.$video.srcObject instanceof MediaStream &&
            (c._stopVideoStream(b.$video.srcObject),
            (b.$video.srcObject = null));
        };
        if (a) return d(), !0;
        yield new Promise((f) => setTimeout(f, 300));
        if (!b._paused) return !1;
        d();
        return !0;
      });
    }
    setCamera(a) {
      const b = this;
      return $jscomp.asyncExecutePromiseGeneratorFunction(function* () {
        a !== b._preferredCamera &&
          ((b._preferredCamera = a), yield b._restartVideoStream());
      });
    }
    static scanImage(a, b, d, f, g = !1, k = !1) {
      return $jscomp.asyncExecutePromiseGeneratorFunction(function* () {
        let l,
          p = !1;
        b &&
        ("scanRegion" in b ||
          "qrEngine" in b ||
          "canvas" in b ||
          "disallowCanvasResizing" in b ||
          "alsoTryWithoutScanRegion" in b ||
          "returnDetailedScanResult" in b)
          ? ((l = b.scanRegion),
            (d = b.qrEngine),
            (f = b.canvas),
            (g = b.disallowCanvasResizing || !1),
            (k = b.alsoTryWithoutScanRegion || !1),
            (p = !0))
          : b || d || f || g || k
          ? console.warn(
              "You're using a deprecated api for scanImage which will be removed in the future."
            )
          : console.warn(
              "Note that the return type of scanImage will change in the future. To already switch to the new api today, you can pass returnDetailedScanResult: true."
            );
        let r = !!d;
        try {
          let m, q;
          [d, m] = yield Promise.all([
            d || c.createQrEngine(),
            c._loadImage(a),
          ]);
          [f, q] = c._drawToCanvas(m, l, f, g);
          let n;
          if (d instanceof Worker) {
            let h = d;
            r || c._postWorkerMessageSync(h, "inversionMode", "both");
            n = yield new Promise((t, z) => {
              let x,
                v,
                w,
                y = -1;
              v = (u) => {
                u.data.id === y &&
                  (h.removeEventListener("message", v),
                  h.removeEventListener("error", w),
                  clearTimeout(x),
                  null !== u.data.data
                    ? t({
                        data: u.data.data,
                        cornerPoints: c._convertPoints(u.data.cornerPoints, l),
                      })
                    : z(c.NO_QR_CODE_FOUND));
              };
              w = (u) => {
                h.removeEventListener("message", v);
                h.removeEventListener("error", w);
                clearTimeout(x);
                z("Scanner error: " + (u ? u.message || u : "Unknown Error"));
              };
              h.addEventListener("message", v);
              h.addEventListener("error", w);
              x = setTimeout(() => w("timeout"), 1e4);
              let A = q.getImageData(0, 0, f.width, f.height);
              y = c._postWorkerMessageSync(h, "decode", A, [A.data.buffer]);
            });
          } else
            n = yield Promise.race([
              new Promise((h, t) =>
                window.setTimeout(() => t("Scanner error: timeout"), 1e4)
              ),
              (() =>
                $jscomp.asyncExecutePromiseGeneratorFunction(function* () {
                  try {
                    var [h] = yield d.detect(f);
                    if (!h) throw c.NO_QR_CODE_FOUND;
                    return {
                      data: h.rawValue,
                      cornerPoints: c._convertPoints(h.cornerPoints, l),
                    };
                  } catch (t) {
                    h = t.message || t;
                    if (/not implemented|service unavailable/.test(h))
                      return (
                        (c._disableBarcodeDetector = !0),
                        c.scanImage(a, {
                          scanRegion: l,
                          canvas: f,
                          disallowCanvasResizing: g,
                          alsoTryWithoutScanRegion: k,
                        })
                      );
                    throw `Scanner error: ${h}`;
                  }
                }))(),
            ]);
          return p ? n : n.data;
        } catch (m) {
          if (!l || !k) throw m;
          let q = yield c.scanImage(a, {
            qrEngine: d,
            canvas: f,
            disallowCanvasResizing: g,
          });
          return p ? q : q.data;
        } finally {
          r || c._postWorkerMessage(d, "close");
        }
      });
    }
    setGrayscaleWeights(a, b, d, f = !0) {
      c._postWorkerMessage(this._qrEnginePromise, "grayscaleWeights", {
        red: a,
        green: b,
        blue: d,
        useIntegerApproximation: f,
      });
    }
    setInversionMode(a) {
      c._postWorkerMessage(this._qrEnginePromise, "inversionMode", a);
    }
    static createQrEngine(a) {
      return $jscomp.asyncExecutePromiseGeneratorFunction(function* () {
        a &&
          console.warn(
            "Specifying a worker path is not required and not supported anymore."
          );
        let b = () =>
          Promise.resolve()
            .then(function () {
              return e;
            })
            .then((f) => f.createWorker());
        if (
          !(
            !c._disableBarcodeDetector &&
            "BarcodeDetector" in window &&
            BarcodeDetector.getSupportedFormats &&
            (yield BarcodeDetector.getSupportedFormats()).includes("qr_code")
          )
        )
          return b();
        let d = navigator.userAgentData;
        return d &&
          d.brands.some(({ brand: f }) => /Chromium/i.test(f)) &&
          /mac ?OS/i.test(d.platform) &&
          (yield d
            .getHighEntropyValues(["architecture", "platformVersion"])
            .then(
              ({ architecture: f, platformVersion: g }) =>
                /arm/i.test(f || "arm") && 13 <= parseInt(g || "13")
            )
            .catch(() => !0))
          ? b()
          : new BarcodeDetector({ formats: ["qr_code"] });
      });
    }
    _onPlay() {
      this._scanRegion = this._calculateScanRegion(this.$video);
      this._updateOverlay();
      this.$overlay && (this.$overlay.style.display = "");
      this._scanFrame();
    }
    _onLoadedMetaData() {
      this._scanRegion = this._calculateScanRegion(this.$video);
      this._updateOverlay();
    }
    _onVisibilityChange() {
      document.hidden ? this.pause() : this._active && this.start();
    }
    _calculateScanRegion(a) {
      let b = Math.round((2 / 3) * Math.min(a.videoWidth, a.videoHeight));
      return {
        x: Math.round((a.videoWidth - b) / 2),
        y: Math.round((a.videoHeight - b) / 2),
        width: b,
        height: b,
        downScaledWidth: this._legacyCanvasSize,
        downScaledHeight: this._legacyCanvasSize,
      };
    }
    _updateOverlay() {
      requestAnimationFrame(() => {
        if (this.$overlay) {
          var a = this.$video,
            b = a.videoWidth,
            d = a.videoHeight,
            f = a.offsetWidth,
            g = a.offsetHeight,
            k = a.offsetLeft,
            l = a.offsetTop,
            p = window.getComputedStyle(a),
            r = p.objectFit,
            m = b / d,
            q = f / g;
          switch (r) {
            case "none":
              var n = b;
              var h = d;
              break;
            case "fill":
              n = f;
              h = g;
              break;
            default:
              ("cover" === r ? m > q : m < q)
                ? ((h = g), (n = h * m))
                : ((n = f), (h = n / m)),
                "scale-down" === r &&
                  ((n = Math.min(n, b)), (h = Math.min(h, d)));
          }
          var [t, z] = p.objectPosition.split(" ").map((v, w) => {
            const y = parseFloat(v);
            return v.endsWith("%") ? ((w ? g - h : f - n) * y) / 100 : y;
          });
          p = this._scanRegion.width || b;
          q = this._scanRegion.height || d;
          r = this._scanRegion.x || 0;
          var x = this._scanRegion.y || 0;
          m = this.$overlay.style;
          m.width = `${(p / b) * n}px`;
          m.height = `${(q / d) * h}px`;
          m.top = `${l + z + (x / d) * h}px`;
          d = /scaleX\(-1\)/.test(a.style.transform);
          m.left = `${
            k + (d ? f - t - n : t) + ((d ? b - r - p : r) / b) * n
          }px`;
          m.transform = a.style.transform;
        }
      });
    }
    static _convertPoints(a, b) {
      if (!b) return a;
      let d = b.x || 0,
        f = b.y || 0,
        g = b.width && b.downScaledWidth ? b.width / b.downScaledWidth : 1;
      b = b.height && b.downScaledHeight ? b.height / b.downScaledHeight : 1;
      for (let k of a) (k.x = k.x * g + d), (k.y = k.y * b + f);
      return a;
    }
    _scanFrame() {
      !this._active ||
        this.$video.paused ||
        this.$video.ended ||
        ("requestVideoFrameCallback" in this.$video
          ? this.$video.requestVideoFrameCallback.bind(this.$video)
          : requestAnimationFrame)(() => {
          const a = this;
          return $jscomp.asyncExecutePromiseGeneratorFunction(function* () {
            if (!(1 >= a.$video.readyState)) {
              var b = Date.now() - a._lastScanTimestamp,
                d = 1e3 / a._maxScansPerSecond;
              b < d && (yield new Promise((g) => setTimeout(g, d - b)));
              a._lastScanTimestamp = Date.now();
              try {
                var f = yield c.scanImage(a.$video, {
                  scanRegion: a._scanRegion,
                  qrEngine: a._qrEnginePromise,
                  canvas: a.$canvas,
                });
              } catch (g) {
                if (!a._active) return;
                a._onDecodeError(g);
              }
              !c._disableBarcodeDetector ||
                (yield a._qrEnginePromise) instanceof Worker ||
                (a._qrEnginePromise = c.createQrEngine());
              f
                ? (a._onDecode
                    ? a._onDecode(f)
                    : a._legacyOnDecode && a._legacyOnDecode(f.data),
                  a.$codeOutlineHighlight &&
                    (clearTimeout(a._codeOutlineHighlightRemovalTimeout),
                    (a._codeOutlineHighlightRemovalTimeout = void 0),
                    a.$codeOutlineHighlight.setAttribute(
                      "viewBox",
                      `${a._scanRegion.x || 0} ` +
                        `${a._scanRegion.y || 0} ` +
                        `${a._scanRegion.width || a.$video.videoWidth} ` +
                        `${a._scanRegion.height || a.$video.videoHeight}`
                    ),
                    a.$codeOutlineHighlight.firstElementChild.setAttribute(
                      "points",
                      f.cornerPoints
                        .map(({ x: g, y: k }) => `${g},${k}`)
                        .join(" ")
                    ),
                    (a.$codeOutlineHighlight.style.display = "")))
                : a.$codeOutlineHighlight &&
                  !a._codeOutlineHighlightRemovalTimeout &&
                  (a._codeOutlineHighlightRemovalTimeout = setTimeout(
                    () => (a.$codeOutlineHighlight.style.display = "none"),
                    100
                  ));
            }
            a._scanFrame();
          });
        });
    }
    _onDecodeError(a) {
      a !== c.NO_QR_CODE_FOUND && console.log(a);
    }
    _getCameraStream() {
      const a = this;
      return $jscomp.asyncExecutePromiseGeneratorFunction(function* () {
        if (!navigator.mediaDevices) throw "Camera not found.";
        let b = /^(environment|user)$/.test(a._preferredCamera)
            ? "facingMode"
            : "deviceId",
          d = [{ width: { min: 1024 } }, { width: { min: 768 } }, {}],
          f = d.map((g) =>
            Object.assign({}, g, { [b]: { exact: a._preferredCamera } })
          );
        for (let g of [...f, ...d])
          try {
            let k = yield navigator.mediaDevices.getUserMedia({
                video: g,
                audio: !1,
              }),
              l =
                a._getFacingMode(k) ||
                (g.facingMode
                  ? a._preferredCamera
                  : "environment" === a._preferredCamera
                  ? "user"
                  : "environment");
            return { stream: k, facingMode: l };
          } catch (k) {}
        throw "Camera not found.";
      });
    }
    _restartVideoStream() {
      const a = this;
      return $jscomp.asyncExecutePromiseGeneratorFunction(function* () {
        let b = a._paused;
        (yield a.pause(!0)) && !b && a._active && (yield a.start());
      });
    }
    static _stopVideoStream(a) {
      for (let b of a.getTracks()) b.stop(), a.removeTrack(b);
    }
    _setVideoMirror(a) {
      this.$video.style.transform = "scaleX(" + ("user" === a ? -1 : 1) + ")";
    }
    _getFacingMode(a) {
      return (a = a.getVideoTracks()[0])
        ? /rear|back|environment/i.test(a.label)
          ? "environment"
          : /front|user|face/i.test(a.label)
          ? "user"
          : null
        : null;
    }
    static _drawToCanvas(a, b, d, f = !1) {
      d = d || document.createElement("canvas");
      let g = b && b.x ? b.x : 0,
        k = b && b.y ? b.y : 0,
        l = b && b.width ? b.width : a.videoWidth || a.width,
        p = b && b.height ? b.height : a.videoHeight || a.height;
      f ||
        ((f = b && b.downScaledWidth ? b.downScaledWidth : l),
        (b = b && b.downScaledHeight ? b.downScaledHeight : p),
        d.width !== f && (d.width = f),
        d.height !== b && (d.height = b));
      b = d.getContext("2d", { alpha: !1 });
      b.imageSmoothingEnabled = !1;
      b.drawImage(a, g, k, l, p, 0, 0, d.width, d.height);
      return [d, b];
    }
    static _loadImage(a) {
      return $jscomp.asyncExecutePromiseGeneratorFunction(function* () {
        if (a instanceof Image) return yield c._awaitImageLoad(a), a;
        if (
          a instanceof HTMLVideoElement ||
          a instanceof HTMLCanvasElement ||
          a instanceof SVGImageElement ||
          ("OffscreenCanvas" in window && a instanceof OffscreenCanvas) ||
          ("ImageBitmap" in window && a instanceof ImageBitmap)
        )
          return a;
        if (
          a instanceof File ||
          a instanceof Blob ||
          a instanceof URL ||
          "string" === typeof a
        ) {
          let b = new Image();
          b.src =
            a instanceof File || a instanceof Blob
              ? URL.createObjectURL(a)
              : a.toString();
          try {
            return yield c._awaitImageLoad(b), b;
          } finally {
            (a instanceof File || a instanceof Blob) &&
              URL.revokeObjectURL(b.src);
          }
        } else throw "Unsupported image type.";
      });
    }
    static _awaitImageLoad(a) {
      return $jscomp.asyncExecutePromiseGeneratorFunction(function* () {
        (a.complete && 0 !== a.naturalWidth) ||
          (yield new Promise((b, d) => {
            let f = (g) => {
              a.removeEventListener("load", f);
              a.removeEventListener("error", f);
              g instanceof ErrorEvent ? d("Image load error") : b();
            };
            a.addEventListener("load", f);
            a.addEventListener("error", f);
          }));
      });
    }
    static _postWorkerMessage(a, b, d, f) {
      return $jscomp.asyncExecutePromiseGeneratorFunction(function* () {
        return c._postWorkerMessageSync(yield a, b, d, f);
      });
    }
    static _postWorkerMessageSync(a, b, d, f) {
      if (!(a instanceof Worker)) return -1;
      let g = c._workerMessageId++;
      a.postMessage({ id: g, type: b, data: d }, f);
      return g;
    }
  }
  c.DEFAULT_CANVAS_SIZE = 400;
  c.NO_QR_CODE_FOUND = "No QR code found";
  c._disableBarcodeDetector = !1;
  c._workerMessageId = 0;
  var e = Object.freeze({
    __proto__: null,
    createWorker: () =>
      new Worker(
        URL.createObjectURL(
          new Blob([
            'class x{constructor(a,b){this.width=b;this.height=a.length/b;this.data=a}static createEmpty(a,b){return new x(new Uint8ClampedArray(a*b),a)}get(a,b){return 0>a||a>=this.width||0>b||b>=this.height?!1:!!this.data[b*this.width+a]}set(a,b,c){this.data[b*this.width+a]=c?1:0}setRegion(a,b,c,d,e){for(let f=b;f<b+d;f++)for(let g=a;g<a+c;g++)this.set(g,f,!!e)}}\nclass A{constructor(a,b,c){this.width=a;a*=b;if(c&&c.length!==a)throw Error("Wrong buffer size");this.data=c||new Uint8ClampedArray(a)}get(a,b){return this.data[b*this.width+a]}set(a,b,c){this.data[b*this.width+a]=c}}\nclass ba{constructor(a){this.bitOffset=this.byteOffset=0;this.bytes=a}readBits(a){if(1>a||32<a||a>this.available())throw Error("Cannot read "+a.toString()+" bits");var b=0;if(0<this.bitOffset){b=8-this.bitOffset;var c=a<b?a:b;b-=c;b=(this.bytes[this.byteOffset]&255>>8-c<<b)>>b;a-=c;this.bitOffset+=c;8===this.bitOffset&&(this.bitOffset=0,this.byteOffset++)}if(0<a){for(;8<=a;)b=b<<8|this.bytes[this.byteOffset]&255,this.byteOffset++,a-=8;0<a&&(c=8-a,b=b<<a|(this.bytes[this.byteOffset]&255>>c<<c)>>c,\nthis.bitOffset+=a)}return b}available(){return 8*(this.bytes.length-this.byteOffset)-this.bitOffset}}var B,C=B||(B={});C.Numeric="numeric";C.Alphanumeric="alphanumeric";C.Byte="byte";C.Kanji="kanji";C.ECI="eci";C.StructuredAppend="structuredappend";var D,E=D||(D={});E[E.Terminator=0]="Terminator";E[E.Numeric=1]="Numeric";E[E.Alphanumeric=2]="Alphanumeric";E[E.Byte=4]="Byte";E[E.Kanji=8]="Kanji";E[E.ECI=7]="ECI";E[E.StructuredAppend=3]="StructuredAppend";let F="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:".split("");\nfunction ca(a,b){let c=[],d="";b=a.readBits([8,16,16][b]);for(let e=0;e<b;e++){let f=a.readBits(8);c.push(f)}try{d+=decodeURIComponent(c.map(e=>`%${("0"+e.toString(16)).substr(-2)}`).join(""))}catch(e){}return{bytes:c,text:d}}\nfunction da(a,b){a=new ba(a);let c=9>=b?0:26>=b?1:2;for(b={text:"",bytes:[],chunks:[],version:b};4<=a.available();){var d=a.readBits(4);if(d===D.Terminator)return b;if(d===D.ECI)0===a.readBits(1)?b.chunks.push({type:B.ECI,assignmentNumber:a.readBits(7)}):0===a.readBits(1)?b.chunks.push({type:B.ECI,assignmentNumber:a.readBits(14)}):0===a.readBits(1)?b.chunks.push({type:B.ECI,assignmentNumber:a.readBits(21)}):b.chunks.push({type:B.ECI,assignmentNumber:-1});else if(d===D.Numeric){var e=a,f=[];d="";for(var g=\ne.readBits([10,12,14][c]);3<=g;){var h=e.readBits(10);if(1E3<=h)throw Error("Invalid numeric value above 999");var k=Math.floor(h/100),m=Math.floor(h/10)%10;h%=10;f.push(48+k,48+m,48+h);d+=k.toString()+m.toString()+h.toString();g-=3}if(2===g){g=e.readBits(7);if(100<=g)throw Error("Invalid numeric value above 99");e=Math.floor(g/10);g%=10;f.push(48+e,48+g);d+=e.toString()+g.toString()}else if(1===g){e=e.readBits(4);if(10<=e)throw Error("Invalid numeric value above 9");f.push(48+e);d+=e.toString()}b.text+=\nd;b.bytes.push(...f);b.chunks.push({type:B.Numeric,text:d})}else if(d===D.Alphanumeric){e=a;f=[];d="";for(g=e.readBits([9,11,13][c]);2<=g;)m=e.readBits(11),k=Math.floor(m/45),m%=45,f.push(F[k].charCodeAt(0),F[m].charCodeAt(0)),d+=F[k]+F[m],g-=2;1===g&&(e=e.readBits(6),f.push(F[e].charCodeAt(0)),d+=F[e]);b.text+=d;b.bytes.push(...f);b.chunks.push({type:B.Alphanumeric,text:d})}else if(d===D.Byte)d=ca(a,c),b.text+=d.text,b.bytes.push(...d.bytes),b.chunks.push({type:B.Byte,bytes:d.bytes,text:d.text});\nelse if(d===D.Kanji){f=a;d=[];e=f.readBits([8,10,12][c]);for(g=0;g<e;g++)k=f.readBits(13),k=Math.floor(k/192)<<8|k%192,k=7936>k?k+33088:k+49472,d.push(k>>8,k&255);f=(new TextDecoder("shift-jis")).decode(Uint8Array.from(d));b.text+=f;b.bytes.push(...d);b.chunks.push({type:B.Kanji,bytes:d,text:f})}else d===D.StructuredAppend&&b.chunks.push({type:B.StructuredAppend,currentSequence:a.readBits(4),totalSequence:a.readBits(4),parity:a.readBits(8)})}if(0===a.available()||0===a.readBits(a.available()))return b}\nclass G{constructor(a,b){if(0===b.length)throw Error("No coefficients.");this.field=a;let c=b.length;if(1<c&&0===b[0]){let d=1;for(;d<c&&0===b[d];)d++;if(d===c)this.coefficients=a.zero.coefficients;else for(this.coefficients=new Uint8ClampedArray(c-d),a=0;a<this.coefficients.length;a++)this.coefficients[a]=b[d+a]}else this.coefficients=b}degree(){return this.coefficients.length-1}isZero(){return 0===this.coefficients[0]}getCoefficient(a){return this.coefficients[this.coefficients.length-1-a]}addOrSubtract(a){if(this.isZero())return a;\nif(a.isZero())return this;let b=this.coefficients;a=a.coefficients;b.length>a.length&&([b,a]=[a,b]);let c=new Uint8ClampedArray(a.length),d=a.length-b.length;for(var e=0;e<d;e++)c[e]=a[e];for(e=d;e<a.length;e++)c[e]=b[e-d]^a[e];return new G(this.field,c)}multiply(a){if(0===a)return this.field.zero;if(1===a)return this;let b=this.coefficients.length,c=new Uint8ClampedArray(b);for(let d=0;d<b;d++)c[d]=this.field.multiply(this.coefficients[d],a);return new G(this.field,c)}multiplyPoly(a){if(this.isZero()||\na.isZero())return this.field.zero;let b=this.coefficients,c=b.length;a=a.coefficients;let d=a.length,e=new Uint8ClampedArray(c+d-1);for(let f=0;f<c;f++){let g=b[f];for(let h=0;h<d;h++)e[f+h]=H(e[f+h],this.field.multiply(g,a[h]))}return new G(this.field,e)}multiplyByMonomial(a,b){if(0>a)throw Error("Invalid degree less than 0");if(0===b)return this.field.zero;let c=this.coefficients.length;a=new Uint8ClampedArray(c+a);for(let d=0;d<c;d++)a[d]=this.field.multiply(this.coefficients[d],b);return new G(this.field,\na)}evaluateAt(a){let b=0;if(0===a)return this.getCoefficient(0);let c=this.coefficients.length;if(1===a)return this.coefficients.forEach(d=>{b^=d}),b;b=this.coefficients[0];for(let d=1;d<c;d++)b=H(this.field.multiply(a,b),this.coefficients[d]);return b}}function H(a,b){return a^b}\nclass ea{constructor(a,b,c){this.primitive=a;this.size=b;this.generatorBase=c;this.expTable=Array(this.size);this.logTable=Array(this.size);a=1;for(b=0;b<this.size;b++)this.expTable[b]=a,a*=2,a>=this.size&&(a=(a^this.primitive)&this.size-1);for(a=0;a<this.size-1;a++)this.logTable[this.expTable[a]]=a;this.zero=new G(this,Uint8ClampedArray.from([0]));this.one=new G(this,Uint8ClampedArray.from([1]))}multiply(a,b){return 0===a||0===b?0:this.expTable[(this.logTable[a]+this.logTable[b])%(this.size-1)]}inverse(a){if(0===\na)throw Error("Can\'t invert 0");return this.expTable[this.size-this.logTable[a]-1]}buildMonomial(a,b){if(0>a)throw Error("Invalid monomial degree less than 0");if(0===b)return this.zero;a=new Uint8ClampedArray(a+1);a[0]=b;return new G(this,a)}log(a){if(0===a)throw Error("Can\'t take log(0)");return this.logTable[a]}exp(a){return this.expTable[a]}}\nfunction fa(a,b,c,d){b.degree()<c.degree()&&([b,c]=[c,b]);let e=a.zero;for(var f=a.one;c.degree()>=d/2;){var g=b;let h=e;b=c;e=f;if(b.isZero())return null;c=g;f=a.zero;g=b.getCoefficient(b.degree());for(g=a.inverse(g);c.degree()>=b.degree()&&!c.isZero();){let k=c.degree()-b.degree(),m=a.multiply(c.getCoefficient(c.degree()),g);f=f.addOrSubtract(a.buildMonomial(k,m));c=c.addOrSubtract(b.multiplyByMonomial(k,m))}f=f.multiplyPoly(e).addOrSubtract(h);if(c.degree()>=b.degree())return null}d=f.getCoefficient(0);\nif(0===d)return null;a=a.inverse(d);return[f.multiply(a),c.multiply(a)]}\nfunction ha(a,b){let c=new Uint8ClampedArray(a.length);c.set(a);a=new ea(285,256,0);var d=new G(a,c),e=new Uint8ClampedArray(b),f=!1;for(var g=0;g<b;g++){var h=d.evaluateAt(a.exp(g+a.generatorBase));e[e.length-1-g]=h;0!==h&&(f=!0)}if(!f)return c;d=new G(a,e);d=fa(a,a.buildMonomial(b,1),d,b);if(null===d)return null;b=d[0];g=b.degree();if(1===g)b=[b.getCoefficient(1)];else{e=Array(g);f=0;for(h=1;h<a.size&&f<g;h++)0===b.evaluateAt(h)&&(e[f]=a.inverse(h),f++);b=f!==g?null:e}if(null==b)return null;e=d[1];\nf=b.length;d=Array(f);for(g=0;g<f;g++){h=a.inverse(b[g]);let k=1;for(let m=0;m<f;m++)g!==m&&(k=a.multiply(k,H(1,a.multiply(b[m],h))));d[g]=a.multiply(e.evaluateAt(h),a.inverse(k));0!==a.generatorBase&&(d[g]=a.multiply(d[g],h))}for(e=0;e<b.length;e++){f=c.length-1-a.log(b[e]);if(0>f)return null;c[f]^=d[e]}return c}\nlet I=[{infoBits:null,versionNumber:1,alignmentPatternCenters:[],errorCorrectionLevels:[{ecCodewordsPerBlock:7,ecBlocks:[{numBlocks:1,dataCodewordsPerBlock:19}]},{ecCodewordsPerBlock:10,ecBlocks:[{numBlocks:1,dataCodewordsPerBlock:16}]},{ecCodewordsPerBlock:13,ecBlocks:[{numBlocks:1,dataCodewordsPerBlock:13}]},{ecCodewordsPerBlock:17,ecBlocks:[{numBlocks:1,dataCodewordsPerBlock:9}]}]},{infoBits:null,versionNumber:2,alignmentPatternCenters:[6,18],errorCorrectionLevels:[{ecCodewordsPerBlock:10,ecBlocks:[{numBlocks:1,\ndataCodewordsPerBlock:34}]},{ecCodewordsPerBlock:16,ecBlocks:[{numBlocks:1,dataCodewordsPerBlock:28}]},{ecCodewordsPerBlock:22,ecBlocks:[{numBlocks:1,dataCodewordsPerBlock:22}]},{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:1,dataCodewordsPerBlock:16}]}]},{infoBits:null,versionNumber:3,alignmentPatternCenters:[6,22],errorCorrectionLevels:[{ecCodewordsPerBlock:15,ecBlocks:[{numBlocks:1,dataCodewordsPerBlock:55}]},{ecCodewordsPerBlock:26,ecBlocks:[{numBlocks:1,dataCodewordsPerBlock:44}]},{ecCodewordsPerBlock:18,\necBlocks:[{numBlocks:2,dataCodewordsPerBlock:17}]},{ecCodewordsPerBlock:22,ecBlocks:[{numBlocks:2,dataCodewordsPerBlock:13}]}]},{infoBits:null,versionNumber:4,alignmentPatternCenters:[6,26],errorCorrectionLevels:[{ecCodewordsPerBlock:20,ecBlocks:[{numBlocks:1,dataCodewordsPerBlock:80}]},{ecCodewordsPerBlock:18,ecBlocks:[{numBlocks:2,dataCodewordsPerBlock:32}]},{ecCodewordsPerBlock:26,ecBlocks:[{numBlocks:2,dataCodewordsPerBlock:24}]},{ecCodewordsPerBlock:16,ecBlocks:[{numBlocks:4,dataCodewordsPerBlock:9}]}]},\n{infoBits:null,versionNumber:5,alignmentPatternCenters:[6,30],errorCorrectionLevels:[{ecCodewordsPerBlock:26,ecBlocks:[{numBlocks:1,dataCodewordsPerBlock:108}]},{ecCodewordsPerBlock:24,ecBlocks:[{numBlocks:2,dataCodewordsPerBlock:43}]},{ecCodewordsPerBlock:18,ecBlocks:[{numBlocks:2,dataCodewordsPerBlock:15},{numBlocks:2,dataCodewordsPerBlock:16}]},{ecCodewordsPerBlock:22,ecBlocks:[{numBlocks:2,dataCodewordsPerBlock:11},{numBlocks:2,dataCodewordsPerBlock:12}]}]},{infoBits:null,versionNumber:6,alignmentPatternCenters:[6,\n34],errorCorrectionLevels:[{ecCodewordsPerBlock:18,ecBlocks:[{numBlocks:2,dataCodewordsPerBlock:68}]},{ecCodewordsPerBlock:16,ecBlocks:[{numBlocks:4,dataCodewordsPerBlock:27}]},{ecCodewordsPerBlock:24,ecBlocks:[{numBlocks:4,dataCodewordsPerBlock:19}]},{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:4,dataCodewordsPerBlock:15}]}]},{infoBits:31892,versionNumber:7,alignmentPatternCenters:[6,22,38],errorCorrectionLevels:[{ecCodewordsPerBlock:20,ecBlocks:[{numBlocks:2,dataCodewordsPerBlock:78}]},{ecCodewordsPerBlock:18,\necBlocks:[{numBlocks:4,dataCodewordsPerBlock:31}]},{ecCodewordsPerBlock:18,ecBlocks:[{numBlocks:2,dataCodewordsPerBlock:14},{numBlocks:4,dataCodewordsPerBlock:15}]},{ecCodewordsPerBlock:26,ecBlocks:[{numBlocks:4,dataCodewordsPerBlock:13},{numBlocks:1,dataCodewordsPerBlock:14}]}]},{infoBits:34236,versionNumber:8,alignmentPatternCenters:[6,24,42],errorCorrectionLevels:[{ecCodewordsPerBlock:24,ecBlocks:[{numBlocks:2,dataCodewordsPerBlock:97}]},{ecCodewordsPerBlock:22,ecBlocks:[{numBlocks:2,dataCodewordsPerBlock:38},\n{numBlocks:2,dataCodewordsPerBlock:39}]},{ecCodewordsPerBlock:22,ecBlocks:[{numBlocks:4,dataCodewordsPerBlock:18},{numBlocks:2,dataCodewordsPerBlock:19}]},{ecCodewordsPerBlock:26,ecBlocks:[{numBlocks:4,dataCodewordsPerBlock:14},{numBlocks:2,dataCodewordsPerBlock:15}]}]},{infoBits:39577,versionNumber:9,alignmentPatternCenters:[6,26,46],errorCorrectionLevels:[{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:2,dataCodewordsPerBlock:116}]},{ecCodewordsPerBlock:22,ecBlocks:[{numBlocks:3,dataCodewordsPerBlock:36},\n{numBlocks:2,dataCodewordsPerBlock:37}]},{ecCodewordsPerBlock:20,ecBlocks:[{numBlocks:4,dataCodewordsPerBlock:16},{numBlocks:4,dataCodewordsPerBlock:17}]},{ecCodewordsPerBlock:24,ecBlocks:[{numBlocks:4,dataCodewordsPerBlock:12},{numBlocks:4,dataCodewordsPerBlock:13}]}]},{infoBits:42195,versionNumber:10,alignmentPatternCenters:[6,28,50],errorCorrectionLevels:[{ecCodewordsPerBlock:18,ecBlocks:[{numBlocks:2,dataCodewordsPerBlock:68},{numBlocks:2,dataCodewordsPerBlock:69}]},{ecCodewordsPerBlock:26,ecBlocks:[{numBlocks:4,\ndataCodewordsPerBlock:43},{numBlocks:1,dataCodewordsPerBlock:44}]},{ecCodewordsPerBlock:24,ecBlocks:[{numBlocks:6,dataCodewordsPerBlock:19},{numBlocks:2,dataCodewordsPerBlock:20}]},{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:6,dataCodewordsPerBlock:15},{numBlocks:2,dataCodewordsPerBlock:16}]}]},{infoBits:48118,versionNumber:11,alignmentPatternCenters:[6,30,54],errorCorrectionLevels:[{ecCodewordsPerBlock:20,ecBlocks:[{numBlocks:4,dataCodewordsPerBlock:81}]},{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:1,\ndataCodewordsPerBlock:50},{numBlocks:4,dataCodewordsPerBlock:51}]},{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:4,dataCodewordsPerBlock:22},{numBlocks:4,dataCodewordsPerBlock:23}]},{ecCodewordsPerBlock:24,ecBlocks:[{numBlocks:3,dataCodewordsPerBlock:12},{numBlocks:8,dataCodewordsPerBlock:13}]}]},{infoBits:51042,versionNumber:12,alignmentPatternCenters:[6,32,58],errorCorrectionLevels:[{ecCodewordsPerBlock:24,ecBlocks:[{numBlocks:2,dataCodewordsPerBlock:92},{numBlocks:2,dataCodewordsPerBlock:93}]},\n{ecCodewordsPerBlock:22,ecBlocks:[{numBlocks:6,dataCodewordsPerBlock:36},{numBlocks:2,dataCodewordsPerBlock:37}]},{ecCodewordsPerBlock:26,ecBlocks:[{numBlocks:4,dataCodewordsPerBlock:20},{numBlocks:6,dataCodewordsPerBlock:21}]},{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:7,dataCodewordsPerBlock:14},{numBlocks:4,dataCodewordsPerBlock:15}]}]},{infoBits:55367,versionNumber:13,alignmentPatternCenters:[6,34,62],errorCorrectionLevels:[{ecCodewordsPerBlock:26,ecBlocks:[{numBlocks:4,dataCodewordsPerBlock:107}]},\n{ecCodewordsPerBlock:22,ecBlocks:[{numBlocks:8,dataCodewordsPerBlock:37},{numBlocks:1,dataCodewordsPerBlock:38}]},{ecCodewordsPerBlock:24,ecBlocks:[{numBlocks:8,dataCodewordsPerBlock:20},{numBlocks:4,dataCodewordsPerBlock:21}]},{ecCodewordsPerBlock:22,ecBlocks:[{numBlocks:12,dataCodewordsPerBlock:11},{numBlocks:4,dataCodewordsPerBlock:12}]}]},{infoBits:58893,versionNumber:14,alignmentPatternCenters:[6,26,46,66],errorCorrectionLevels:[{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:3,dataCodewordsPerBlock:115},\n{numBlocks:1,dataCodewordsPerBlock:116}]},{ecCodewordsPerBlock:24,ecBlocks:[{numBlocks:4,dataCodewordsPerBlock:40},{numBlocks:5,dataCodewordsPerBlock:41}]},{ecCodewordsPerBlock:20,ecBlocks:[{numBlocks:11,dataCodewordsPerBlock:16},{numBlocks:5,dataCodewordsPerBlock:17}]},{ecCodewordsPerBlock:24,ecBlocks:[{numBlocks:11,dataCodewordsPerBlock:12},{numBlocks:5,dataCodewordsPerBlock:13}]}]},{infoBits:63784,versionNumber:15,alignmentPatternCenters:[6,26,48,70],errorCorrectionLevels:[{ecCodewordsPerBlock:22,\necBlocks:[{numBlocks:5,dataCodewordsPerBlock:87},{numBlocks:1,dataCodewordsPerBlock:88}]},{ecCodewordsPerBlock:24,ecBlocks:[{numBlocks:5,dataCodewordsPerBlock:41},{numBlocks:5,dataCodewordsPerBlock:42}]},{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:5,dataCodewordsPerBlock:24},{numBlocks:7,dataCodewordsPerBlock:25}]},{ecCodewordsPerBlock:24,ecBlocks:[{numBlocks:11,dataCodewordsPerBlock:12},{numBlocks:7,dataCodewordsPerBlock:13}]}]},{infoBits:68472,versionNumber:16,alignmentPatternCenters:[6,26,50,\n74],errorCorrectionLevels:[{ecCodewordsPerBlock:24,ecBlocks:[{numBlocks:5,dataCodewordsPerBlock:98},{numBlocks:1,dataCodewordsPerBlock:99}]},{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:7,dataCodewordsPerBlock:45},{numBlocks:3,dataCodewordsPerBlock:46}]},{ecCodewordsPerBlock:24,ecBlocks:[{numBlocks:15,dataCodewordsPerBlock:19},{numBlocks:2,dataCodewordsPerBlock:20}]},{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:3,dataCodewordsPerBlock:15},{numBlocks:13,dataCodewordsPerBlock:16}]}]},{infoBits:70749,\nversionNumber:17,alignmentPatternCenters:[6,30,54,78],errorCorrectionLevels:[{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:1,dataCodewordsPerBlock:107},{numBlocks:5,dataCodewordsPerBlock:108}]},{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:10,dataCodewordsPerBlock:46},{numBlocks:1,dataCodewordsPerBlock:47}]},{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:1,dataCodewordsPerBlock:22},{numBlocks:15,dataCodewordsPerBlock:23}]},{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:2,dataCodewordsPerBlock:14},{numBlocks:17,\ndataCodewordsPerBlock:15}]}]},{infoBits:76311,versionNumber:18,alignmentPatternCenters:[6,30,56,82],errorCorrectionLevels:[{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:5,dataCodewordsPerBlock:120},{numBlocks:1,dataCodewordsPerBlock:121}]},{ecCodewordsPerBlock:26,ecBlocks:[{numBlocks:9,dataCodewordsPerBlock:43},{numBlocks:4,dataCodewordsPerBlock:44}]},{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:17,dataCodewordsPerBlock:22},{numBlocks:1,dataCodewordsPerBlock:23}]},{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:2,\ndataCodewordsPerBlock:14},{numBlocks:19,dataCodewordsPerBlock:15}]}]},{infoBits:79154,versionNumber:19,alignmentPatternCenters:[6,30,58,86],errorCorrectionLevels:[{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:3,dataCodewordsPerBlock:113},{numBlocks:4,dataCodewordsPerBlock:114}]},{ecCodewordsPerBlock:26,ecBlocks:[{numBlocks:3,dataCodewordsPerBlock:44},{numBlocks:11,dataCodewordsPerBlock:45}]},{ecCodewordsPerBlock:26,ecBlocks:[{numBlocks:17,dataCodewordsPerBlock:21},{numBlocks:4,dataCodewordsPerBlock:22}]},\n{ecCodewordsPerBlock:26,ecBlocks:[{numBlocks:9,dataCodewordsPerBlock:13},{numBlocks:16,dataCodewordsPerBlock:14}]}]},{infoBits:84390,versionNumber:20,alignmentPatternCenters:[6,34,62,90],errorCorrectionLevels:[{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:3,dataCodewordsPerBlock:107},{numBlocks:5,dataCodewordsPerBlock:108}]},{ecCodewordsPerBlock:26,ecBlocks:[{numBlocks:3,dataCodewordsPerBlock:41},{numBlocks:13,dataCodewordsPerBlock:42}]},{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:15,dataCodewordsPerBlock:24},\n{numBlocks:5,dataCodewordsPerBlock:25}]},{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:15,dataCodewordsPerBlock:15},{numBlocks:10,dataCodewordsPerBlock:16}]}]},{infoBits:87683,versionNumber:21,alignmentPatternCenters:[6,28,50,72,94],errorCorrectionLevels:[{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:4,dataCodewordsPerBlock:116},{numBlocks:4,dataCodewordsPerBlock:117}]},{ecCodewordsPerBlock:26,ecBlocks:[{numBlocks:17,dataCodewordsPerBlock:42}]},{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:17,dataCodewordsPerBlock:22},\n{numBlocks:6,dataCodewordsPerBlock:23}]},{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:19,dataCodewordsPerBlock:16},{numBlocks:6,dataCodewordsPerBlock:17}]}]},{infoBits:92361,versionNumber:22,alignmentPatternCenters:[6,26,50,74,98],errorCorrectionLevels:[{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:2,dataCodewordsPerBlock:111},{numBlocks:7,dataCodewordsPerBlock:112}]},{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:17,dataCodewordsPerBlock:46}]},{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:7,dataCodewordsPerBlock:24},\n{numBlocks:16,dataCodewordsPerBlock:25}]},{ecCodewordsPerBlock:24,ecBlocks:[{numBlocks:34,dataCodewordsPerBlock:13}]}]},{infoBits:96236,versionNumber:23,alignmentPatternCenters:[6,30,54,74,102],errorCorrectionLevels:[{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:4,dataCodewordsPerBlock:121},{numBlocks:5,dataCodewordsPerBlock:122}]},{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:4,dataCodewordsPerBlock:47},{numBlocks:14,dataCodewordsPerBlock:48}]},{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:11,dataCodewordsPerBlock:24},\n{numBlocks:14,dataCodewordsPerBlock:25}]},{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:16,dataCodewordsPerBlock:15},{numBlocks:14,dataCodewordsPerBlock:16}]}]},{infoBits:102084,versionNumber:24,alignmentPatternCenters:[6,28,54,80,106],errorCorrectionLevels:[{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:6,dataCodewordsPerBlock:117},{numBlocks:4,dataCodewordsPerBlock:118}]},{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:6,dataCodewordsPerBlock:45},{numBlocks:14,dataCodewordsPerBlock:46}]},{ecCodewordsPerBlock:30,\necBlocks:[{numBlocks:11,dataCodewordsPerBlock:24},{numBlocks:16,dataCodewordsPerBlock:25}]},{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:30,dataCodewordsPerBlock:16},{numBlocks:2,dataCodewordsPerBlock:17}]}]},{infoBits:102881,versionNumber:25,alignmentPatternCenters:[6,32,58,84,110],errorCorrectionLevels:[{ecCodewordsPerBlock:26,ecBlocks:[{numBlocks:8,dataCodewordsPerBlock:106},{numBlocks:4,dataCodewordsPerBlock:107}]},{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:8,dataCodewordsPerBlock:47},{numBlocks:13,\ndataCodewordsPerBlock:48}]},{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:7,dataCodewordsPerBlock:24},{numBlocks:22,dataCodewordsPerBlock:25}]},{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:22,dataCodewordsPerBlock:15},{numBlocks:13,dataCodewordsPerBlock:16}]}]},{infoBits:110507,versionNumber:26,alignmentPatternCenters:[6,30,58,86,114],errorCorrectionLevels:[{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:10,dataCodewordsPerBlock:114},{numBlocks:2,dataCodewordsPerBlock:115}]},{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:19,\ndataCodewordsPerBlock:46},{numBlocks:4,dataCodewordsPerBlock:47}]},{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:28,dataCodewordsPerBlock:22},{numBlocks:6,dataCodewordsPerBlock:23}]},{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:33,dataCodewordsPerBlock:16},{numBlocks:4,dataCodewordsPerBlock:17}]}]},{infoBits:110734,versionNumber:27,alignmentPatternCenters:[6,34,62,90,118],errorCorrectionLevels:[{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:8,dataCodewordsPerBlock:122},{numBlocks:4,dataCodewordsPerBlock:123}]},\n{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:22,dataCodewordsPerBlock:45},{numBlocks:3,dataCodewordsPerBlock:46}]},{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:8,dataCodewordsPerBlock:23},{numBlocks:26,dataCodewordsPerBlock:24}]},{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:12,dataCodewordsPerBlock:15},{numBlocks:28,dataCodewordsPerBlock:16}]}]},{infoBits:117786,versionNumber:28,alignmentPatternCenters:[6,26,50,74,98,122],errorCorrectionLevels:[{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:3,dataCodewordsPerBlock:117},\n{numBlocks:10,dataCodewordsPerBlock:118}]},{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:3,dataCodewordsPerBlock:45},{numBlocks:23,dataCodewordsPerBlock:46}]},{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:4,dataCodewordsPerBlock:24},{numBlocks:31,dataCodewordsPerBlock:25}]},{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:11,dataCodewordsPerBlock:15},{numBlocks:31,dataCodewordsPerBlock:16}]}]},{infoBits:119615,versionNumber:29,alignmentPatternCenters:[6,30,54,78,102,126],errorCorrectionLevels:[{ecCodewordsPerBlock:30,\necBlocks:[{numBlocks:7,dataCodewordsPerBlock:116},{numBlocks:7,dataCodewordsPerBlock:117}]},{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:21,dataCodewordsPerBlock:45},{numBlocks:7,dataCodewordsPerBlock:46}]},{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:1,dataCodewordsPerBlock:23},{numBlocks:37,dataCodewordsPerBlock:24}]},{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:19,dataCodewordsPerBlock:15},{numBlocks:26,dataCodewordsPerBlock:16}]}]},{infoBits:126325,versionNumber:30,alignmentPatternCenters:[6,\n26,52,78,104,130],errorCorrectionLevels:[{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:5,dataCodewordsPerBlock:115},{numBlocks:10,dataCodewordsPerBlock:116}]},{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:19,dataCodewordsPerBlock:47},{numBlocks:10,dataCodewordsPerBlock:48}]},{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:15,dataCodewordsPerBlock:24},{numBlocks:25,dataCodewordsPerBlock:25}]},{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:23,dataCodewordsPerBlock:15},{numBlocks:25,dataCodewordsPerBlock:16}]}]},\n{infoBits:127568,versionNumber:31,alignmentPatternCenters:[6,30,56,82,108,134],errorCorrectionLevels:[{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:13,dataCodewordsPerBlock:115},{numBlocks:3,dataCodewordsPerBlock:116}]},{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:2,dataCodewordsPerBlock:46},{numBlocks:29,dataCodewordsPerBlock:47}]},{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:42,dataCodewordsPerBlock:24},{numBlocks:1,dataCodewordsPerBlock:25}]},{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:23,dataCodewordsPerBlock:15},\n{numBlocks:28,dataCodewordsPerBlock:16}]}]},{infoBits:133589,versionNumber:32,alignmentPatternCenters:[6,34,60,86,112,138],errorCorrectionLevels:[{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:17,dataCodewordsPerBlock:115}]},{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:10,dataCodewordsPerBlock:46},{numBlocks:23,dataCodewordsPerBlock:47}]},{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:10,dataCodewordsPerBlock:24},{numBlocks:35,dataCodewordsPerBlock:25}]},{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:19,\ndataCodewordsPerBlock:15},{numBlocks:35,dataCodewordsPerBlock:16}]}]},{infoBits:136944,versionNumber:33,alignmentPatternCenters:[6,30,58,86,114,142],errorCorrectionLevels:[{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:17,dataCodewordsPerBlock:115},{numBlocks:1,dataCodewordsPerBlock:116}]},{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:14,dataCodewordsPerBlock:46},{numBlocks:21,dataCodewordsPerBlock:47}]},{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:29,dataCodewordsPerBlock:24},{numBlocks:19,dataCodewordsPerBlock:25}]},\n{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:11,dataCodewordsPerBlock:15},{numBlocks:46,dataCodewordsPerBlock:16}]}]},{infoBits:141498,versionNumber:34,alignmentPatternCenters:[6,34,62,90,118,146],errorCorrectionLevels:[{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:13,dataCodewordsPerBlock:115},{numBlocks:6,dataCodewordsPerBlock:116}]},{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:14,dataCodewordsPerBlock:46},{numBlocks:23,dataCodewordsPerBlock:47}]},{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:44,\ndataCodewordsPerBlock:24},{numBlocks:7,dataCodewordsPerBlock:25}]},{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:59,dataCodewordsPerBlock:16},{numBlocks:1,dataCodewordsPerBlock:17}]}]},{infoBits:145311,versionNumber:35,alignmentPatternCenters:[6,30,54,78,102,126,150],errorCorrectionLevels:[{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:12,dataCodewordsPerBlock:121},{numBlocks:7,dataCodewordsPerBlock:122}]},{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:12,dataCodewordsPerBlock:47},{numBlocks:26,dataCodewordsPerBlock:48}]},\n{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:39,dataCodewordsPerBlock:24},{numBlocks:14,dataCodewordsPerBlock:25}]},{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:22,dataCodewordsPerBlock:15},{numBlocks:41,dataCodewordsPerBlock:16}]}]},{infoBits:150283,versionNumber:36,alignmentPatternCenters:[6,24,50,76,102,128,154],errorCorrectionLevels:[{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:6,dataCodewordsPerBlock:121},{numBlocks:14,dataCodewordsPerBlock:122}]},{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:6,\ndataCodewordsPerBlock:47},{numBlocks:34,dataCodewordsPerBlock:48}]},{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:46,dataCodewordsPerBlock:24},{numBlocks:10,dataCodewordsPerBlock:25}]},{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:2,dataCodewordsPerBlock:15},{numBlocks:64,dataCodewordsPerBlock:16}]}]},{infoBits:152622,versionNumber:37,alignmentPatternCenters:[6,28,54,80,106,132,158],errorCorrectionLevels:[{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:17,dataCodewordsPerBlock:122},{numBlocks:4,dataCodewordsPerBlock:123}]},\n{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:29,dataCodewordsPerBlock:46},{numBlocks:14,dataCodewordsPerBlock:47}]},{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:49,dataCodewordsPerBlock:24},{numBlocks:10,dataCodewordsPerBlock:25}]},{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:24,dataCodewordsPerBlock:15},{numBlocks:46,dataCodewordsPerBlock:16}]}]},{infoBits:158308,versionNumber:38,alignmentPatternCenters:[6,32,58,84,110,136,162],errorCorrectionLevels:[{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:4,\ndataCodewordsPerBlock:122},{numBlocks:18,dataCodewordsPerBlock:123}]},{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:13,dataCodewordsPerBlock:46},{numBlocks:32,dataCodewordsPerBlock:47}]},{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:48,dataCodewordsPerBlock:24},{numBlocks:14,dataCodewordsPerBlock:25}]},{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:42,dataCodewordsPerBlock:15},{numBlocks:32,dataCodewordsPerBlock:16}]}]},{infoBits:161089,versionNumber:39,alignmentPatternCenters:[6,26,54,82,110,138,166],\nerrorCorrectionLevels:[{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:20,dataCodewordsPerBlock:117},{numBlocks:4,dataCodewordsPerBlock:118}]},{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:40,dataCodewordsPerBlock:47},{numBlocks:7,dataCodewordsPerBlock:48}]},{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:43,dataCodewordsPerBlock:24},{numBlocks:22,dataCodewordsPerBlock:25}]},{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:10,dataCodewordsPerBlock:15},{numBlocks:67,dataCodewordsPerBlock:16}]}]},{infoBits:167017,\nversionNumber:40,alignmentPatternCenters:[6,30,58,86,114,142,170],errorCorrectionLevels:[{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:19,dataCodewordsPerBlock:118},{numBlocks:6,dataCodewordsPerBlock:119}]},{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:18,dataCodewordsPerBlock:47},{numBlocks:31,dataCodewordsPerBlock:48}]},{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:34,dataCodewordsPerBlock:24},{numBlocks:34,dataCodewordsPerBlock:25}]},{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:20,dataCodewordsPerBlock:15},\n{numBlocks:61,dataCodewordsPerBlock:16}]}]}];function J(a,b){a^=b;for(b=0;a;)b++,a&=a-1;return b}function K(a,b){return b<<1|a}\nlet ia=[{bits:21522,formatInfo:{errorCorrectionLevel:1,dataMask:0}},{bits:20773,formatInfo:{errorCorrectionLevel:1,dataMask:1}},{bits:24188,formatInfo:{errorCorrectionLevel:1,dataMask:2}},{bits:23371,formatInfo:{errorCorrectionLevel:1,dataMask:3}},{bits:17913,formatInfo:{errorCorrectionLevel:1,dataMask:4}},{bits:16590,formatInfo:{errorCorrectionLevel:1,dataMask:5}},{bits:20375,formatInfo:{errorCorrectionLevel:1,dataMask:6}},{bits:19104,formatInfo:{errorCorrectionLevel:1,dataMask:7}},{bits:30660,formatInfo:{errorCorrectionLevel:0,\ndataMask:0}},{bits:29427,formatInfo:{errorCorrectionLevel:0,dataMask:1}},{bits:32170,formatInfo:{errorCorrectionLevel:0,dataMask:2}},{bits:30877,formatInfo:{errorCorrectionLevel:0,dataMask:3}},{bits:26159,formatInfo:{errorCorrectionLevel:0,dataMask:4}},{bits:25368,formatInfo:{errorCorrectionLevel:0,dataMask:5}},{bits:27713,formatInfo:{errorCorrectionLevel:0,dataMask:6}},{bits:26998,formatInfo:{errorCorrectionLevel:0,dataMask:7}},{bits:5769,formatInfo:{errorCorrectionLevel:3,dataMask:0}},{bits:5054,\nformatInfo:{errorCorrectionLevel:3,dataMask:1}},{bits:7399,formatInfo:{errorCorrectionLevel:3,dataMask:2}},{bits:6608,formatInfo:{errorCorrectionLevel:3,dataMask:3}},{bits:1890,formatInfo:{errorCorrectionLevel:3,dataMask:4}},{bits:597,formatInfo:{errorCorrectionLevel:3,dataMask:5}},{bits:3340,formatInfo:{errorCorrectionLevel:3,dataMask:6}},{bits:2107,formatInfo:{errorCorrectionLevel:3,dataMask:7}},{bits:13663,formatInfo:{errorCorrectionLevel:2,dataMask:0}},{bits:12392,formatInfo:{errorCorrectionLevel:2,\ndataMask:1}},{bits:16177,formatInfo:{errorCorrectionLevel:2,dataMask:2}},{bits:14854,formatInfo:{errorCorrectionLevel:2,dataMask:3}},{bits:9396,formatInfo:{errorCorrectionLevel:2,dataMask:4}},{bits:8579,formatInfo:{errorCorrectionLevel:2,dataMask:5}},{bits:11994,formatInfo:{errorCorrectionLevel:2,dataMask:6}},{bits:11245,formatInfo:{errorCorrectionLevel:2,dataMask:7}}],ja=[a=>0===(a.y+a.x)%2,a=>0===a.y%2,a=>0===a.x%3,a=>0===(a.y+a.x)%3,a=>0===(Math.floor(a.y/2)+Math.floor(a.x/3))%2,a=>0===a.x*a.y%\n2+a.x*a.y%3,a=>0===(a.y*a.x%2+a.y*a.x%3)%2,a=>0===((a.y+a.x)%2+a.y*a.x%3)%2];\nfunction ka(a,b,c){c=ja[c.dataMask];let d=a.height;var e=17+4*b.versionNumber;let f=x.createEmpty(e,e);f.setRegion(0,0,9,9,!0);f.setRegion(e-8,0,8,9,!0);f.setRegion(0,e-8,9,8,!0);for(var g of b.alignmentPatternCenters)for(var h of b.alignmentPatternCenters)6===g&&6===h||6===g&&h===e-7||g===e-7&&6===h||f.setRegion(g-2,h-2,5,5,!0);f.setRegion(6,9,1,e-17,!0);f.setRegion(9,6,e-17,1,!0);6<b.versionNumber&&(f.setRegion(e-11,0,3,6,!0),f.setRegion(0,e-11,6,3,!0));b=[];h=g=0;e=!0;for(let k=d-1;0<k;k-=2){6===\nk&&k--;for(let m=0;m<d;m++){let l=e?d-1-m:m;for(let n=0;2>n;n++){let q=k-n;if(!f.get(q,l)){h++;let r=a.get(q,l);c({y:l,x:q})&&(r=!r);g=g<<1|r;8===h&&(b.push(g),g=h=0)}}}e=!e}return b}\nfunction la(a){var b=a.height,c=Math.floor((b-17)/4);if(6>=c)return I[c-1];c=0;for(var d=5;0<=d;d--)for(var e=b-9;e>=b-11;e--)c=K(a.get(e,d),c);d=0;for(e=5;0<=e;e--)for(let g=b-9;g>=b-11;g--)d=K(a.get(e,g),d);a=Infinity;let f;for(let g of I){if(g.infoBits===c||g.infoBits===d)return g;b=J(c,g.infoBits);b<a&&(f=g,a=b);b=J(d,g.infoBits);b<a&&(f=g,a=b)}if(3>=a)return f}\nfunction ma(a){let b=0;for(var c=0;8>=c;c++)6!==c&&(b=K(a.get(c,8),b));for(c=7;0<=c;c--)6!==c&&(b=K(a.get(8,c),b));var d=a.height;c=0;for(var e=d-1;e>=d-7;e--)c=K(a.get(8,e),c);for(e=d-8;e<d;e++)c=K(a.get(e,8),c);a=Infinity;d=null;for(let {bits:f,formatInfo:g}of ia){if(f===b||f===c)return g;e=J(b,f);e<a&&(d=g,a=e);b!==c&&(e=J(c,f),e<a&&(d=g,a=e))}return 3>=a?d:null}\nfunction na(a,b,c){let d=b.errorCorrectionLevels[c],e=[],f=0;d.ecBlocks.forEach(h=>{for(let k=0;k<h.numBlocks;k++)e.push({numDataCodewords:h.dataCodewordsPerBlock,codewords:[]}),f+=h.dataCodewordsPerBlock+d.ecCodewordsPerBlock});if(a.length<f)return null;a=a.slice(0,f);b=d.ecBlocks[0].dataCodewordsPerBlock;for(c=0;c<b;c++)for(var g of e)g.codewords.push(a.shift());if(1<d.ecBlocks.length)for(g=d.ecBlocks[0].numBlocks,b=d.ecBlocks[1].numBlocks,c=0;c<b;c++)e[g+c].codewords.push(a.shift());for(;0<a.length;)for(let h of e)h.codewords.push(a.shift());\nreturn e}function L(a){let b=la(a);if(!b)return null;var c=ma(a);if(!c)return null;a=ka(a,b,c);var d=na(a,b,c.errorCorrectionLevel);if(!d)return null;c=d.reduce((e,f)=>e+f.numDataCodewords,0);c=new Uint8ClampedArray(c);a=0;for(let e of d){d=ha(e.codewords,e.codewords.length-e.numDataCodewords);if(!d)return null;for(let f=0;f<e.numDataCodewords;f++)c[a++]=d[f]}try{return da(c,b.versionNumber)}catch(e){return null}}\nfunction M(a,b,c,d){var e=a.x-b.x+c.x-d.x;let f=a.y-b.y+c.y-d.y;if(0===e&&0===f)return{a11:b.x-a.x,a12:b.y-a.y,a13:0,a21:c.x-b.x,a22:c.y-b.y,a23:0,a31:a.x,a32:a.y,a33:1};let g=b.x-c.x;var h=d.x-c.x;let k=b.y-c.y,m=d.y-c.y;c=g*m-h*k;h=(e*m-h*f)/c;e=(g*f-e*k)/c;return{a11:b.x-a.x+h*b.x,a12:b.y-a.y+h*b.y,a13:h,a21:d.x-a.x+e*d.x,a22:d.y-a.y+e*d.y,a23:e,a31:a.x,a32:a.y,a33:1}}\nfunction oa(a,b,c,d){a=M(a,b,c,d);return{a11:a.a22*a.a33-a.a23*a.a32,a12:a.a13*a.a32-a.a12*a.a33,a13:a.a12*a.a23-a.a13*a.a22,a21:a.a23*a.a31-a.a21*a.a33,a22:a.a11*a.a33-a.a13*a.a31,a23:a.a13*a.a21-a.a11*a.a23,a31:a.a21*a.a32-a.a22*a.a31,a32:a.a12*a.a31-a.a11*a.a32,a33:a.a11*a.a22-a.a12*a.a21}}\nfunction pa(a,b){var c=oa({x:3.5,y:3.5},{x:b.dimension-3.5,y:3.5},{x:b.dimension-6.5,y:b.dimension-6.5},{x:3.5,y:b.dimension-3.5}),d=M(b.topLeft,b.topRight,b.alignmentPattern,b.bottomLeft),e=d.a11*c.a11+d.a21*c.a12+d.a31*c.a13,f=d.a12*c.a11+d.a22*c.a12+d.a32*c.a13,g=d.a13*c.a11+d.a23*c.a12+d.a33*c.a13,h=d.a11*c.a21+d.a21*c.a22+d.a31*c.a23,k=d.a12*c.a21+d.a22*c.a22+d.a32*c.a23,m=d.a13*c.a21+d.a23*c.a22+d.a33*c.a23,l=d.a11*c.a31+d.a21*c.a32+d.a31*c.a33,n=d.a12*c.a31+d.a22*c.a32+d.a32*c.a33,q=d.a13*\nc.a31+d.a23*c.a32+d.a33*c.a33;c=x.createEmpty(b.dimension,b.dimension);d=(r,u)=>{const p=g*r+m*u+q;return{x:(e*r+h*u+l)/p,y:(f*r+k*u+n)/p}};for(let r=0;r<b.dimension;r++)for(let u=0;u<b.dimension;u++){let p=d(u+.5,r+.5);c.set(u,r,a.get(Math.floor(p.x),Math.floor(p.y)))}return{matrix:c,mappingFunction:d}}let N=(a,b)=>Math.sqrt(Math.pow(b.x-a.x,2)+Math.pow(b.y-a.y,2));function O(a){return a.reduce((b,c)=>b+c)}\nfunction qa(a,b,c){let d=N(a,b),e=N(b,c),f=N(a,c),g,h,k;e>=d&&e>=f?[g,h,k]=[b,a,c]:f>=e&&f>=d?[g,h,k]=[a,b,c]:[g,h,k]=[a,c,b];0>(k.x-h.x)*(g.y-h.y)-(k.y-h.y)*(g.x-h.x)&&([g,k]=[k,g]);return{bottomLeft:g,topLeft:h,topRight:k}}\nfunction ra(a,b,c,d){d=(O(P(a,c,d,5))/7+O(P(a,b,d,5))/7+O(P(c,a,d,5))/7+O(P(b,a,d,5))/7)/4;if(1>d)throw Error("Invalid module size");b=Math.round(N(a,b)/d);a=Math.round(N(a,c)/d);a=Math.floor((b+a)/2)+7;switch(a%4){case 0:a++;break;case 2:a--}return{dimension:a,moduleSize:d}}\nfunction Q(a,b,c,d){let e=[{x:Math.floor(a.x),y:Math.floor(a.y)}];var f=Math.abs(b.y-a.y)>Math.abs(b.x-a.x);if(f){var g=Math.floor(a.y);var h=Math.floor(a.x);a=Math.floor(b.y);b=Math.floor(b.x)}else g=Math.floor(a.x),h=Math.floor(a.y),a=Math.floor(b.x),b=Math.floor(b.y);let k=Math.abs(a-g),m=Math.abs(b-h),l=Math.floor(-k/2),n=g<a?1:-1,q=h<b?1:-1,r=!0;for(let u=g,p=h;u!==a+n;u+=n){g=f?p:u;h=f?u:p;if(c.get(g,h)!==r&&(r=!r,e.push({x:g,y:h}),e.length===d+1))break;l+=m;if(0<l){if(p===b)break;p+=q;l-=k}}c=\n[];for(f=0;f<d;f++)e[f]&&e[f+1]?c.push(N(e[f],e[f+1])):c.push(0);return c}function P(a,b,c,d){let e=b.y-a.y,f=b.x-a.x;b=Q(a,b,c,Math.ceil(d/2));a=Q(a,{x:a.x-f,y:a.y-e},c,Math.ceil(d/2));c=b.shift()+a.shift()-1;return a.concat(c).concat(...b)}function R(a,b){let c=O(a)/O(b),d=0;b.forEach((e,f)=>{d+=Math.pow(a[f]-e*c,2)});return{averageSize:c,error:d}}\nfunction S(a,b,c){try{let d=P(a,{x:-1,y:a.y},c,b.length),e=P(a,{x:a.x,y:-1},c,b.length),f=P(a,{x:Math.max(0,a.x-a.y)-1,y:Math.max(0,a.y-a.x)-1},c,b.length),g=P(a,{x:Math.min(c.width,a.x+a.y)+1,y:Math.min(c.height,a.y+a.x)+1},c,b.length),h=R(d,b),k=R(e,b),m=R(f,b),l=R(g,b),n=(h.averageSize+k.averageSize+m.averageSize+l.averageSize)/4;return Math.sqrt(h.error*h.error+k.error*k.error+m.error*m.error+l.error*l.error)+(Math.pow(h.averageSize-n,2)+Math.pow(k.averageSize-n,2)+Math.pow(m.averageSize-n,2)+\nMath.pow(l.averageSize-n,2))/n}catch(d){return Infinity}}function T(a,b){for(var c=Math.round(b.x);a.get(c,Math.round(b.y));)c--;for(var d=Math.round(b.x);a.get(d,Math.round(b.y));)d++;c=(c+d)/2;for(d=Math.round(b.y);a.get(Math.round(c),d);)d--;for(b=Math.round(b.y);a.get(Math.round(c),b);)b++;return{x:c,y:(d+b)/2}}\nfunction sa(a){var b=[],c=[];let d=[];var e=[];for(let p=0;p<=a.height;p++){var f=0,g=!1;let t=[0,0,0,0,0];for(let v=-1;v<=a.width;v++){var h=a.get(v,p);if(h===g)f++;else{t=[t[1],t[2],t[3],t[4],f];f=1;g=h;var k=O(t)/7;k=Math.abs(t[0]-k)<k&&Math.abs(t[1]-k)<k&&Math.abs(t[2]-3*k)<3*k&&Math.abs(t[3]-k)<k&&Math.abs(t[4]-k)<k&&!h;var m=O(t.slice(-3))/3;h=Math.abs(t[2]-m)<m&&Math.abs(t[3]-m)<m&&Math.abs(t[4]-m)<m&&h;if(k){let z=v-t[3]-t[4],y=z-t[2];k={startX:y,endX:z,y:p};m=c.filter(w=>y>=w.bottom.startX&&\ny<=w.bottom.endX||z>=w.bottom.startX&&y<=w.bottom.endX||y<=w.bottom.startX&&z>=w.bottom.endX&&1.5>t[2]/(w.bottom.endX-w.bottom.startX)&&.5<t[2]/(w.bottom.endX-w.bottom.startX));0<m.length?m[0].bottom=k:c.push({top:k,bottom:k})}if(h){let z=v-t[4],y=z-t[3];h={startX:y,y:p,endX:z};k=e.filter(w=>y>=w.bottom.startX&&y<=w.bottom.endX||z>=w.bottom.startX&&y<=w.bottom.endX||y<=w.bottom.startX&&z>=w.bottom.endX&&1.5>t[2]/(w.bottom.endX-w.bottom.startX)&&.5<t[2]/(w.bottom.endX-w.bottom.startX));0<k.length?\nk[0].bottom=h:e.push({top:h,bottom:h})}}}b.push(...c.filter(v=>v.bottom.y!==p&&2<=v.bottom.y-v.top.y));c=c.filter(v=>v.bottom.y===p);d.push(...e.filter(v=>v.bottom.y!==p));e=e.filter(v=>v.bottom.y===p)}b.push(...c.filter(p=>2<=p.bottom.y-p.top.y));d.push(...e);c=[];for(var l of b)2>l.bottom.y-l.top.y||(b=(l.top.startX+l.top.endX+l.bottom.startX+l.bottom.endX)/4,e=(l.top.y+l.bottom.y+1)/2,a.get(Math.round(b),Math.round(e))&&(f=[l.top.endX-l.top.startX,l.bottom.endX-l.bottom.startX,l.bottom.y-l.top.y+\n1],f=O(f)/f.length,g=S({x:Math.round(b),y:Math.round(e)},[1,1,3,1,1],a),c.push({score:g,x:b,y:e,size:f})));if(3>c.length)return null;c.sort((p,t)=>p.score-t.score);l=[];for(b=0;b<Math.min(c.length,5);++b){e=c[b];f=[];for(var n of c)n!==e&&f.push(Object.assign(Object.assign({},n),{score:n.score+Math.pow(n.size-e.size,2)/e.size}));f.sort((p,t)=>p.score-t.score);l.push({points:[e,f[0],f[1]],score:e.score+f[0].score+f[1].score})}l.sort((p,t)=>p.score-t.score);let {topRight:q,topLeft:r,bottomLeft:u}=qa(...l[0].points);\nl=U(a,d,q,r,u);n=[];l&&n.push({alignmentPattern:{x:l.alignmentPattern.x,y:l.alignmentPattern.y},bottomLeft:{x:u.x,y:u.y},dimension:l.dimension,topLeft:{x:r.x,y:r.y},topRight:{x:q.x,y:q.y}});l=T(a,q);b=T(a,r);c=T(a,u);(a=U(a,d,l,b,c))&&n.push({alignmentPattern:{x:a.alignmentPattern.x,y:a.alignmentPattern.y},bottomLeft:{x:c.x,y:c.y},topLeft:{x:b.x,y:b.y},topRight:{x:l.x,y:l.y},dimension:a.dimension});return 0===n.length?null:n}\nfunction U(a,b,c,d,e){let f,g;try{({dimension:f,moduleSize:g}=ra(d,c,e,a))}catch(l){return null}var h=c.x-d.x+e.x,k=c.y-d.y+e.y;c=(N(d,e)+N(d,c))/2/g;e=1-3/c;let m={x:d.x+e*(h-d.x),y:d.y+e*(k-d.y)};b=b.map(l=>{const n=(l.top.startX+l.top.endX+l.bottom.startX+l.bottom.endX)/4;l=(l.top.y+l.bottom.y+1)/2;if(a.get(Math.floor(n),Math.floor(l))){var q=S({x:Math.floor(n),y:Math.floor(l)},[1,1,1],a)+N({x:n,y:l},m);return{x:n,y:l,score:q}}}).filter(l=>!!l).sort((l,n)=>l.score-n.score);return{alignmentPattern:15<=\nc&&b.length?b[0]:m,dimension:f}}\nfunction V(a){var b=sa(a);if(!b)return null;for(let e of b){b=pa(a,e);var c=b.matrix;if(null==c)c=null;else{var d=L(c);if(d)c=d;else{for(d=0;d<c.width;d++)for(let f=d+1;f<c.height;f++)c.get(d,f)!==c.get(f,d)&&(c.set(d,f,!c.get(d,f)),c.set(f,d,!c.get(f,d)));c=L(c)}}if(c)return{binaryData:c.bytes,data:c.text,chunks:c.chunks,version:c.version,location:{topRightCorner:b.mappingFunction(e.dimension,0),topLeftCorner:b.mappingFunction(0,0),bottomRightCorner:b.mappingFunction(e.dimension,e.dimension),bottomLeftCorner:b.mappingFunction(0,\ne.dimension),topRightFinderPattern:e.topRight,topLeftFinderPattern:e.topLeft,bottomLeftFinderPattern:e.bottomLeft,bottomRightAlignmentPattern:e.alignmentPattern},matrix:b.matrix}}return null}let ta={inversionAttempts:"attemptBoth",greyScaleWeights:{red:.2126,green:.7152,blue:.0722,useIntegerApproximation:!1},canOverwriteImage:!0};function W(a,b){Object.keys(b).forEach(c=>{a[c]=b[c]})}\nfunction X(a,b,c,d={}){let e=Object.create(null);W(e,ta);W(e,d);d="onlyInvert"===e.inversionAttempts||"invertFirst"===e.inversionAttempts;var f="attemptBoth"===e.inversionAttempts||d;var g=e.greyScaleWeights,h=e.canOverwriteImage,k=b*c;if(a.length!==4*k)throw Error("Malformed data passed to binarizer.");var m=0;if(h){var l=new Uint8ClampedArray(a.buffer,m,k);m+=k}l=new A(b,c,l);if(g.useIntegerApproximation)for(var n=0;n<c;n++)for(var q=0;q<b;q++){var r=4*(n*b+q);l.set(q,n,g.red*a[r]+g.green*a[r+1]+\ng.blue*a[r+2]+128>>8)}else for(n=0;n<c;n++)for(q=0;q<b;q++)r=4*(n*b+q),l.set(q,n,g.red*a[r]+g.green*a[r+1]+g.blue*a[r+2]);g=Math.ceil(b/8);n=Math.ceil(c/8);q=g*n;if(h){var u=new Uint8ClampedArray(a.buffer,m,q);m+=q}u=new A(g,n,u);for(q=0;q<n;q++)for(r=0;r<g;r++){var p=Infinity,t=0;for(var v=0;8>v;v++)for(let w=0;8>w;w++){let aa=l.get(8*r+w,8*q+v);p=Math.min(p,aa);t=Math.max(t,aa)}v=(p+t)/2;v=Math.min(255,1.11*v);24>=t-p&&(v=p/2,0<q&&0<r&&(t=(u.get(r,q-1)+2*u.get(r-1,q)+u.get(r-1,q-1))/4,p<t&&(v=t)));\nu.set(r,q,v)}h?(q=new Uint8ClampedArray(a.buffer,m,k),m+=k,q=new x(q,b)):q=x.createEmpty(b,c);r=null;f&&(h?(a=new Uint8ClampedArray(a.buffer,m,k),r=new x(a,b)):r=x.createEmpty(b,c));for(b=0;b<n;b++)for(a=0;a<g;a++){c=g-3;c=2>a?2:a>c?c:a;h=n-3;h=2>b?2:b>h?h:b;k=0;for(m=-2;2>=m;m++)for(p=-2;2>=p;p++)k+=u.get(c+m,h+p);c=k/25;for(h=0;8>h;h++)for(k=0;8>k;k++)m=8*a+h,p=8*b+k,t=l.get(m,p),q.set(m,p,t<=c),f&&r.set(m,p,!(t<=c))}f=f?{binarized:q,inverted:r}:{binarized:q};let {binarized:z,inverted:y}=f;(f=V(d?\ny:z))||"attemptBoth"!==e.inversionAttempts&&"invertFirst"!==e.inversionAttempts||(f=V(d?z:y));return f}X.default=X;let Y="dontInvert",Z={red:77,green:150,blue:29,useIntegerApproximation:!0};\nself.onmessage=a=>{let b=a.data.id,c=a.data.data;switch(a.data.type){case "decode":(a=X(c.data,c.width,c.height,{inversionAttempts:Y,greyScaleWeights:Z}))?self.postMessage({id:b,type:"qrResult",data:a.data,cornerPoints:[a.location.topLeftCorner,a.location.topRightCorner,a.location.bottomRightCorner,a.location.bottomLeftCorner]}):self.postMessage({id:b,type:"qrResult",data:null});break;case "grayscaleWeights":Z.red=c.red;Z.green=c.green;Z.blue=c.blue;Z.useIntegerApproximation=c.useIntegerApproximation;\nbreak;case "inversionMode":switch(c){case "original":Y="dontInvert";break;case "invert":Y="onlyInvert";break;case "both":Y="attemptBoth";break;default:throw Error("Invalid inversion mode");}break;case "close":self.close()}}\n',
          ]),
          { type: "application/javascript" }
        )
      ),
  });
  return c;
});
//# sourceMappingURL=qr-scanner.legacy.min.js.map
