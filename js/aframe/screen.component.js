AFRAME.registerComponent("screen", {
  init() {
    this.keyboard = document.querySelector("#keyboard");
  },

  play() {
    this.keyboard.addEventListener("keyPress", this.onKeyPress.bind(this));
  },

  pause() {
    this.keyboard.removeEventListener("keyPress", this.onKeyPress.bind(this));
  },

  onKeyPress(e) {
    const key = e.detail;

    this.updateScreen(key);
  },

  getNewValue(key) {
    const currentValue = this.el
      .getAttribute("text", "value")
      .value.slice(0, -1);

    if (key === "bspc") {
      return currentValue.slice(0, -1) + "|";
    }

    if (key === "enter") {
      return currentValue + "\n" + "|";
    }

    return currentValue + key + "|";
  },

  updateScreen(key) {
    if (!key) {
      return;
    }

    const newValue = this.getNewValue(key);

    this.el.setAttribute("text", "value", newValue);
  },
});
