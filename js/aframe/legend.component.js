AFRAME.registerComponent("legend", {
  init() {
    this.el.setAttribute("text", "value", this.buildLegend());
  },

  buildLegend() {
    const header =
      "Touch specific finger with your thumb.\nleft   |right\n1234|4321: key\n";
    return [
      header,
      ...Object.entries(KEY_MAP).map(([key, value]) => {
        const [left, right] = key.split("|");
        return `${left}|${right.split("").reverse().join("")}: ${value}`;
      }),
    ].join("\n");
  },
});
