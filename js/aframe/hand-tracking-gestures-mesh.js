const MAX_TIP_DISTANCE = 0.015;
const MAX_PHALANCE_DISTANCE = 0.02;

AFRAME.registerComponent("hand-tracking-gestures-mesh", {
  dependencies: ["hand-tracking-mesh"],

  init() {
    this.handTracking = this.el.components["hand-tracking-mesh"];
  },

  tick() {
    if (this.handTracking.jointsLoaded() && this.handTracking.mesh != null) {
      const fingersState = compose(
        (arr) => arr.join(""),
        Object.values,
        (directTouchCheckResult) =>
          this.getAllNeighbourFingersTouchStatus(directTouchCheckResult),
        () => this.getAllFingersDirectTouchStatus()
      )();

      const state = {
        hand: this.handTracking.data.hand,
        fingersState,
      };

      this.el.emit("touchState", state);
    }
  },

  getAllFingersDirectTouchStatus() {
    const isIndexTouching = this.doesFingersTouchDirectly(
      XRHand.INDEX_PHALANX_TIP
    );
    const isMiddleTouching = this.doesFingersTouchDirectly(
      XRHand.MIDDLE_PHALANX_TIP
    );
    const isRingTouching = this.doesFingersTouchDirectly(
      XRHand.RING_PHALANX_TIP
    );
    const isLittleTouching = this.doesFingersTouchDirectly(
      XRHand.LITTLE_PHALANX_TIP
    );

    return {
      1: isIndexTouching ? 1 : 0,
      2: isMiddleTouching ? 1 : 0,
      3: isRingTouching ? 1 : 0,
      4: isLittleTouching ? 1 : 0,
    };
  },

  getFingersDirectDistance(fingerId) {
    const joints = this.handTracking.getJoints();
    const thumbTip = joints[XRHand.THUMB_PHALANX_TIP];
    const fingerTip = joints[fingerId];
    return fingerTip.position.distanceTo(thumbTip.position);
  },

  doesFingersTouchDirectly(fingerId) {
    const distance = this.getFingersDirectDistance(fingerId);
    return distance < MAX_TIP_DISTANCE;
  },

  // It's tough to connect few tips at the same time, so I'm checking the touching neighbours
  getAllNeighbourFingersTouchStatus(directTouchCheckResult) {
    if (directTouchCheckResult[1]) {
      if (
        this.doesNeighbourFingersTouch(
          XRHand.INDEX_PHALANX_DISTAL,
          XRHand.MIDDLE_PHALANX_DISTAL
        )
      ) {
        directTouchCheckResult[2] = 1;
      }
    }
    if (directTouchCheckResult[2]) {
      if (
        this.doesNeighbourFingersTouch(
          XRHand.INDEX_PHALANX_DISTAL,
          XRHand.MIDDLE_PHALANX_DISTAL
        )
      ) {
        directTouchCheckResult[1] = 1;
      }
      if (
        this.doesNeighbourFingersTouch(
          XRHand.MIDDLE_PHALANX_DISTAL,
          XRHand.RING_PHALANX_DISTAL
        )
      ) {
        directTouchCheckResult[3] = 1;
      }
    }
    if (directTouchCheckResult[3]) {
      if (
        this.doesNeighbourFingersTouch(
          XRHand.MIDDLE_PHALANX_DISTAL,
          XRHand.RING_PHALANX_DISTAL
        )
      ) {
        directTouchCheckResult[2] = 1;
      }
      if (
        this.doesNeighbourFingersTouch(
          XRHand.RING_PHALANX_DISTAL,
          XRHand.LITTLE_PHALANX_DISTAL
        )
      ) {
        directTouchCheckResult[4] = 1;
      }
    }
    if (directTouchCheckResult[4]) {
      if (
        this.doesNeighbourFingersTouch(
          XRHand.RING_PHALANX_DISTAL,
          XRHand.LITTLE_PHALANX_DISTAL
        )
      ) {
        directTouchCheckResult[3] = 1;
      }
    }

    return directTouchCheckResult;
  },

  getNeighbourFingersDistance(finger1, finger2) {
    const joints = this.handTracking.getJoints();
    const finger1Distal = joints[finger1];
    const finger2Distal = joints[finger2];
    return finger1Distal.position.distanceTo(finger2Distal.position);
  },

  doesNeighbourFingersTouch(finger1, finger2) {
    const distance = this.getNeighbourFingersDistance(finger1, finger2);
    return distance < MAX_PHALANCE_DISTANCE;
  },
});
