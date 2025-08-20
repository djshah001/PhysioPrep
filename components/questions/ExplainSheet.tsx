import React, { forwardRef, Ref, RefObject, useImperativeHandle, useRef, useState } from 'react';
import { View, Text, useWindowDimensions, ScrollView } from 'react-native';
import ActionSheet, { ActionSheetRef } from 'react-native-actions-sheet';
import RenderHTML from 'react-native-render-html';
import { Button } from 'components/ui/button';
import { customHTMLElementModels, tagsStyles, renderers } from 'lib/HtmlRenderers';

type Props = {
  title?: string;
  html?: string;
  sheetRef?: RefObject<ActionSheetRef>;
};

const ExplainSheet = forwardRef<Props>(({ title = 'Explanation', html = '', sheetRef }: Props) => {
  const { width } = useWindowDimensions();
  console.log(sheetRef);

  return (
    <ActionSheet
      ref={sheetRef}
      snapPoints={[50, 90]}
      gestureEnabled
      initialSnapIndex={1}
      containerStyle={{
        borderRadius: 16,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
      }}>
      <View className="px-4 pb-2 pt-3">
        {/* Handle: uncomment if you want a visual grabber */}
        {/* <View className="mx-auto mb-3 h-1 w-10 rounded-full bg-neutral-300" /> */}
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="text-lg font-bold text-neutral-900">{title}</Text>
          <Button title="Close" onPress={() => sheetRef?.current?.hide()} />
        </View>
      </View>
      <ScrollView contentContainerClassName="px-4 pb-6">
        <RenderHTML
          contentWidth={Math.max(320, width - 48)}
          source={{ html: html as string }}
          customHTMLElementModels={customHTMLElementModels}
          tagsStyles={tagsStyles}
          systemFonts={['System']}
          enableExperimentalMarginCollapsing
          defaultTextProps={{ selectable: false }}
          renderers={renderers}
          renderersProps={{
            img: { enableExperimentalPercentWidth: true },
            table: {
              tableStyleSpecs: {
                outerBorderWidthPx: 1,
                rowsBorderWidthPx: 1,
                columnsBorderWidthPx: 1,
                borderColor: '#e5e7eb',
                cellPaddingEm: 0.5,
                linkColor: '#3b82f6',
              },
            },
          }}
        />
      </ScrollView>
      <View className="mb-40"/>
    </ActionSheet>
  );
});

export default ExplainSheet;
