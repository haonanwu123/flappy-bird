import React from "react";
import { Canvas, useImage, Image } from "@shopify/react-native-skia";
import { useWindowDimensions } from "react-native";

const App = () => {
  const { width, height } = useWindowDimensions();
  const bg = useImage(require("./assets/sprites/background-day.png"));
  const bird = useImage(require("./assets/sprites/yellowbird-upflap.png"));
  const pipe = useImage(require("./assets/sprites/pipe-green.png"));

  return (
    <Canvas style={{ width, height }}>
      <Image image={bg} width={width} height={height} fit={"cover"}></Image>
      <Image image={pipe} y={height - 320} x={width / 2} width={103} height={640}></Image>
      <Image image={pipe} y={-320} x={width / 2} width={103} height={640}></Image>
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
