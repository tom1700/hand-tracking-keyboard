const KEY_CHOOSE_DELAY = 70;

AFRAME.registerComponent("keyboard", {
  handsMostComplexState: {
    left: "0000",
    right: "0000",
  },

  pressingState: {
    left: false,
    right: false,
  },

  shouldWait: false,

  isPressing() {
    return this.pressingState.left || this.pressingState.right;
  },

  init() {
    this.controllers = Array.from(document.querySelectorAll(".hand"));
  },

  play() {
    this.controllers.forEach((controller) => {
      controller.addEventListener(
        "touchState",
        this.onTouchStateChange.bind(this)
      );
    });
  },

  pause() {
    this.controllers.forEach((controller) => {
      controller.removeEventListener(
        "touchState",
        this.onTouchStateChange.bind(this)
      );
    });
  },

  onTouchStateChange(e) {
    const { hand, fingersState } = e.detail;

    const wasPressing = this.isPressing();
    this.pressingState[hand] = fingersState !== "0000";

    if (fingersState === this.handsMostComplexState[hand] || this.shouldWait) {
      // No update: ignore
      return;
    }

    // Touch ended
    if (wasPressing && !this.isPressing()) {
      this.emitKeyAndResetState();
      this.shouldWait = true;
      setTimeout(() => {
        this.shouldWait = false;
      }, KEY_CHOOSE_DELAY);
      return;
    }

    // Touch in progress
    if (this.isPressing()) {
      this.updateHandsMostComplexState(hand, fingersState);
      return;
    }
  },

  emitKeyAndResetState() {
    const key = this.getKey();
    this.el.emit("keyPress", key);
    this.resetStateChoosing();
  },

  countActiveFingers(handState) {
    return handState.split("1").length - 1;
  },

  updateHandsMostComplexState(hand, fingersState) {
    const currentTotalCount =
      this.countActiveFingers(this.handsMostComplexState.left) +
      this.countActiveFingers(this.handsMostComplexState.right);
    const notUpdatedHand = hand === "left" ? "right" : "left";
    const newTotalCount =
      this.countActiveFingers(this.handsMostComplexState[notUpdatedHand]) +
      this.countActiveFingers(fingersState);

    if (newTotalCount >= currentTotalCount) {
      this.handsMostComplexState[hand] = fingersState;
    }
  },

  resetStateChoosing() {
    this.handsMostComplexState = {
      left: "0000",
      right: "0000",
    };
  },

  keyMap: { ...KEY_MAP },

  getKey() {
    return this.keyMap[
      `${this.handsMostComplexState.left}|${this.handsMostComplexState.right}`
    ];
  },
});
