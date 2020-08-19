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

  updateScreen(key) {
    if (!key) {
      return;
    }
    const currentValue = this.el
      .getAttribute("text", "value")
      .value.slice(0, -1);
    const newValue =
      (key === "bspc" ? currentValue.slice(0, -1) : currentValue + key) + "|";

    this.el.setAttribute("text", "value", newValue);
  },
});
