AFRAME.registerComponent("hand-tracking-gestures-mesh", {
  dependencies: ["hand-tracking-mesh"],

  init() {
    this.handTracking = this.el.components["hand-tracking-mesh"];
  },

  tick() {
    if (this.handTracking.jointsLoaded() && this.handTracking.mesh != null) {
      const position = this.handTracking
        .getJoints()
        [XRHand.THUMB_PHALANX_TIP].position.clone();

      const isIndexTouching = this.touchCheck(
        this.handTracking,
        XRHand.INDEX_PHALANX_TIP,
        "INDEX"
      );
      const isMiddleTouching = this.touchCheck(
        this.handTracking,
        XRHand.MIDDLE_PHALANX_TIP,
        "MIDDLE"
      );
      const isRingTouching = this.touchCheck(
        this.handTracking,
        XRHand.RING_PHALANX_TIP,
        "RING"
      );
      const isLittleTouching = this.touchCheck(
        this.handTracking,
        XRHand.LITTLE_PHALANX_TIP,
        "LITTLE"
      );

      const fingersState = [
        isIndexTouching ? 1 : 0,
        isMiddleTouching ? 1 : 0,
        isRingTouching ? 1 : 0,
        isLittleTouching ? 1 : 0,
      ];

      const state = {
        hand: this.handTracking.data.hand,
        fingersState,
      };

      this.el.emit("touchState", state);
    }
  },
  touchCheck(hand, fingerId) {
    const joints = hand.getJoints();
    const thumbTip = joints[XRHand.THUMB_PHALANX_TIP];
    const fingerTip = joints[fingerId];
    const distance = fingerTip.position.distanceTo(thumbTip.position);
    return distance < 0.015;
  },
});
