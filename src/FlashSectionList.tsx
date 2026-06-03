import {
  FlashList,
  FlashListRef,
  ListRenderItem,
  RenderTarget,
} from "@shopify/flash-list";
import React from "react";
import {
  SectionBase,
  SectionListData,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import SectionIndex, { SectionIndexData } from "./SectionIndex";

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
  | {
      type: "sectionFooter";
      section: SectionT;
    }
  | { type: "row"; item: ItemT };

interface FlashSectionListProps<
  ItemT,
  SectionT extends SectionBase<ItemT, SectionT>,
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
        extraData?: any;
      }) => React.ReactElement | null)
    | undefined;
  renderSectionHeader?:
    | ((info: {
        section: SectionListData<ItemT, SectionT>;
        extraData?: any;
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
  sectionIndexOptions?: {
    sectionIndexLabelsKey: keyof SectionT;
    getLabel?: (data: SectionIndexData, list?: SectionIndexData[]) => string;
    onSectionIndexPress?: (index: number) => void;
    dark?: boolean;
    barContainerStyle?: ViewStyle;
    barStyle?: ViewStyle;
    textStyle?: TextStyle;
  };
}

export function FlashSectionList<
  ItemT,
  SectionT extends SectionBase<ItemT, SectionT>,
>(props: FlashSectionListProps<ItemT, SectionT>) {
  const ref = React.useRef<FlashListRef<DataItem<ItemT, SectionT>>>(null);

  const data = props.sections
    .map((section) => {
      return [
        { type: "sectionHeader", section, extraData: props.extraData },
        ...section.data.map((item, index) => ({
          type: "row",
          item,
          index,
          extraData: props.extraData,
        })),
        { type: "sectionFooter", section, extraData: props.extraData },
      ];
    })
    .flat() as DataItem<ItemT, SectionT>[];

  const stickyHeaderIndices: number[] = [];
  const sectionLabels: SectionIndexData[] = [];

  data.forEach((item, index) => {
    if (item.type !== "sectionHeader") {
      return;
    }
    sectionLabels.push({
      char: (item.section as any)[
        props.sectionIndexOptions?.sectionIndexLabelsKey
      ] as string,
      actualIndex: index,
    });
    if (props.stickySectionHeadersEnabled !== false) {
      stickyHeaderIndices.push(index);
    }
  });
  const renderItem:
    | ListRenderItem<DataItem<ItemT, SectionT>>
    | null
    | undefined = (info: {
    item: DataItem<ItemT, SectionT>;
    index: number;
    target: RenderTarget;
    extraData?: any;
  }) => {
    const nextItem = data[info.index + 1];
    const separatorProps = {
      index: info.index,
      leadingItem: info.item,
      trailingItem: nextItem,
    };

    const renderSeparator = () => {
      if (!nextItem) return null;

      if (info.item.type === "row" && nextItem.type === "row") {
        return (
          props.ItemSeparatorComponent && (
            <props.ItemSeparatorComponent {...separatorProps} />
          )
        );
      }

      if (info.item.type === "sectionFooter" || info.item.type === "row") {
        if (nextItem.type === "sectionHeader") {
          return (
            props.SectionSeparatorComponent && (
              <props.SectionSeparatorComponent {...separatorProps} />
            )
          );
        }
      }

      return null;
    };

    if (info.item.type === "sectionHeader") {
      return (
        <View
          style={{
            flexDirection: props.horizontal ? "column" : "row",
          }}
        >
          {props.renderSectionHeader?.({
            section: info.item.section,
            extraData: info.extraData,
          }) || null}
        </View>
      );
    } else if (info.item.type === "sectionFooter") {
      return (
        <>
          <View
            style={{
              flexDirection: props.horizontal ? "column" : "row",
            }}
          >
            {props.renderSectionFooter?.({
              section: info.item.section,
              extraData: info.extraData,
            }) || null}
          </View>
          {renderSeparator()}
        </>
      );
    } else {
      return (
        <>
          <View
            style={{
              flexDirection:
                props.horizontal || props.numColumns === 1 ? "column" : "row",
            }}
          >
            {props.renderItem?.({ item: info.item.item } as any)}
          </View>
          {renderSeparator()}
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
    extraData?: any,
  ) => void = (layout, item, index, maxColumns, extraData) => {
    props.overrideItemLayout?.(layout, item, index, maxColumns, extraData);
    if (item.type === "sectionHeader" || item.type === "sectionFooter") {
      layout.span = maxColumns;
    } else {
      layout.span = 1;
    }
  };

  return (
    <View style={{ flexDirection: "row" }}>
      <FlashList
        {...props}
        ref={ref as any}
        ItemSeparatorComponent={null}
        data={data as DataItem<ItemT, SectionT>[]}
        renderItem={renderItem}
        stickyHeaderIndices={
          props.stickySectionHeadersEnabled !== false ? stickyHeaderIndices : []
        }
        getItemType={(item) => item.type}
        overrideItemLayout={overrideItemLayout}
      />
      {!!props.sectionIndexOptions && (
        <SectionIndex
          data={sectionLabels}
          onPressIndex={(data, index) => {
            ref.current?.scrollToIndex({ index: data.actualIndex });
            props.sectionIndexOptions?.onSectionIndexPress?.(index);
          }}
          {...props.sectionIndexOptions}
        />
      )}
    </View>
  );
}
