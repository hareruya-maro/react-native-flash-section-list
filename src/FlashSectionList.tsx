import { FlashList, ListRenderItem } from "@shopify/flash-list";
import React from "react";
import { SectionBase, SectionListData, View } from "react-native";

type DataItem<ItemT, SectionT> =
  | {
      type: "sectionHeader";
      section: SectionT;
    }
  | { type: "row"; item: ItemT };

interface FlashSectionListProps<
  ItemT,
  SectionT extends SectionBase<ItemT, SectionT>
> extends Omit<
    React.ComponentProps<typeof FlashList>,
    "data" | "renderItem" | "keyExtractor"
  > {
  sections: SectionT[];
  renderItem: ListRenderItem<ItemT> | null | undefined;
  keyExtractor?: (item: DataItem<ItemT, SectionT>, index: number) => string;
  renderSectionFooter?:
    | ((info: {
        section: SectionListData<ItemT, SectionT>;
      }) => React.ReactElement | null)
    | undefined;
  renderSectionHeader?:
    | ((info: {
        section: SectionListData<ItemT, SectionT>;
      }) => React.ReactElement | null)
    | undefined;
  SectionSeparatorComponent?: React.ComponentType<any> | null | undefined;
  ItemSeparatorComponent?: React.ComponentType<any> | null | undefined;
  stickySectionHeadersEnabled?: boolean;
  estimatedItemSize?: number;
}

export function FlashSectionList<
  ItemT,
  SectionT extends SectionBase<ItemT, SectionT>
>(props: FlashSectionListProps<ItemT, SectionT>) {
  const data = props.sections
    .map((section) => {
      return [
        { type: "sectionHeader", section },
        ...section.data.map((item) => ({ type: "row", item })),
      ];
    })
    .flat() as DataItem<ItemT, SectionT>[];

  const stickyHeaderIndices = data
    .map((item, index) => {
      if (item.type === "sectionHeader") {
        return index;
      } else {
        return null;
      }
    })
    .filter((item) => item !== null) as number[];

  const separator = (index: number) => {
    // Make sure we have data and don't read out of bounds
    if (
      !data ||
      index + 1 >= data.length ||
      stickyHeaderIndices.includes(index) ||
      stickyHeaderIndices.includes(index + 1)
    ) {
      return null;
    }

    const leadingItem = data[index];
    const trailingItem = data[index + 1];

    const separatorProps = {
      leadingItem,
      trailingItem,
    };
    const Separator = props.ItemSeparatorComponent;
    return Separator && <Separator {...separatorProps} />;
  };

  const renderItem:
    | ListRenderItem<DataItem<ItemT, SectionT>>
    | null
    | undefined = (info: {
    item: DataItem<ItemT, SectionT>;
    index: number;
  }) => {
    if (info.item.type === "sectionHeader") {
      return (
        props.renderSectionHeader?.({ section: info.item.section }) || null
      );
    } else {
      return (
        <>
          {props.inverted ? separator(info.index) : null}
          <View
            style={{
              flexDirection:
                props.horizontal || props.numColumns === 1 ? "column" : "row",
            }}
          >
            {props.renderItem?.({ item: info.item.item } as any)}
          </View>
          {props.inverted ? null : separator(info.index)}
        </>
      );
    }
  };

  const overrideItemLayout: (
    layout: {
      span?: number;
      size?: number;
    },
    item: DataItem<ItemT, SectionT>,
    index: number,
    maxColumns: number,
    extraData?: any
  ) => void = (layout, item, index, maxColumns, extraData) => {
    props.overrideItemLayout?.(layout, item, index, maxColumns, extraData);
    if (item.type === "sectionHeader") {
      layout.span = maxColumns;
    } else {
      layout.span = 1;
    }
  };

  return (
    <FlashList
      {...props}
      ItemSeparatorComponent={null}
      data={data as DataItem<ItemT, SectionT>[]}
      renderItem={renderItem}
      stickyHeaderIndices={stickyHeaderIndices}
      getItemType={(item) => item.type}
      overrideItemLayout={overrideItemLayout}
    />
  );
}
