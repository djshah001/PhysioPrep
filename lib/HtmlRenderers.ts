import React from 'react';
import { ScrollView, View, Pressable, Linking } from 'react-native';
import { HTMLContentModel, HTMLElementModel } from 'react-native-render-html';
import { Image as ExpoImage } from 'expo-image';

export const customHTMLElementModels = {
  iframe: HTMLElementModel.fromCustomModel({
    tagName: 'iframe',
    contentModel: HTMLContentModel.block,
  }),
  table: HTMLElementModel.fromCustomModel({
    tagName: 'table',
    contentModel: HTMLContentModel.block,
  }),
  colgroup: HTMLElementModel.fromCustomModel({
    tagName: 'colgroup',
    contentModel: HTMLContentModel.block,
  }),
  col: HTMLElementModel.fromCustomModel({
    tagName: 'col',
    contentModel: HTMLContentModel.block,
  }),
  tbody: HTMLElementModel.fromCustomModel({
    tagName: 'tbody',
    contentModel: HTMLContentModel.block,
  }),
  thead: HTMLElementModel.fromCustomModel({
    tagName: 'thead',
    contentModel: HTMLContentModel.block,
  }),
  video: HTMLElementModel.fromCustomModel({
    tagName: 'video',
    contentModel: HTMLContentModel.block,
  }),
  audio: HTMLElementModel.fromCustomModel({
    tagName: 'audio',
    contentModel: HTMLContentModel.block,
  }),
};

// Enhanced styling for HTML elements
export const tagsStyles = {
  // Table styling
  table: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    marginVertical: 10,
    overflow: 'hidden', // RN supports 'hidden' | 'visible'
    width: '100%',
  },
  thead: {
    backgroundColor: '#f3f4f6',
  },
  tbody: {
    backgroundColor: '#ffffff',
  },
  th: {
    borderColor: '#e5e7eb',
    padding: 6,
    fontWeight: 'bold',
    textAlign: 'left',
    color: '#111827',
  },
  td: {
    borderColor: '#e5e7eb',
    padding: 6,
    textAlign: 'left',
  },
  tr: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
  },
  // Hide colgroup and col elements since they're not needed for styling
  colgroup: {
    display: 'none',
  },
  col: {
    display: 'none',
  },
  // Image styling
  img: {
    borderRadius: 8,
    marginVertical: 10,
  },
  // Text styling
  strong: {
    fontWeight: 'bold',
    color: '#111827',
  },
  em: {
    fontStyle: 'italic',
  },
  u: {
    textDecorationLine: 'underline',
  },
  s: {
    textDecorationLine: 'line-through',
  },
  p: {
    marginBottom: 8,
    lineHeight: 24,
    color: '#111827',
    fontSize: 16,
  },
  h1: {
    fontSize: 28,
    fontWeight: 'bold',
    marginVertical: 16,
    color: '#111827',
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 14,
    color: '#111827',
  },
  h3: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 12,
    color: '#111827',
  },
  a: {
    color: '#2563eb',
    textDecorationLine: 'underline',
  },
  ul: {
    marginVertical: 8,
    paddingLeft: 20,
  },
  ol: {
    marginVertical: 8,
    paddingLeft: 20,
  },
  code: {
    backgroundColor: '#f3f4f6',
    padding: 8,
    borderRadius: 8,
    fontFamily: 'monospace',
  },
  pre: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  blockquote: {
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
    paddingLeft: 12,
    marginVertical: 8,
    fontStyle: 'italic',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.2,
  },
} as const;
// Custom renderers for complex elements
// - table: wrap in horizontal ScrollView so wide tables can be scrolled on mobile
// - tr: ensure row flex direction
// - a: open links using Linking

export const renderers = {
  table: ({ TDefaultRenderer, ...props }: any) =>
    React.createElement(
      ScrollView,
      { horizontal: true, showsHorizontalScrollIndicator: true, style: { marginVertical: 10 } },
      React.createElement(View, null, React.createElement(TDefaultRenderer, props))
    ),
  td: ({ TDefaultRenderer, ...props }: any) => {
    return React.createElement(
      View,
      {
        style: {
          flex: 1,
          width: 250,
          minHeight: 150,
          backgroundColor: '#ffffff',
          padding: 10,
          alignItems: 'center',
          borderWidth: 1,
          borderColor: '#e5e7eb',
        },
      },
      React.createElement(TDefaultRenderer, props)
    );
  },
  th: ({ TDefaultRenderer, ...props }: any) => {
    return React.createElement(
      View,
      {
        style: {
          flex: 1,
          width: 250,
          borderWidth: 1,
          borderColor: '#e5e7eb',
          backgroundColor: '#f3f4f6',
          padding: 0,
          alignItems: 'center',
        },
      },
      React.createElement(TDefaultRenderer, props)
    );
  },
  tr: ({ TDefaultRenderer, ...props }: any) => {
    return React.createElement(
      View,
      {
        style: {
          flexDirection: 'row',
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ffffff',
          borderRadius: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 3.2,
        },
      },
      React.createElement(TDefaultRenderer, props)
    );
  },
  a: ({ tnode, key, TDefaultRenderer, ...props }: any) => {
    const href = tnode?.attributes?.href as string | undefined;
    const onPress = () => {
      if (href) Linking.openURL(href).catch(() => {});
    };
    return React.createElement(
      Pressable,
      { key, onPress, accessibilityRole: 'link' },
      React.createElement(TDefaultRenderer, props)
    );
  },
  img: ({ tnode, ...props }: any) => {
    const src = tnode?.attributes?.src;
    const width = tnode?.attributes?.width;
    // const height = tnode?.attributes?.height;
    if (!src) return null;
    return React.createElement(ExpoImage, {
      source: src,
      style: { width: width, height: 300, borderRadius: 8, marginVertical: 10 },
      contentFit: 'contain',
      accessibilityLabel: tnode?.attributes?.alt || 'Image',
      placeholder:"|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj["
      // ...props,
    });
  },
} as const;
