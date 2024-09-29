# react-native-flash-section-list

![npm version](https://img.shields.io/npm/v/react-native-flash-section-list.svg?colorB=brightgreen&style=flat-square)
![npm download](https://img.shields.io/npm/dt/react-native-flash-section-list.svg?style=flat-square)

SectionList for React Native using FlashList

## Getting Started

This library export one components - SectionFlashList (similar to SectionList).

Internally, these components use the [FlashList](https://shopify.github.io/flash-list/) from shopify.

### Installing

You can install the package via npm.

```
npm install react-native-flash-section-list
```

### Usage

You can use it like React Native's SectionList.

```ts
import { FlashSectionList } from "react-native-flash-section-list";
import React from "react";
import { SafeAreaView, StatusBar, StyleSheet, Text, View } from "react-native";

const DATA = [
  {
    title: "Main dishes",
    data: ["Pizza", "Burger", "Risotto"],
  },
  {
    title: "Sides",
    data: ["French Fries", "Onion Rings", "Fried Shrimps"],
  },
  {
    title: "Drinks",
    data: ["Water", "Coke", "Beer"],
  },
  {
    title: "Desserts",
    data: ["Cheese Cake", "Ice Cream"],
  },
];

const App = () => (
  <SafeAreaView style={styles.container}>
    <FlashSectionList
      sections={DATA}
      keyExtractor={(item, index) => {
        if (item.type === "sectionHeader") {
          return item.section.title;
        } else {
          return item.item + index;
        }
      }}
      renderItem={({ item }: { item: string }) => (
        <View style={styles.item}>
          <Text style={styles.title}>{item}</Text>
        </View>
      )}
      renderSectionHeader={({ section: { title } }) => (
        <Text style={styles.header}>{title}</Text>
      )}
    />
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
    marginHorizontal: 16,
  },
  item: {
    backgroundColor: "#f9c2ff",
    padding: 20,
    marginVertical: 8,
  },
  header: {
    fontSize: 32,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
  },
});

export default App;
```

#### Properties

<!--| Property | Type | Default Value | Description |
|---|---|---|---|
| renderItem | Function |  | Function to render each object. Should return a react native component.  |
| sections  | Array |  | Items to be rendered. renderItem will be called with each item in this array.  |  |
| style | [FlatList](https://facebook.github.io/react-native/docs/flatlist.html) styles (Object) |  | Styles for the container. Styles for an item should be applied inside ```renderItem```. |
| itemContainerStyle | styles (Object) | | Style for the view child of the row

Note: If you want your item to fill the height when using a horizontal grid, you should give it a height of '100%'
-->

Sorry, Editing in progress.

<!-- ## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.-->

## Changelog

### [0.1.8] - 2024-09-29

- Fixed a crash that occurred when not using SectionIndex.

### [0.1.7] - 2024-09-27

- Adjust Style Props for Improved Android Performance.

### [0.1.6] - 2024-09-27

- Add Section Index style props.
- fixed bugs.

### [0.1.5] - 2024-09-27

- Add Section Index Component.

### [0.1.4] - 2024-09-24

- Released the library.
