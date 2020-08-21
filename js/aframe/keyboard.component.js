const KEY_CHOOSE_DELAY = 100;

AFRAME.registerComponent("keyboard", {
  handsMostComplexState: {
    left: "0000",
    right: "0000",
  },

  pressingState: {
    left: false,
    right: false,
  },

  isPressing() {
    return this.pressingState.left || this.pressingState.right;
  },

  isChoosingState: false,

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

    if (fingersState === this.handsMostComplexState[hand]) {
      // No update: ignore
      return;
    }

    // Touch started
    if (!wasPressing && this.isPressing()) {
      this.isChoosingState = true;
      // We always want to use the most complex state that user performs in the next KEY_CHOOSE_DELAY ms.
      setTimeout(() => {
        this.emitKeyAndResetState();
      }, KEY_CHOOSE_DELAY);
      this.updateHandsMostComplexState(hand, fingersState);
      return;
    }

    if (this.isPressing() && this.isChoosingState) {
      this.updateHandsMostComplexState(hand, fingersState);
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
    this.isChoosingState = false;
  },

  keyMap: { ...KEY_MAP },

  getKey() {
    return this.keyMap[
      `${this.handsMostComplexState.left}|${this.handsMostComplexState.right}`
    ];
  },
});
