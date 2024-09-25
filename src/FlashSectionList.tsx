import { FlashList, ListRenderItem } from "@shopify/flash-list";
import React from "react";
import { SectionBase, SectionListData, View } from "react-native";

interface SeparatorProps<ItemT, SectionT> {
  index: number;
  leadingItem: DataItem<ItemT, SectionT>;
  trailingItem: DataItem<ItemT, SectionT>;
}

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
  SectionSeparatorComponent?:
    | ((props: SeparatorProps<ItemT, SectionT>) => React.ReactElement)
    | null
    | undefined;
  ItemSeparatorComponent?:
    | ((props: SeparatorProps<ItemT, SectionT>) => React.ReactElement)
    | null
    | undefined;
  stickySectionHeadersEnabled?: boolean;
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

  const stickyHeaderIndices = props.stickySectionHeadersEnabled
    ? data
        .map((item, index) => {
          if (item.type === "sectionHeader") {
            return index;
          } else {
            return null;
          }
        })
        .filter((item) => item !== null)
    : [];

  const separator = (index: number, isSection: boolean) => {
    if (!data || index + 1 >= data.length) {
      return null;
    }

    const leadingItem = data[index];
    const trailingItem = data[index + 1];

    const separatorProps = {
      index,
      leadingItem,
      trailingItem,
    };

    const Separator = isSection
      ? props.SectionSeparatorComponent
      : props.ItemSeparatorComponent;
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
        <>
          {props.inverted ? separator(info.index, true) : null}
          {props.renderSectionHeader?.({ section: info.item.section }) || null}
          {props.inverted ? null : separator(info.index, true)}
        </>
      );
    } else {
      return (
        <>
          {props.inverted ? separator(info.index, false) : null}
          <View
            style={{
              flexDirection:
                props.horizontal || props.numColumns === 1 ? "column" : "row",
            }}
          >
            {props.renderItem?.({ item: info.item.item } as any)}
          </View>
          {props.inverted ? null : separator(info.index, false)}
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
