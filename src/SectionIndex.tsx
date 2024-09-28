import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  LayoutChangeEvent,
  PanResponder,
  StyleSheet,
  Text,
  TextStyle,
  useWindowDimensions,
  View,
  ViewStyle,
} from "react-native";

export interface SectionIndexData {
  char: string;
  actualIndex: number;
}

interface SectionIndexProps {
  dark?: boolean;
  barContainerStyle?: ViewStyle;
  barStyle?: ViewStyle;
  textStyle?: TextStyle;
  data: SectionIndexData[];
  fontSize?: number;
  getLabel?: (data: SectionIndexData) => string;
  onPressIndex?: (data: SectionIndexData, index: number) => void;
}

export default function SectionIndex({
  dark = false,
  barContainerStyle = {},
  barStyle = {},
  textStyle = {},
  data,
  fontSize: propFontSize = 10,
  getLabel = (data) => data.char.substring(0, 1),
  onPressIndex = (_d, _i) => {},
}: SectionIndexProps) {
  const { fontScale } = useWindowDimensions();
  const fontSize = Math.ceil(propFontSize * fontScale);
  const styles = makeStyles(dark, fontSize);
  const indexRef = useRef(0);
  const [barYPos, setBarYPos] = useState(0);
  const [barHeight, setBarHeight] = useState(0);
  const [indexData, setIndexData] = useState<SectionIndexData[]>([]);
  const [visibleCharCount, setVisibleCharCount] = useState(0);

  useEffect(() => {
    if (visibleCharCount === 0) {
      return;
    }
    if (data.length <= visibleCharCount) {
      setIndexData(data);
      return;
    }

    const ellipsisVisibleCharCount = Math.round(visibleCharCount / 2);
    let ellipsisCount = 2;
    let ellipsisList = data.filter((_, i) => i % ellipsisCount === 0);
    while (
      ellipsisList.length != 0 &&
      ellipsisList.length > ellipsisVisibleCharCount
    ) {
      ellipsisCount++;
      ellipsisList = data.filter((_, i) => i % ellipsisCount === 0);
    }
    ellipsisList[ellipsisList.length - 1] = data[data.length - 1];

    setIndexData(
      ellipsisList
        .map((d) => [d, { char: "・", actualIndex: -1 }])
        .flat()
        .slice(0, -1)
    );
  }, [data, visibleCharCount]);

  const onBarVisibleAreaLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const { height } = e.nativeEvent.layout;
      const visibleCharCount = Math.floor(height / fontSize);
      setVisibleCharCount(visibleCharCount);
    },
    [propFontSize, fontScale]
  );

  const onLayout = useCallback(
    (e: LayoutChangeEvent) => {
      e.target.measure((_x, _y, _width, height, _pageX, pageY) => {
        setBarYPos(pageY + 8);
        const visibleHeight = height - 16;
        setBarHeight(visibleHeight);
      });
    },
    [setBarYPos, setBarHeight]
  );

  const onPress = useCallback(
    (data: SectionIndexData[], pageY: number) => {
      const y = pageY - barYPos;
      if (y < 0 || barHeight < y) {
        return;
      }
      let index = Math.round((y / barHeight) * (data.length - 1));
      index = index < 0 ? 0 : data.length <= index ? data.length - 1 : index;

      if (indexRef.current === index) {
        return;
      }
      indexRef.current = index;
      onPressIndex(data[index], index);
    },
    [onPressIndex, barYPos, barHeight]
  );

  // タップイベント
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (e) => {
      onPress(data, e.nativeEvent.pageY);
    },
    onPanResponderMove: (e) => {
      onPress(data, e.nativeEvent.pageY);
    },
  });

  return (
    <View style={styles.sectionIndexContainer}>
      <View
        style={[styles.barVisibleArea, barContainerStyle]}
        onLayout={onBarVisibleAreaLayout}
      >
        <View
          style={[{ opacity: 1 }, styles.bar, barStyle]}
          onLayout={onLayout}
        >
          <View style={styles.touchArea} {...panResponder.panHandlers}>
            {indexData.map((v, i) => (
              <Text key={i} style={[styles.text, textStyle]}>
                {getLabel(v)}
              </Text>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const makeStyles = (dark: boolean, fontSize: number) =>
  StyleSheet.create({
    sectionIndexContainer: {
      right: 0,
      width: fontSize + 10,
      marginLeft: -(fontSize + 10),
      height: "100%",
      justifyContent: "center",
    },
    barVisibleArea: {
      height: "95%",
      justifyContent: "center",
    },
    bar: {
      maxHeight: "100%",
      overflow: "hidden",
      paddingVertical: 8,
    },
    touchArea: {
      justifyContent: "space-between",
      paddingHorizontal: 4,
      width: "100%",
    },
    text: {
      color: dark ? "#ffffffee" : "#111",
      fontSize,
      height: fontSize,
      lineHeight: fontSize,
      textAlign: "center",
      overflow: "visible",
    },
  });
