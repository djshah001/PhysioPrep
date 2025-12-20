import React, { useEffect} from 'react';
import { View, Text, ActivityIndicator, ScrollView, useWindowDimensions } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp} from 'react-native-reanimated';
import RenderHtml from 'react-native-render-html';
import { useAtom, useSetAtom } from 'jotai';
import colors from 'tailwindcss/colors';

// Store & Hooks
import {
  topicDetailsAtom,
  loadingTopicDetailsAtom,
  errorTopicDetailsAtom,
  fetchTopicDetailsAtom,
} from 'store/subject';
import { loadRewardedAdAtom, rewardedAdLoadedAtom, showRewardedAdAtom } from 'store/rewardedAd';
import { useProAccess } from '~/useProAccess';

// Components & Libs
import { Button } from '~/ui/button';
import { CustomHeader } from 'components/common/CustomHeader';
import { customHTMLElementModels, renderers, tagsStyles } from 'lib/HtmlRenderers';

// --- Helper Components ---

const StatBox = ({ icon, label, value, color, delay }: any) => (
  <Animated.View 
    entering={FadeInUp.delay(delay).springify()}
    className="flex-1 items-center justify-center bg-white rounded-2xl p-4 border border-slate-100 shadow-sm mx-1"
  >
    <View className={`p-2 rounded-full mb-2 ${color.bg}`}>
      <MaterialCommunityIcons name={icon} size={20} color={color.text} />
    </View>
    <Text className="text-lg font-bold text-slate-800">{value}</Text>
    <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">{label}</Text>
  </Animated.View>
);

const InfoRow = ({ label, value, icon }: any) => (
  <View className="flex-row items-center justify-between py-3 border-b border-slate-50 last:border-0">
    <View className="flex-row items-center">
      <MaterialCommunityIcons name={icon} size={16} color={colors.slate[400]} />
      <Text className="ml-2 text-slate-500 font-medium">{label}</Text>
    </View>
    <Text className="text-slate-700 font-semibold">{value}</Text>
  </View>
);

// --- Main Page ---

export default function TopicDetailsPage() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { topicId } = useLocalSearchParams<{ id: string; topicId: string }>();
  const insets = useSafeAreaInsets();

  // Atoms
  const [topic] = useAtom(topicDetailsAtom);
  const [loading] = useAtom(loadingTopicDetailsAtom);
  const [error] = useAtom(errorTopicDetailsAtom);
  const fetchTopicDetails = useSetAtom(fetchTopicDetailsAtom);

  // Ads
  const [rewardedAdLoaded] = useAtom(rewardedAdLoadedAtom);
  const loadRewardedAd = useSetAtom(loadRewardedAdAtom);
  const showRewardedAd = useSetAtom(showRewardedAdAtom);
  const { shouldShowAds } = useProAccess();

  useEffect(() => {
    if (topicId) fetchTopicDetails(topicId, false);
  }, [topicId, fetchTopicDetails]);

  useFocusEffect(() => {
    if (shouldShowAds()) loadRewardedAd();
  });

  const handleTakeQuiz = async () => {
    if (!topic) return;
    if (shouldShowAds()) {
      await showRewardedAd();
    }
    router.push(`/topics/${topic._id}/quiz`);
  };

  // --- Loading State ---
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator size="large" color={colors.indigo[600]} />
        <Text className="mt-4 font-medium text-slate-500">Loading Content...</Text>
      </View>
    );
  }

  // --- Error State ---
  if (error || !topic) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 p-6">
        <View className="bg-red-50 p-6 rounded-full mb-6">
            <Ionicons name="alert-circle" size={48} color={colors.red[500]} />
        </View>
        <Text className="text-xl font-bold text-slate-800 text-center mb-2">
          {error || 'Topic Not Found'}
        </Text>
        <Text className="text-slate-500 text-center mb-8">
          We couldn&apost load the details for this topic.
        </Text>
        <Button
          title="Go Back"
          onPress={() => router.back()}
          className="bg-slate-800 px-8"
          textClassName="text-white"
          leftIcon="arrow-back"
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      <CustomHeader title="Topic Details" showBack />
      
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 140 }} 
        showsVerticalScrollIndicator={false}
      >
        {/* --- Hero Section --- */}
        <View className="px-6 mt-4 pt-6 pb-2">
            <Animated.View entering={FadeInDown.delay(100).springify()}>
                <View className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 relative overflow-hidden">
                    {/* Background Decor */}
                    <View className="absolute -right-10 -top-10 w-32 h-32 bg-indigo-50 rounded-full opacity-50" />
                    
                    <View className="flex-row justify-between items-start mb-4">
                        <View className="flex-1">
                             <Text className="text-2xl font-black text-slate-800 leading-tight mb-2">
                                {topic.topicName}
                            </Text>
                            <View className="flex-row gap-2 flex-wrap">
                                <View className={`px-2.5 py-1 rounded-full flex-row items-center ${topic.isActive ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                                    <View className={`w-1.5 h-1.5 rounded-full mr-1.5 ${topic.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                    <Text className={`text-[10px] font-bold uppercase ${topic.isActive ? 'text-emerald-700' : 'text-rose-700'}`}>
                                        {topic.isActive ? 'Active' : 'Inactive'}
                                    </Text>
                                </View>
                                {/* <View className={`px-2.5 py-1 rounded-full border ${topic.isPremium ? 'bg-amber-50 border-amber-100' : 'bg-blue-50 border-blue-100'}`}>
                                    <Text className={`text-[10px] font-bold uppercase ${topic.isPremium ? 'text-amber-700' : 'text-blue-700'}`}>
                                        {topic.isPremium ? 'Premium' : 'Free'}
                                    </Text>
                                </View> */}
                            </View>
                        </View>
                        <View className="bg-slate-50 p-3 rounded-xl">
                            <MaterialCommunityIcons name="book-open-page-variant" size={24} color={colors.indigo[500]} />
                        </View>
                    </View>

                    {/* Stats Grid */}
                    {topic.stats && (
                        <View className="flex-row gap-2 mt-4 pt-4 border-t border-slate-50">
                             <View className="flex-1 items-center">
                                <Text className="text-lg font-bold text-slate-800">{topic.questionCount || 0}</Text>
                                <Text className="text-[10px] text-slate-400 uppercase font-bold">Questions</Text>
                             </View>
                             <View className="w-[1px] h-full bg-slate-100" />
                             <View className="flex-1 items-center">
                                <Text className="text-lg font-bold text-slate-800">{Math.round(topic.stats.averageScore || 0)}%</Text>
                                <Text className="text-[10px] text-slate-400 uppercase font-bold">Avg Score</Text>
                             </View>
                             <View className="w-[1px] h-full bg-slate-100" />
                             <View className="flex-1 items-center">
                                <Text className="text-lg font-bold text-slate-800">{Math.round(topic.stats.completionRate || 0)}%</Text>
                                <Text className="text-[10px] text-slate-400 uppercase font-bold">Complete</Text>
                             </View>
                        </View>
                    )}
                </View>
            </Animated.View>
        </View>

        {/* --- Content / Notes Section --- */}
        <View className="px-6 mt-4">
            <Animated.View entering={FadeInDown.delay(200).springify()}>
                <Text className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Study Notes</Text>
                
                {topic.descriptionHtml ? (
                    <View className="bg-white rounded-[24px] p-5 shadow-sm border border-slate-100">
                        <RenderHtml
                            contentWidth={width - 88}
                            source={{ html: topic.descriptionHtml }}
                            customHTMLElementModels={customHTMLElementModels}
                            renderers={renderers}
                            tagsStyles={{
                                ...tagsStyles,
                                p: { fontSize: 16, lineHeight: 26, color: '#334155', marginBottom: 12 },
                                h1: { fontSize: 22, fontWeight: 'bold', color: '#1e293b', marginBottom: 10 },
                                h2: { fontSize: 20, fontWeight: 'bold', color: '#1e293b', marginBottom: 8 },
                                li: { fontSize: 16, lineHeight: 26, color: '#334155' }
                            }}
                            systemFonts={['System']}
                            defaultTextProps={{ selectable: false }}
                            ignoredDomTags={['colgroup', 'col', 'label']}
                        />
                    </View>
                ) : (
                    <View className="bg-white rounded-[24px] p-8 items-center border border-slate-100 border-dashed">
                        <MaterialCommunityIcons name="text-box-remove-outline" size={32} color={colors.slate[300]} />
                        <Text className="text-slate-400 mt-2 font-medium">No study notes available.</Text>
                    </View>
                )}
            </Animated.View>
        </View>

        {/* --- Metadata Section --- */}
        <View className="px-6 mt-6">
            <Animated.View entering={FadeInDown.delay(300).springify()}>
                <View className="bg-slate-100/50 rounded-2xl p-4 border border-slate-100">
                    <InfoRow 
                        label="Created Date" 
                        value={new Date(topic.createdAt).toLocaleDateString()} 
                        icon="calendar-plus" 
                    />
                    <InfoRow 
                        label="Last Updated" 
                        value={new Date(topic.updatedAt).toLocaleDateString()} 
                        icon="calendar-sync" 
                    />
                    <InfoRow 
                        label="Reference ID" 
                        value={topic._id.slice(-8).toUpperCase()} 
                        icon="identifier" 
                    />
                </View>
            </Animated.View>
        </View>

      </ScrollView>

      {/* --- Sticky Footer CTA --- */}
      <Animated.View 
        entering={FadeInUp.delay(500)}
        className="absolute bottom-0 w-full bg-white border-t border-slate-100 px-6 pt-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]"
        style={{ paddingBottom: insets.bottom + 10 }}
      >
        <Button
          title="Start Quiz"
          onPress={handleTakeQuiz}
          className="w-full bg-indigo-600 rounded-2xl py-4 shadow-lg shadow-indigo-200"
          textClassName="text-white font-bold text-lg"
          rightIcon="arrow-forward"
          disabled={!rewardedAdLoaded && shouldShowAds()}
          loading={!rewardedAdLoaded && shouldShowAds()}
        />
        <Text className="text-center text-[10px] text-slate-400 mt-3">
            {shouldShowAds() ? 'Ad supported • ' : ''}Ready to test your knowledge?
        </Text>
      </Animated.View>

    </View>
  );
}