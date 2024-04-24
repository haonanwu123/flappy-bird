import React from "react";
import { useEffect } from "react";
import { Canvas, useImage, Image } from "@shopify/react-native-skia";
import { useWindowDimensions } from "react-native";
import {
  useSharedValue,
  withTiming,
  Easing,
  withSequence,
  withRepeat,
} from "react-native-reanimated";

const App = () => {
  const { width, height } = useWindowDimensions();
  const bg = useImage(require("./assets/sprites/background-day.png"));
  const base = useImage(require("./assets/sprites/base.png"));
  const bird = useImage(require("./assets/sprites/yellowbird-upflap.png"));
  const pipeTop = useImage(require("./assets/sprites/pipe-green-top.png"));
  const pipeBottom = useImage(
    require("./assets/sprites/pipe-green-bottom.png")
  );

  const x = useSharedValue(width);

  useEffect(() => {
    x.value = withRepeat(
      withSequence(
        withTiming(-150, { duration: 3000, easing: Easing.linear }),
        withTiming(width, { duration: 0 })
      ),
      -1
    );
  }, []);

  const pipeOffset = 0;

  return (
    <Canvas style={{ width, height }}>
      {/*  Draw background image*/}
      <Image image={bg} width={width} height={height} fit={"cover"}></Image>

      {/* Draw pipeTop image */}
      <Image
        image={pipeTop}
        y={pipeOffset - 320}
        x={x}
        width={103}
        height={640}
      ></Image>

      {/* draw pipeBottom image */}
      <Image
        image={pipeBottom}
        y={height - 320}
        x={x}
        width={103}
        height={640}
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

      {/* Draw bird image */}
      <Image
        image={bird}
        height={64}
        width={48}
        y={height / 2}
        x={width / 4}
      ></Image>
    </Canvas>
  );
};
export default App;
