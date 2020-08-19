const updateScreen = throttle(
  (instance, key) => {
    instance.resetHandsMostComplexState();
    if (!key) {
      return;
    }
    const currentValue = instance.el.getAttribute("text", "value").value;
    const newValue =
      key === "bspc" ? currentValue.slice(0, -1) : currentValue + key;

    instance.el.setAttribute("text", "value", newValue);
  },
  50,
  { leading: false }
);

AFRAME.registerComponent("screen", {
  handsMostComplexState: {
    left: [0, 0, 0, 0],
    right: [0, 0, 0, 0],
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

    // We always want to use the most complex state.
    // You can't unconnect 2 fingers in perfect synchronization.
    // That's why the app would use the last unconnected finger otherwise.
    this.updateHandsMostComplexState(hand, fingersState);
    const key = this.getKey();
    updateScreen(this, key);
  },

  countActiveFingers(handState) {
    return handState.filter(Boolean).length;
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

  resetHandsMostComplexState() {
    this.handsMostComplexState = {
      left: [0, 0, 0, 0],
      right: [0, 0, 0, 0],
    };
  },

  keyMap: { ...KEY_MAP },

  getKey() {
    return this.keyMap[
      `${this.handsMostComplexState.left.join(
        ""
      )}|${this.handsMostComplexState.right.join("")}`
    ];
  },
});
