import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { useAtom } from 'jotai';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { proFeaturesAtom, proFeaturesByCategoryAtom, ProFeature } from '../../store/pro';
import ProBadge from './ProBadge';

interface ProFeaturesListProps {
  category?: string;
  showCategory?: boolean;
  layout?: 'list' | 'grid';
  showIcons?: boolean;
  animated?: boolean;
  maxItems?: number;
}

const ProFeaturesList: React.FC<ProFeaturesListProps> = ({
  category,
  showCategory = true,
  layout = 'list',
  showIcons = true,
  animated = true,
  maxItems,
}) => {
  const [proFeatures] = useAtom(proFeaturesAtom);
  const [featuresByCategory] = useAtom(proFeaturesByCategoryAtom);

  // Get features to display
  const getFeaturesToDisplay = (): ProFeature[] => {
    let features: ProFeature[] = [];

    if (category) {
      features = featuresByCategory[category] || [];
    } else {
      features = proFeatures;
    }

    if (maxItems) {
      features = features.slice(0, maxItems);
    }

    return features;
  };

  const features = getFeaturesToDisplay();

  // Category display names
  const categoryNames: Record<string, string> = {
    experience: 'Experience',
    learning: 'Learning',
    assessment: 'Assessment',
    support: 'Support',
    analytics: 'Analytics',
    access: 'Access',
  };

  const renderFeatureItem = ({ item, index }: { item: ProFeature; index: number }) => {
    const FeatureItem = () => (
      <View className={`${layout === 'grid' ? 'flex-1 mx-1' : ''} mb-3`}>
        <View className="flex-row items-center p-4 bg-gray-800/50 rounded-xl">
          {showIcons && (
            <View className="w-10 h-10 rounded-full bg-gray-700 items-center justify-center mr-3">
              <Text className="text-lg">{item.icon}</Text>
            </View>
          )}
          <View className="flex-1">
            <View className="flex-row items-center space-x-2 mb-1">
              <Text className="text-white font-semibold flex-1">{item.title}</Text>
              <ProBadge size="small" variant="crown" animated={false} />
            </View>
            <Text className="text-gray-400 text-sm">{item.description}</Text>
            {showCategory && (
              <Text className="text-gray-500 text-xs mt-1 capitalize">
                {categoryNames[item.category] || item.category}
              </Text>
            )}
          </View>
        </View>
      </View>
    );

    if (animated) {
      return (
        <Animated.View
          key={item.id}
          entering={FadeInDown.delay(index * 100)}
        >
          <FeatureItem />
        </Animated.View>
      );
    }

    return <FeatureItem key={item.id} />;
  };

  if (features.length === 0) {
    return (
      <View className="items-center justify-center py-8">
        <Ionicons name="star-outline" size={48} color="#6B7280" />
        <Text className="text-gray-400 text-center mt-2">
          No pro features available
        </Text>
      </View>
    );
  }

  if (layout === 'grid') {
    return (
      <FlatList
        data={features}
        renderItem={renderFeatureItem}
        numColumns={2}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    );
  }

  return (
    <View>
      {features.map((feature, index) => renderFeatureItem({ item: feature, index }))}
    </View>
  );
};

export default ProFeaturesList;
