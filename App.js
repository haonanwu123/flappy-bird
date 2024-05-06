import { useEffect, useState } from "react";
import {
  Canvas,
  useImage,
  Image,
  Group,
  Text,
  matchFont,
  Circle,
  Rect,
} from "@shopify/react-native-skia";
import { Platform, useWindowDimensions } from "react-native";
import {
  useSharedValue,
  withTiming,
  Easing,
  withSequence,
  withRepeat,
  useFrameCallback,
  useDerivedValue,
  useAnimatedReaction,
  interpolate,
  Extrapolation,
  runOnJS,
  cancelAnimation,
} from "react-native-reanimated";
import {
  GestureHandlerRootView,
  GestureDetector,
  Gesture,
} from "react-native-gesture-handler";

const GRAVITY = 1000; // px per second ^2
const GUMP_FORCE = -500;

const pipeWidth = 104;
const pipHeight = 640;

const App = () => {
  const { width, height } = useWindowDimensions();
  const [score, setScore] = useState(0);

  const bg = useImage(require("./assets/sprites/background-day.png"));
  const base = useImage(require("./assets/sprites/base.png"));
  const bird = useImage(require("./assets/sprites/yellowbird-upflap.png"));
  const pipeTop = useImage(require("./assets/sprites/pipe-green-top.png"));
  const pipeBottom = useImage(
    require("./assets/sprites/pipe-green-bottom.png")
  );

  const gameOver = useSharedValue(false);
  const x = useSharedValue(width);

  const birdY = useSharedValue(height / 3);
  const birdPos = {
    x: width / 4,
  };
  const birdYVelocity = useSharedValue(0);

  const birdCenterX = useDerivedValue(() => birdPos.x + 32);
  const birdCenterY = useDerivedValue(() => birdY.value + 24);

  useEffect(() => {
    x.value = withRepeat(
      withSequence(
        withTiming(-150, { duration: 3000, easing: Easing.linear }),
        withTiming(width, { duration: 0 })
      ),
      -1
    );
  }, []);

  // useAnimatedReaction(
  //   () => {
  //     return x.value;
  //   },
  //   (currentValue, previousValue) => {
  //     if (currentValue !== previousValue) {
  //       console.log('the map move to: ', currentValue);
  //     }
  //   }
  // ); // get the x current value from the map

  useEffect(() => {
    moveTheMap();
  }, []);

  const moveTheMap = () => {
    x.value = withRepeat(
      withSequence(
        withTiming(-150, { duration: 3000, easing: Easing.linear }),
        withTiming(width, { duration: 0 })
      ),
      -1
    );
  };

  // Scoring system
  useAnimatedReaction(
    () => x.value,
    (currentValue, previousValue) => {
      const middle = birdPos.x;

      if (
        currentValue !== previousValue &&
        currentValue <= middle &&
        previousValue !== null &&
        previousValue > middle
      ) {
        runOnJS(setScore)(score + 1);
      }
    }
  );

  // Collision detection
  useAnimatedReaction(
    () => birdY.value,
    (currentValue, previousValue) => {
      // Ground collision detection
      if (
        (previousValue !== null && previousValue > height) ||
        currentValue < 0
      ) {
        gameOver.value = true;
      }
      // Bottom pipe
      if (
        birdCenterX.value >= x.value &&
        birdCenterX.value <= x.value + pipeWidth &&
        birdCenterY.value >= height - 320 + pipeOffset &&
        birdCenterY.value <= height - 320 + pipeOffset + pipHeight
      ) {
        gameOver.value = true;
      }

      if (birdPos.x >= x.value) {
        gameOver.value = true;
      }
    }
  );

  useAnimatedReaction(
    () => gameOver.value,
    (currentValue, previousValue) => {
      if (currentValue && !previousValue) {
        cancelAnimation(x);
      }
    }
  );

  // get the timeSincePreviousFrame value
  // useFrameCallback((inf) => {
  //   console.log(inf);
  // })

  useFrameCallback(({ timeSincePreviousFrame: dt }) => {
    if (!dt || gameOver.value) {
      return;
    }
    birdY.value = birdY.value + (birdYVelocity.value * dt) / 1000;
    birdYVelocity.value = birdYVelocity.value + (GRAVITY * dt) / 1000;
  });

  const restartGame = () => {
    "worklet";
    birdY.value = height / 3;
    birdYVelocity.value = 0;
    gameOver.value = false;
    x.value = width;
    runOnJS(moveTheMap)();
    runOnJS(setScore)(0);
  };

  const gesture = Gesture.Tap().onStart(() => {
    if (gameOver.value) {
      //restart
      restartGame();
    } else {
      //jump
      birdYVelocity.value = GUMP_FORCE;
    }
  });

  const birdTransform = useDerivedValue(() => {
    return [
      {
        rotate: interpolate(
          birdYVelocity.value,
          [-500, 500],
          [-0.5, 0.5],
          Extrapolation.CLAMP
        ),
      },
    ];
  });
  const birdOrigin = useDerivedValue(() => {
    return { x: width / 4 + 32, y: birdY.value + 24 };
  });

  const pipeOffset = 0;

  const fontFamily = Platform.select({ ios: "Helvetica", default: "self" });
  const fontStyle = {
    fontFamily,
    fontSize: 40,
    fontWeight: "bold",
  };
  // @ts-ignore
  const font = matchFont(fontStyle);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={gesture}>
        <Canvas style={{ width, height }}>
          {/*  Draw background image*/}
          <Image image={bg} width={width} height={height} fit={"cover"}></Image>

          {/* Draw pipeTop image */}
          <Image
            image={pipeTop}
            y={pipeOffset - 320}
            x={x}
            width={pipeWidth}
            height={pipHeight}
          ></Image>

          {/* draw pipeBottom image */}
          <Image
            image={pipeBottom}
            y={height - 320}
            x={x}
            width={pipeWidth}
            height={pipHeight}
          ></Image>

          {/* Draw base image */}
          <Image
            image={base}
            width={width}
            height={150}
            y={height - 75}
            x={0}
            fit={"cover"}
          ></Image>

          <Group transform={birdTransform} origin={birdOrigin}>
            {/* Draw bird image */}
            {/* <Image
              image={bird}
              height={64}
              width={48}
              y={birdY}
              x={birdPos.x}
            ></Image> */}
          </Group>

          {/* Sim */}
          <Circle cy={birdCenterY} cx={birdCenterX} r={15} color={"red"} />
          {/* <Rect x={0} y={0} width={256} height={256} color={"lightblue"} /> */}

          {/* Score */}
          <Text
            x={width / 2 - 30}
            y={100}
            text={score.toString()}
            font={font}
          />
        </Canvas>
      </GestureDetector>
    </GestureHandlerRootView>
  );
};
export default App;
