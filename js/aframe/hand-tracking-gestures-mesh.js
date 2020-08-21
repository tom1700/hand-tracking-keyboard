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
          this.neighbourFingersTouchCheck(directTouchCheckResult),
        () => this.directFingersTouchCheck()
      )();

      const state = {
        hand: this.handTracking.data.hand,
        fingersState,
      };

      this.el.emit("touchState", state);
    }
  },

  directFingersTouchCheck() {
    const isIndexTouching = this.directFingerTouchCheck(
      XRHand.INDEX_PHALANX_TIP
    );
    const isMiddleTouching = this.directFingerTouchCheck(
      XRHand.MIDDLE_PHALANX_TIP
    );
    const isRingTouching = this.directFingerTouchCheck(XRHand.RING_PHALANX_TIP);
    const isLittleTouching = this.directFingerTouchCheck(
      XRHand.LITTLE_PHALANX_TIP
    );

    return {
      1: isIndexTouching ? 1 : 0,
      2: isMiddleTouching ? 1 : 0,
      3: isRingTouching ? 1 : 0,
      4: isLittleTouching ? 1 : 0,
    };
  },

  directFingerTouchCheck(fingerId) {
    const joints = this.handTracking.getJoints();
    const thumbTip = joints[XRHand.THUMB_PHALANX_TIP];
    const fingerTip = joints[fingerId];
    const distance = fingerTip.position.distanceTo(thumbTip.position);
    return distance < MAX_TIP_DISTANCE;
  },

  // It's tough to connect few tips at the same time, so I'm checking the touching neighbours
  neighbourFingersTouchCheck(directTouchCheckResult) {
    if (directTouchCheckResult[1]) {
      if (
        this.neighbourFingerTouchCheck(
          XRHand.INDEX_PHALANX_DISTAL,
          XRHand.MIDDLE_PHALANX_DISTAL
        )
      ) {
        directTouchCheckResult[2] = 1;
      }
    }
    if (directTouchCheckResult[2]) {
      if (
        this.neighbourFingerTouchCheck(
          XRHand.INDEX_PHALANX_DISTAL,
          XRHand.MIDDLE_PHALANX_DISTAL
        )
      ) {
        directTouchCheckResult[1] = 1;
      }
      if (
        this.neighbourFingerTouchCheck(
          XRHand.MIDDLE_PHALANX_DISTAL,
          XRHand.RING_PHALANX_DISTAL
        )
      ) {
        directTouchCheckResult[3] = 1;
      }
    }
    if (directTouchCheckResult[3]) {
      if (
        this.neighbourFingerTouchCheck(
          XRHand.MIDDLE_PHALANX_DISTAL,
          XRHand.RING_PHALANX_DISTAL
        )
      ) {
        directTouchCheckResult[2] = 1;
      }
      if (
        this.neighbourFingerTouchCheck(
          XRHand.RING_PHALANX_DISTAL,
          XRHand.LITTLE_PHALANX_DISTAL
        )
      ) {
        directTouchCheckResult[4] = 1;
      }
    }
    if (directTouchCheckResult[4]) {
      if (
        this.neighbourFingerTouchCheck(
          XRHand.RING_PHALANX_DISTAL,
          XRHand.LITTLE_PHALANX_DISTAL
        )
      ) {
        directTouchCheckResult[3] = 1;
      }
    }

    return directTouchCheckResult;
  },

  neighbourFingerTouchCheck(finger1, finger2) {
    const joints = this.handTracking.getJoints();
    const finger1Distal = joints[finger1];
    const finger2Distal = joints[finger2];
    const distance = finger1Distal.position.distanceTo(finger2Distal.position);
    return distance < MAX_PHALANCE_DISTANCE;
  },
});
